var Mu = {
  // use the init method to set these values correctly
  _apiKey  : null,
  _session : null,
  _xdUrl   : null,

  // the various domains needed for using Connect
  _apiDomain     : window.location.protocol + '//api.facebook.com/',
  _connectDomain : window.location.protocol + '//www.connect.facebook.com/',
  _domain        : window.location.protocol + '//www.facebook.com/',

  // these are used the cross-domain communication and jsonp logic
  _callbacks  : {},
  _xdFrames   : {},
  _winCount   : 0,
  _winMonitor : null,



  /**
   * Initialize the library.
   *
   * @access public
   * @param apiKey  {String} your application API key
   * @param xdUrl   {String} URL to the xd.html file
   * @param session {Object} (optional) an existing session
   */
  init: function(apiKey, xdUrl, session) {
    // handle relative, absolute or fully qualified url
    if (xdUrl.indexOf(window.location.protocol) !== 0) {
      var base = window.location.protocol + '//' + window.location.host;
      if (xdUrl.charAt(0) == '/') {
        xdUrl = base + xdUrl;
      } else {
        var path = window.location.pathname;
        xdUrl = (
          base +
          path.substr(0, path.lastIndexOf('/') + 1) +
          xdUrl
        );
      }
    }
    // we should never be busting the cache
    if (xdUrl.indexOf('#') < 0) {
      xdUrl += '#';
    }

    Mu._apiKey  = apiKey;
    Mu._session = session;
    Mu._xdUrl   = xdUrl;
  },



  //
  // helper functions
  //

  /**
   * Copy stuff from one object to another.
   *
   * @access protected
   * @param target    {Object}  the target object to copy into
   * @param source    {Object}  the source object to copy from
   * @param overwrite {Boolean} indicate if we should overwrite
   * @returns the _same_ target object back
   */
  copy: function(target, source, overwrite) {
    for (var k in source) {
      if (source.hasOwnProperty(k) && (overwrite || !(k in target))) {
        target[k] = source[k];
      }
    }
    return target;
  },

  /**
   * Generates a weak random ID.
   *
   * @access private
   * @returns {String}  a random ID
   */
  guid: function() {
    return 'f' + (Math.random() * (1<<30)).toString(16).replace('.', '');
  },

  /**
   * Encode parameters to a query string.
   *
   * @access protected
   * @param   params {Object}  the parameters to encode
   * @param   sep    {String}  the separator string (defaults to '&')
   * @param   encode {Boolean} indicate if the key/values should be URI encoded
   * @returns        {String}  the query string
   */
  encodeQS: function(params, sep, encode) {
    sep    = sep === undefined ? '&' : sep;
    encode = encode === false ? function(s) { return s; } : encodeURIComponent;

    var
      pairs = [],
      k;

    for (k in params) {
      if (params.hasOwnProperty(k) &&
          params[k] !== null &&
          typeof params[k] != 'undefined') {
        pairs.push(encode(k) + '=' + encode(params[k]));
      }
    }
    pairs.sort();
    return pairs.join(sep);
  },

  /**
   * Decode a query string into a parameters object.
   *
   * @access protected
   * @param   str {String} the query string
   * @returns     {Object} the parameters to encode
   */
  decodeQS: function(str) {
    var
      decode = decodeURIComponent,
      params = {},
      parts  = str.split('&'),
      i,
      pair;

    for (i=0; i<parts.length; i++) {
      pair = parts[i].split('=', 2);
      params[decode(pair[0])] = decode(pair[1]);
    }

    return params;
  },

  /**
   * Builds and inserts a hidden iframe.
   *
   * @access private
   * @param url {String} the URL for the iframe
   * @param id  {String} the id to store the node against in _xdFrames
   */
  hiddenIframe: function(url, id) {
    var
      node  = document.createElement('iframe'),
      style = node.style;

    style.position = 'absolute';
    style.top      = style.left   = '-10000px';
    style.width    = style.height = 0;

    node.setAttribute('src', url);

    Mu._xdFrames[id] = document.body.appendChild(node);
  },

  /**
   * Open a popup window with the given url and dimensions and place it at the
   * center of the current window.
   *
   * @access private
   * @param url    {String}  the url for the popup
   * @param width  {Integer} the initial width for the popup
   * @param height {Integer} the initial height for the popup
   * @param id     {String}  the id to store the window against in _xdFrames
   */
  popup: function(url, width, height, id) {
    // we try to place it at the center of the current window
    var
      screenX    = typeof window.screenX      != 'undefined'
        ? window.screenX
        : window.screenLeft,
      screenY    = typeof window.screenY      != 'undefined'
        ? window.screenY
        : window.screenTop,
      outerWidth = typeof window.outerWidth   != 'undefined'
        ? window.outerWidth
        : document.body.clientWidth,
      outerHeight = typeof window.outerHeight != 'undefined'
        ? window.outerHeight
        : (document.body.clientHeight - 22),
      left     = parseInt(screenX + ((outerWidth - width) / 2), 10),
      top      = parseInt(screenY + ((outerHeight - height) / 2.5), 10),
      features = (
        'width=' + width +
        ',height=' + height +
        ',left=' + left +
        ',top=' + top
      );

    Mu._xdFrames[id] = window.open(url, '_blank', features);

    // if there's a default close action, setup the monitor for it
    if (id in Mu._callbacks) {
      Mu._winCount++;
      Mu.winMonitor();
    }
  },

  /**
   * Start and manage the window monitor interval. This allows us to invoke the
   * default callback for a window when the user closes the window directly.
   *
   * @access private
   */
  winMonitor: function() {
    // shutdown if we have nothing to monitor
    if (Mu._winCount < 1) {
      window.clearInterval(Mu._winMonitor);
      Mu._winMonitor = null;
      return;
    }

    // start the monitor if its not already running
    if (!Mu._winMonitor) {
      Mu._winMonitor = window.setInterval(Mu.winMonitor, 100);
    }

    // check all open windows
    for (var id in Mu._xdFrames) {
      // ignore prototype properties, and ones without a default callback
      if (Mu._xdFrames.hasOwnProperty(id) && id in Mu._callbacks) {
        var win = Mu._xdFrames[id];

        // ignore iframes
        try {
          if (win.tagName) {
            // is an iframe, we're done
            continue;
          }
        } catch (x) {
          // do nothing
        }

        // found a closed window
        if (win.closed) {
          Mu._winCount--;
          Mu.xdRecv({ cb: id, frame: id });
        }
      }
    }
  },



  //
  // the cross domain communication layer
  //

  /**
   * Builds a url attached to a callback for xd messages.
   *
   * This is one half of the XD layer. Given a callback function, we generate a
   * xd URL which will invoke the function. This allows us to generate redirect
   * urls (used for next/cancel and so on) which will invoke our callback
   * functions.
   *
   * @access private
   * @param cb     {Function} the callback function
   * @param frame  {String}   the frame id for the callback will be used with
   * @param target {String}   parent or opener to indicate the window relation
   * @param id     {String}   custom id for this callback. defaults to frame id
   * @returns      {String}   the xd url bound to the callback
   */
  xdHandler: function(cb, frame, target, id) {
    id = id || frame;
    Mu._callbacks[id] = cb;
    return Mu._xdUrl + Mu.encodeQS({
      frame  : frame,
      cb     : id,
      target : target || 'opener'
    });
  },

  /**
   * This function is invoked internally by the xd.html file. It parses the
   * url, and uses the target value to pass on the parameters to xdRecv in the
   * original window.
   *
   * @access private
   * @param href {String}  the full url including the fragment
   */
  xdChild: function(href) {
    // FIXME on fb side
    // merge the query and fragment params because the session can be returned
    // in either.
    var
      merged = href.replace('?', '&').replace('#', '&'),
      params = Mu.decodeQS(merged.substr(merged.indexOf('&') + 1));

    // silently do nothing when target is missing
    if ('target' in params) {
      window[params.target].Mu.xdRecv(params);
    }
  },

  /**
   * After the xdChild function has done the minimal processing to find the
   * target window, it passes the parameters onto this function to let it
   * invoke the bound callback with the params and remove to window/frame.
   *
   * @access private
   * @param params {Object} the parameters passed on by xdChild
   */
  xdRecv: function(params) {
    var
      frame = Mu._xdFrames[params.frame],
      cb    = Mu._callbacks[params.cb],
      clear = false;

    // remove an iframe or close a popup window
    try {
      if (frame.tagName) {
        clear = true;

        // timeout of 500 prevents the safari forever waiting bug if we end up
        // using this for visible iframe dialogs, the 500 would be unacceptable
        window.setTimeout(function() {
                            frame.parentNode.removeChild(frame);
                          }, 500);
      }
    } catch (x) {
      // do nothing, is expected
    }

    // is a popup window
    if (!clear && frame.close) {
      frame.close();
    }

    // cleanup and fire
    delete Mu._xdFrames[params.frame];
    delete Mu._callbacks[params.cb];
    cb(params);
  },

  /**
   * Some Facebook redirect URLs use a special 'xxRESULTTOKENxx' to return
   * custom values. This is a convenience function to wrap a callback that
   * expects this value back.
   *
   * @access private
   * @param cb     {Function} the callback function
   * @param frame  {String}   the frame id for the callback will be used with
   * @param target {String}   parent or opener to indicate the window relation
   * @param id     {String}   custom id for this callback. defaults to frame id
   * @returns      {String}   the xd url bound to the callback
   */
  xdResult: function(cb, frame, target, id) {
    return Mu.xdHandler(function(params) {
      cb(params.result != 'xxRESULTTOKENxx' && params.result);
    }, frame, target, id) + '&result=xxRESULTTOKENxx';
  },

  /**
   * This handles receiving a session from:
   *  - login_status.php
   *  - login.php
   *  - tos.php
   * It also (optionally) handles the xxRESULTTOKENxx response from:
   *  - prompt_permissions.php
   * And calls the given callback with the (session, perms)
   *
   * @access private
   * @param cb     {Function} the callback function
   * @param frame  {String}   the frame id for the callback will be used with
   * @param target {String}   parent or opener to indicate the window relation
   * @param id     {String}   custom id for this callback. defaults to frame id
   * @returns      {String}   the xd url bound to the callback
   */
  xdSession: function(cb, frame, target, id) {
    return Mu.xdHandler(function(params) {
      // try to extract a session
      try {
        Mu._session = JSON.parse(params.session);
      } catch(e) {
        Mu._session = null;
      }

      // incase we were granted some new permissions
      var perms = params.result != 'xxRESULTTOKENxx' && params.result;

      // if we were just granted the offline_access permission, we refresh the
      // session information before calling the user defined callback
      if (perms && perms.indexOf('offline_access') > -1) {
        Mu.status(function(session) { cb(session, perms); });
      } else {
        // user defined callback
        cb(Mu._session, perms);
      }
    }, frame, target, id) + '&result=xxRESULTTOKENxx';
  },



  //
  // status and logut are hidden iframes, as they do not involve user
  // interaction. others are popup windows.
  //

  /**
   * Find out the current status from the server, and get a session if the user
   * is connected. The callback is invoked with (session).
   *
   * @access public
   * @param cb {Function} the callback function
   */
  status: function(cb) {
    var
      g     = Mu.guid(),
      xdUrl = Mu.xdSession(cb, g, 'parent'),
      url   = Mu._connectDomain + 'extern/login_status.php?' + Mu.encodeQS({
        api_key    : Mu._apiKey,
        no_session : xdUrl,
        no_user    : xdUrl,
        ok_session : xdUrl
      });

    Mu.hiddenIframe(url, g);
  },

  /**
   * Login/Authorize/Permissions.
   *
   * The callback is invoked with (session, permissions).
   *
   * @access public
   * @param cb    {Function} the callback function
   * @param perms {String}   (optional) comma separated list of permissions
   */
  login: function(cb, perms) {
    var
      g   = Mu.guid(),
      url = Mu._domain + 'login.php?' + Mu.encodeQS({
        api_key        : Mu._apiKey,
        // if we already have a session, dont lose it if the user cancels
        cancel_url     : Mu.xdResult(function(p) { cb(Mu.session(), p); }, g),
        display        : 'popup',
        fbconnect      : 1,
        next           : Mu.xdSession(cb, g, 'opener', Mu.guid()),
        req_perms      : perms,
        return_session : 1,
        v              : '1.0'
      });

    Mu.popup(url, 450, 415, g);
  },

  /**
   * Logout the user in the background using a hidden iframe.
   *
   * @access public
   * @param cb    {Function} the callback function
   */
  logout: function(cb) {
    var
      g   = Mu.guid(),
      url = Mu._domain + 'logout.php?' + Mu.encodeQS({
        api_key     : Mu._apiKey,
        next        : Mu.xdSession(cb, g, 'parent'),
        session_key : Mu._session.session_key
      });

    Mu.hiddenIframe(url, g);
  },

  /**
   * Make an API call and revoke the user's authorization with your
   * application.
   *
   * @access public
   * @param cb    {Function} the callback function
   */
  disconnect: function(cb) {
    Mu.api({ method: 'Auth.revokeAuthorization' }, function(response) {
      cb(Mu._session = null);
    });
  },

  /**
   * Share a given URL with the specified title.
   *
   * This call can be used without requiring the user to sign in.
   *
   * @access public
   * @param u     {String} the url (defaults to current URL)
   * @param title {String} a custom title
   */
  share: function(u, title) {
    var
      url = Mu._domain + 'sharer.php?' + Mu.encodeQS({
        title : title,
        u     : u || window.location.toString()
      });

    Mu.popup(url, 575, 380);
  },

  /**
   * Publish a post to the stream.
   *
   * This is the preferred way of providing content from your application into
   * the Facebook News Feed or The Stream. This function can be used without
   * requiring a user to login or even having an API key.
   *
   * If you have a registered application, you may fist call Mu.init with your
   * API key if you want the Application Icon and attribution to show up. You
   * must also do this if you wish to use the callback to get notified of the
   * post_id of the published post, or find out if the user did not publish
   * (clicked on the skipped button).
   *
   * All parameters are optional.
   *
   * FIXME: the callback function does not get invoked.
   *
   * @access public
   * @param message        {String}   this allows prepopulating the message
   * @param attach         {Array}    an array of attachments
   * @param actions        {Array}    an array of action links
   * @param target_id      {String}   a target profile id
   * @param prompt_message {String}   custom prompt message
   * @param cb             {Function} called with the result of the action
   */
  publish: function(message, attach, actions, target_id, prompt_message, cb) {
    var
      g   = Mu._apiKey && Mu.guid(),
      url = Mu._domain + 'connect/prompt_feed.php?' + Mu.encodeQS({
        action_links        : JSON.stringify(actions || {}),
        api_key             : Mu._apiKey,
        attachment          : JSON.stringify(attach || {}),
        callback            : g && Mu.xdResult(cb, g),
        message             : message,
        preview             : 1,
        session_key         : Mu._session && Mu._session.session_key,
        target_id           : target_id,
        user_message_prompt : prompt_message
      });

    Mu.popup(url, 550, 242, g);
  },

  /**
   * Prompt the user to add the given id as a friend.
   *
   * @access public
   * @param id {String}   the id of the target user
   * @param cb {Function} called with the result of the action
   */
  addFriend: function(id, cb) {
    var
      g   = Mu.guid(),
      url = Mu._domain + 'addfriend.php?' + Mu.encodeQS({
        api_key     : Mu._apiKey,
        display     : 'dialog',
        id          : id,
        next        : Mu.xdResult(cb, g),
        session_key : Mu._session.session_key
      });

    Mu.popup(url, 565, 240, g);
  },

  /**
   * Sign the given params and prepare them for an API call, either using an
   * explicit secret or using the current session. It updates the given params
   * object _in place_ with the necessary parameters.
   *
   * @access protected
   * @param params {Object} the parameters to sign
   * @param secret {String} secret to sign the call (defaults to the current
   *                        session secret)
   * @returns the _same_ params object back
   */
  sign: function(params, secret) {
    // general api call parameters
    Mu.copy(params, {
      api_key : Mu._apiKey,
      call_id : (new Date()).getTime(),
      format  : 'json',
      v       : '1.0'
    });

    // if an explicit secret was not given, and we have a session, we will
    // automatically sign using the session. if a explicit secret is given, we
    // do not nclude these session specific parameters.
    if (!secret && Mu._session) {
      Mu.copy(params, {
        session_key : Mu._session.session_key,
        ss          : 1
      });
    }

    // optionally generate the signature. we do this for both the automatic and
    // explicit case.
    if (secret || Mu._session) {
      // the signature is described at:
      // http://wiki.developers.facebook.com/index.php/Verifying_The_Signature
      params.sig = md5sum(
        Mu.encodeQS(params, '', false) +
        (secret || Mu._session.secret)
      );
    }

    return params;
  },

  /**
   * Make a API call to restserver.php. This call will be automatically signed
   * if a session is available. The call is made using JSONP, which is
   * restricted to a GET with a maximum payload of 2k (including the signature
   * and other params).
   *
   * @access public
   * @param params {Object}   the parameters for the query
   * @param cb     {Function} the callback function to handle the response
   * @param secret {String}   secret to sign the call (defaults to the current
   *                          session secret)
   */
  api: function(params, cb, secret) {
    var
      g      = Mu.guid(),
      script = document.createElement('script');

    // shallow clone of params, add callback and sign
    params = Mu.sign(Mu.copy({callback: 'Mu._callbacks.' + g}, params), secret);

    // this is the JSONP callback invoked by the response from restserver.php
    Mu._callbacks[g] = function(response) {
      cb(response);
      delete Mu._callbacks[g];
      script.parentNode.removeChild(script);
    };

    script.src = Mu._apiDomain + 'restserver.php?' + Mu.encodeQS(params);
    document.getElementsByTagName('head')[0].appendChild(script);
  },

  /**
   * Accessor for the current Session.
   *
   * @access public
   * @returns {Object}  the current Session if available, null otherwise
   */
  session: function() {
    return Mu._session;
  }
};
