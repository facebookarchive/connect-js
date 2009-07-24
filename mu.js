Mu = {
  // use the init method to set these values correctly
  ApiKey  : null,
  Session : null,
  XdUrl   : null,

  // the various domains needed for using Connect
  ApiDomain     : 'http://api.facebook.com/',
  ConnectDomain : 'http://www.connect.facebook.com/',
  Domain        : 'http://www.facebook.com/',

  // these are used the cross-domain communication and jsonp logic
  Callbacks     : {},
  XdFrames      : {},



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
    if (xdUrl.indexOf('http') !== 0) {
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

    Mu.ApiKey  = apiKey;
    Mu.Session = session;
    Mu.XdUrl   = xdUrl;
  },



  //
  // helper functions
  //

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
   * @param {String}  url the URL for the iframe
   * @param {String}  id  the id to store the node against in XdFrames
   */
  hiddenIframe: function(url, id) {
    var
      node  = document.createElement('iframe'),
      style = node.style;

    style.position = 'absolute';
    style.top      = style.left   = '-10000px';
    style.width    = style.height = 0;

    node.setAttribute('src', url);

    Mu.XdFrames[id] = document.body.appendChild(node);
  },

  /**
   * Open a popup window with the given url and dimensions and place it at the
   * center of the current window.
   *
   * @access private
   * @param url    {String}  the url for the popup
   * @param width  {Integer} the initial width for the popup
   * @param height {Integer} the initial height for the popup
   * @param id     {String}  the id to store the window against in XdFrames
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

    Mu.XdFrames[id] = window.open(url, '_blank', features);
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
   * @returns      {String}   the xd url bound to the callback
   */
  xdHandler: function(cb, frame, target) {
    var g = Mu.guid();
    Mu.Callbacks[g] = cb;
    return Mu.XdUrl + Mu.encodeQS({
      frame  : frame,
      cb     : g,
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
      frame = Mu.XdFrames[params.frame],
      cb    = Mu.Callbacks[params.cb];

    // remove an iframe or close a popup window
    if (frame.tagName) {
      // timeout of 500 prevents the safari forever waiting bug if we end up
      // using this for visible iframe dialogs, the 500 would be unacceptable
      window.setTimeout(function() {
        frame.parentNode.removeChild(frame);
      }, 500);
    } else {
      frame.close();
    }

    // cleanup and fire
    delete Mu.XdFrames[params.frame];
    delete Mu.Callbacks[params.cb];
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
   * @returns      {String}   the xd url bound to the callback
   */
  xdResult: function(cb, frame, target) {
    return Mu.xdHandler(function(params) {
      cb(params.result != 'xxRESULTTOKENxx' && params.result);
    }, frame, target) + '&result=xxRESULTTOKENxx';
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
   * @returns      {String}   the xd url bound to the callback
   */
  xdSession: function(cb, frame, target) {
    return Mu.xdHandler(function(params) {
      // try to extract a session
      try {
        Mu.Session = JSON.parse(params.session);
      } catch(e) {
        Mu.Session       = null;
      }

      // user defined callback
      cb(Mu.Session, params.result != 'xxRESULTTOKENxx' && params.result);
    }, frame, target) + '&result=xxRESULTTOKENxx';
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
      g   = Mu.guid(),
      url = Mu.ConnectDomain + 'extern/login_status.php?' + Mu.encodeQS({
        api_key    : Mu.ApiKey,
        no_session : Mu.xdSession(cb, g, 'parent'),
        no_user    : Mu.xdSession(cb, g, 'parent'),
        ok_session : Mu.xdSession(cb, g, 'parent')
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
      url = Mu.Domain + 'login.php?' + Mu.encodeQS({
        api_key        : Mu.ApiKey,
        cancel_url     : Mu.xdSession(cb, g),
        display        : 'popup',
        fbconnect      : 1,
        next           : Mu.xdSession(cb, g),
        req_perms      : perms,
        return_session : 1,
        v              : '1.0'
      });

    Mu.popup(url, 450, 415, g);
  },

  // log the user out in the background
  logout: function(cb) {
    var
      g   = Mu.guid(),
      url = Mu.Domain + 'logout.php?' + Mu.encodeQS({
        api_key     : Mu.ApiKey,
        next        : Mu.xdSession(cb, g, 'parent'),
        session_key : Mu.Session.session_key
      });

    Mu.hiddenIframe(url, g);
  },

  // make an _API_ call (this is not a iframe or a popup)
  disconnect: function(cb) {
    Mu.api({ method: 'Auth.revokeAuthorization' }, function(response) {
      cb(Mu.Session = null);
    });
  },

  // let the user share the specified (or default current) url
  share: function(u, title) {
    var
      url = Mu.Domain + 'sharer.php?' + Mu.encodeQS({
        title : title || '',
        u     : u || window.location.toString()
      });

    Mu.popup(url, 575, 380);
  },

  // publish to the stream
  publish: function(message, attach, actions, target_id, prompt_message) {
    var
      url = Mu.Domain + 'connect/prompt_feed.php?' + Mu.encodeQS({
        action_links        : actions ? JSON.stringify(actions) : null,
        api_key             : Mu.ApiKey,
        attachment          : attach ? JSON.stringify(attach) : null,
        message             : message,
        preview             : true,
        session_key         : Mu.Session ? Mu.Session.session_key : null,
        target_id           : target_id,
        user_message_prompt : prompt_message
      });

    Mu.popup(url, 550, 242);
  },

  // add friend
  addFriend: function(id, cb) {
    var
      g   = Mu.guid(),
      url = Mu.Domain + 'addfriend.php?' + Mu.encodeQS({
        api_key     : Mu.ApiKey,
        display     : 'dialog',
        id          : id,
        next        : Mu.xdResult(cb, g),
        session_key : Mu.Session.session_key
      });

    Mu.popup(url, 565, 240, g);
  },



  //
  // this allows making siged API calls using JSONP. make sure you understand
  // JSONP limitations.
  //

  // make an api call
  api: function(params, cb) {
    var
      g      = Mu.guid(),
      script = document.createElement('script'),
      k,

      // general signed api call parameters
      signed = {
        api_key     : Mu.ApiKey,
        call_id     : (new Date()).getTime(),
        callback    : 'Mu.Callbacks.' + g,
        format      : 'json',
        session_key : Mu.Session.session_key,
        ss          : 1,
        v           : '1.0'
      };

    for (k in params) {
      if (params.hasOwnProperty(k)) {
        signed[k] = params[k];
      }
    }

    // the signature is described at:
    // http://wiki.developers.facebook.com/index.php/Verifying_The_Signature
    signed.sig = md5sum(Mu.encodeQS(signed, '', false) + Mu.Session.secret);

    // this is the JSONP callback invoked by the response from restserver.php
    Mu.Callbacks[g] = function(response) {
      cb(response);
      delete Mu.Callbacks[g];
      script.parentNode.removeChild(script);
    };

    script.src = Mu.ApiDomain + 'restserver.php?' + Mu.encodeQS(signed);
    document.getElementsByTagName('head')[0].appendChild(script);
  }
};
