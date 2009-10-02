/**
 * Mu is a JavaScript library that provides Facebook Connect
 * integration.
 *
 * @module Mu
 */

/**
 * This is the top level for all the APIs.
 *
 * @class Mu
 * @static
 * @access public
 */
var Mu = {
  // use the init method to set these values correctly
  _apiKey    : null,
  _session   : null,
  _userState : 'unknown', // or 'disconnected' or 'connected'

  // the various domains needed for using Connect
  _domain: {
    api : window.location.protocol + '//api.facebook.com/',
    cdn : window.location.protocol + '//static.ak.fbcdn.net/',
    www : window.location.protocol + '//www.facebook.com/'
  },

  // these are used the cross-domain communication and jsonp logic
  _callbacks: {},

  // session status change subscribers
  _sessionCallbacks: [],

  // "dynamic constants"
  _registry: {
    // minimum required flash versions
    flashVersions: [
      [9,  0, 159, 0],
      [10, 0, 22,  87]
    ]
  },



  /**
   * Initialize the library::
   *
   *    <div id="mu-root"></div>
   *    <script src="http://mu.daaku.org/m.js"></script>
   *    <script>
   *      Mu.init({ apiKey: 'YOUR API KEY' });
   *    </script>
   *
   * The best place to put this code is right before the closing </body> tag.
   *
   *
   * Options:
   *
   * ======== ======= ============================= ============ =============
   * Property Type    Description                   Argument     Default Value
   * ======== ======= ============================= ============ =============
   * apiKey   String  your application API key      **Required**
   * cookie   Boolean true to enable cookie support *Optional*   ``false``
   * session  Object  use specified session object  *Optional*   ``null``
   * status   Boolean true to fetch fresh status    *Optional*   ``false``
   * ======== ======= ============================= ============ =============
   *
   * *Note*: `Mu.publish()`_ and `Mu.share()`_ can be used without
   * registering an application or calling this method.
   *
   * .. _Mu.publish(): #method_publish
   * .. _Mu.share(): #method_share
   *
   * @access public
   * @param opts    {Object} options
   */
  init: function(opts) {
    Mu._apiKey = opts.apiKey;

    // enable cookie support and use cookie session if possible
    if (opts.cookie) {
      opts.session = opts.session || Mu.Cookie.init();
    }

    // set the given or cookie session
    Mu.setSession(opts.session, opts.session ? 'connected' : 'unknown', true);

    // initialize the XD layer
    Mu.XD.init();

    // fetch a fresh status from facebook.com if requested
    if (opts.status) {
      Mu.status();
    }
  },



  //
  // helper functions
  //

  /**
   * Copy stuff from one object to another.
   *
   * @access private
   * @param target    {Object}  the target object to copy into
   * @param source    {Object}  the source object to copy from
   * @param overwrite {Boolean} indicate if we should overwrite
   * @returns {Object} the *same* target object back
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
   * Query String encoding & decoding.
   *
   * @class Mu.QS
   * @static
   * @for Mu
   * @access private
   */
  QS: {
    /**
     * Encode parameters to a query string.
     *
     * @access private
     * @param   params {Object}  the parameters to encode
     * @param   sep    {String}  the separator string (defaults to '&')
     * @param   encode {Boolean} indicate if the key/value should be URI encoded
     * @returns        {String}  the query string
     */
    encode: function(params, sep, encode) {
      sep    = sep === undefined ? '&' : sep;
      encode = encode === false ? function(s) {return s;} : encodeURIComponent;

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
     * @access private
     * @param   str {String} the query string
     * @returns     {Object} the parameters to encode
     */
    decode: function(str) {
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
    }
  },



  /**
   * "Content" is a very flexible term. Helpers for things like hidden
   * DOM content, iframes and popups.
   *
   * @class Mu.Content
   * @static
   * @for Mu
   * @access private
   */
  Content: {
    _root       : null,
    _hiddenRoot : null,
    _winMonitor : null,
    _winCount   : 0,
    _xdFrames   : {},

    /**
     * Append some content.
     *
     * @access private
     * @param content {String|Node} a DOM Node or HTML string
     * @param root    {Node}        (optional) a custom root node
     * @returns {Node} the node that was just appended
     */
    append: function(content, root) {
      // setup the root node, creating it if necessary
      if (!root) {
        if (!Mu.Content._root) {
          root = document.getElementById('mu-root');
          if (!root) {
            root = document.createElement('div');
            root.id = 'mu-root';
            Mu.Content._root = document.body.appendChild(root);
          }
        } else {
          root = Mu.Content._root;
        }
      }

      if (typeof content == 'string') {
        var div = document.createElement('div');
        root.appendChild(div).innerHTML = content;
        return div;
      } else {
        return root.appendChild(content);
      }
    },

    /**
     * Append some hidden content.
     *
     * @access private
     * @param content {String|Node} a DOM Node or HTML string
     * @returns {Node} the node that was just appended
     */
    hidden: function(content) {
      if (!Mu.Content._hiddenRoot) {
        var
          hiddenRoot = document.createElement('div'),
          style      = hiddenRoot.style;
        style.position = 'absolute';
        style.top      = '-10000px';
        style.width    = style.height = 0;
        Mu.Content._hiddenRoot = Mu.Content.append(hiddenRoot);
      }

      return Mu.Content.append(content, Mu.Content._hiddenRoot);
    },

    /**
     * Builds and inserts a hidden iframe.
     *
     * @access private
     * @param url {String} the URL for the iframe
     * @param id  {String} the id to store the node against in _xdFrames
     */
    hiddenIframe: function(url, id) {
      var node = document.createElement('iframe');
      // In IE, we must set the iframe src _before_ injecting the node into the
      // document to prevent the click noise.
      if (document.attachEvent) {
        node.setAttribute('src', url);
      }
      Mu.Content._xdFrames[id] = Mu.Content.hidden(node);
      // For Firefox, we must set the iframe src _after_ injecting the node into
      // the document to prevent caching issues. This also works fine in other
      // browsers.
      if (!document.attachEvent) {
        node.setAttribute('src', url);
      }
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

      Mu.Content._xdFrames[id] = window.open(url, '_blank', features);

      // if there's a default close action, setup the monitor for it
      if (id in Mu._callbacks) {
        Mu.Content._winCount++;
        Mu.Content.winMonitor();
      }
    },

    /**
     * Start and manage the window monitor interval. This allows us to invoke
     * the default callback for a window when the user closes the window
     * directly.
     *
     * @access private
     */
    winMonitor: function() {
      // shutdown if we have nothing to monitor
      if (Mu.Content._winCount < 1) {
        window.clearInterval(Mu.Content._winMonitor);
        Mu.Content._winMonitor = null;
        return;
      }

      // start the monitor if its not already running
      if (!Mu.Content._winMonitor) {
        Mu.Content._winMonitor = window.setInterval(Mu.Content.winMonitor, 100);
      }

      // check all open windows
      for (var id in Mu.Content._xdFrames) {
        // ignore prototype properties, and ones without a default callback
        if (Mu.Content._xdFrames.hasOwnProperty(id) && id in Mu._callbacks) {
          var win = Mu.Content._xdFrames[id];

          // ignore iframes
          try {
            if (win.tagName) {
              // is an iframe, we're done
              continue;
            }
          } catch (x) {
            // probably a permission error
          }

          try {
            // found a closed window
            if (win.closed) {
              Mu.Content._winCount--;
              Mu.XD.recv({ cb: id, frame: id });
            }
          } catch(x) {
            // probably a permission error
          }
        }
      }
    }
  },



  /**
   * Flash Support.
   *
   * @class Mu.Flash
   * @static
   * @for Mu
   * @access private
   */
  Flash: {
    _callbacks: [],

    /**
     * Initialize the SWF.
     *
     * @access private
     */
    init: function() {
      // only initialize once
      if (Mu.Flash._init) {
        return;
      }
      Mu.Flash._init = true;

      // the SWF calls this global function to notify that its ready
      // FIXME: should allow the SWF to take a flashvar that controls the name
      // of this function. we should not have any globals other than Mu.
      window.FB_OnFlashXdCommReady = function() {
        Mu.Flash._ready = true;
        for (var i=0, l=Mu.Flash._callbacks.length; i<l; i++) {
          Mu.Flash._callbacks[i]();
        }
        Mu.Flash._callbacks = [];
      };

      // the SWF calls this global function when a HTTP response is available
      // FIXME: remove global
      window.FB_OnXdHttpResult = function(reqId, data) {
        Mu._callbacks[reqId](Mu.Flash.decode(data));
      };

      // create the swf
      var
        IE   = !!document.attachEvent,
        swf  = Mu._domain.cdn + 'swf/XdComm.swf',
        html = (
          '<object ' +
            'type="application/x-shockwave-flash" ' +
            'id="XdComm" ' +
            (IE ? 'name="XdComm" ' : '') +
            (IE ? '' : 'data="' + swf + '" ') +
            (IE
                ? 'classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" '
                : ''
            ) +
            'allowscriptaccess="always">' +
            '<param name="movie" value="' + swf + '"></param>' +
            '<param name="allowscriptaccess" value="always"></param>' +
          '</object>'
        );

      Mu.Content.hidden(html);
    },

    /**
     * Check that the minimal version of Flash we need is available.
     *
     * @access private
     * @returns {Boolean} true if the minimum version requirements are matched
     */
    hasMinVersion: function() {
      if (typeof Mu.Flash._hasMinVersion === 'undefined') {
        var
          versionString,
          version = [];
        try {
          versionString = new ActiveXObject('ShockwaveFlash.ShockwaveFlash')
                            .GetVariable('$version');
        } catch(x) {
          var mimeType = 'application/x-shockwave-flash';
          if (navigator.mimeTypes[mimeType].enabledPlugin) {
            var name = 'Shockwave Flash';
            versionString = (navigator.plugins[name + ' 2.0'] ||
                             navigator.plugins[name])
                            .description;
          }
        }

        // take the string and come up with an array of integers:
        //   [10, 0, 22]
        if (versionString) {
          var parts = versionString
                        .replace(/\D+/g, ',')
                        .match(/^,?(.+),?$/)[1]
                        .split(',');
          for (var i=0, l=parts.length; i<l; i++) {
            version.push(parseInt(parts[i], 10));
          }
        }

        // start by assuming we dont have the min version.
        Mu.Flash._hasMinVersion = false;

        // look through all the allowed version definitions.
        majorVersion:
        for (var i=0, l=Mu._registry.flashVersions.length; i<l; i++) {
          var acceptable = Mu._registry.flashVersions[i];

          // we only accept known major versions, and every supported major
          // version has at least one entry in flashVersions. only if the major
          // version matches, does the rest of the check make sense.
          if (acceptable[0] != version[0]) {
            continue;
          }

          // the rest of the version components must be equal or higher
          for (var m=1, n=acceptable.length, o=version.length; m<n, m<o; m++) {
            if (version[m] < acceptable[m]) {
              continue majorVersion;
            }
          }

          // if we get here, all available version information says we're good.
          Mu.Flash._hasMinVersion = true;
        }
      }

      return Mu.Flash._hasMinVersion;
    },

    /**
     * Register a function that needs to ensure Flash is ready.
     *
     * @access private
     * @param cb {Function} the function
     */
    onReady: function(cb) {
      Mu.Flash.init();
      if (Mu.Flash._ready) {
        // this forces the cb to be asynchronous to ensure no one relies on the
        // _potential_ synchronous nature.
        window.setTimeout(cb, 0);
      } else {
        Mu.Flash._callbacks.push(cb);
      }
    },

    /**
     * Custom decoding to workaround bug in flash's ExternInterface
     * Code is from Dojo's library.
     *
     * FIXME should check if encodeURIComponent can be used instead.
     *
     * @param  {String} data
     * @returns  String
     */
    decode: function(data) {
      // wierdly enough, Flash sometimes returns the result as an
      // 'object' that is actually an array, rather than as a String;
      // detect this by looking for a length property; for IE
      // we also make sure that we aren't dealing with a typeof string
      // since string objects have length property there
      if (data && data.length && typeof data != 'string') {
        data = data[0];
      }

      if (!data || typeof data != 'string') {
        return data;
      }

      // certain XMLish characters break Flash's wire serialization for
      // ExternalInterface; these are encoded on the
      // DojoExternalInterface side into a custom encoding, rather than
      // the standard entity encoding, because otherwise we won't be able to
      // differentiate between our own encoding and any entity characters
      // that are being used in the string itself
      data = data.replace(/\&custom_lt\;/g, '<');
      data = data.replace(/\&custom_gt\;/g, '>');
      data = data.replace(/\&custom_backslash\;/g, '\\');

      // needed for IE; \0 is the NULL character
      data = data.replace(/\\0/g, "\0");
      return data;
    },

    /**
     * Make a API call to restserver.php using Flash.
     *
     * @access private
     * @param params {Object}   the parameters for the query
     * @param cb     {Function} the callback function to handle the response
     * @param secret {String}   secret to sign the call (defaults to the current
     * session secret)
     */
    api: function(params, cb, secret) {
      Mu.Flash.onReady(function() {
        var method, url, body, reqId;

        // shallow clone of params, sign, and encode as query string
        body = Mu.QS.encode(Mu.sign(Mu.copy({}, params), secret));
        url = Mu._domain.api + 'restserver.php';

        // GET or POST
        if (url.length + body.length > 2000) {
          method = 'POST';
        } else {
          method = 'GET';
          url += '?' + body;
          body = '';
        }

        // fire the request
        reqId = document.XdComm.sendXdHttpRequest(method, url, body, null);

        // callback
        Mu._callbacks[reqId] = function(response) {
          cb(JSON.parse(Mu.Flash.decode(response)));
          delete Mu._callbacks[reqId];
        };
      });
    }
  },



  /**
   * The cross domain communication layer.
   *
   * @class Mu.XD
   * @static
   * @for Mu
   * @access private
   */
  XD: {
    _origin      : null,
    _transport   : null,
    _resultToken : '"xxRESULTTOKENxx"',

    /**
     * Initialize the XD layer. Native postMessage or Flash is required.
     *
     * @access private
     */
    init: function() {
      // The origin is used for:
      // 1) postMessage origin, provides security
      // 2) Flash Local Connection name
      // It is required and validated by Facebook as part of the xd_proxy.php.
      Mu.XD._origin = (
        window.location.protocol +
        '//' +
        window.location.host +
        '/' +
        Mu.guid()
      );

      // We currently disable postMessage in IE8 because it does not work with
      // window.opener. We can probably be smarter about it.
      if (window.addEventListener && window.postMessage) {
        Mu.XD.PostMessage.init();
        Mu.XD._transport = 'postmessage';
      } else if (Mu.Flash.hasMinVersion()) {
        Mu.XD.Flash.init();
        Mu.XD._transport = 'flash';
      } else {
        throw new Error('Could not find postMessage or Flash.');
      }
    },

    /**
     * Builds a url attached to a callback for xd messages.
     *
     * This is one half of the XD layer. Given a callback function, we generate
     * a xd URL which will invoke the function. This allows us to generate
     * redirect urls (used for next/cancel and so on) which will invoke our
     * callback functions.
     *
     * @access private
     * @param cb       {Function} the callback function
     * @param frame    {String}   frame id for the callback will be used with
     * @param relation {String}   parent or opener to indicate window relation
     * @param id       {String}   custom id for callback. defaults to frame id
     * @returns        {String}   the xd url bound to the callback
     */
    handler: function(cb, frame, relation, id) {
      // the ?=& tricks login.php into appending at the end instead
      // of before the fragment as a query string
      // FIXME
      var xdProxy = Mu._domain.cdn + 'connect/xd_proxy.php#?=&';
      id = id || frame;
      Mu._callbacks[id] = cb;
      return xdProxy + Mu.QS.encode({
        cb        : id,
        frame     : frame,
        origin    : Mu.XD._origin,
        relation  : relation || 'opener',
        transport : Mu.XD._transport
      });
    },

    /**
     * Handles the raw or parsed message and invokes the bound callback with
     * the data and removes the related window/frame.
     *
     * @access private
     * @param data {String|Object} the message fragment string or parameters
     */
    recv: function(data) {
      if (typeof data == 'string') {
        data = Mu.QS.decode(data);
      }

      var
        frame = Mu.Content._xdFrames[data.frame],
        cb    = Mu._callbacks[data.cb];

      // iframe
      try {
        if (frame.tagName) {
          // timeout of 500 prevents the safari forever waiting bug if we end
          // up using this for visible iframe dialogs, the 500 would be
          // unacceptable
          window.setTimeout(function() {
                              frame.parentNode.removeChild(frame);
                            }, 500);
        }
      } catch (x) {
        // do nothing, permission error
      }

      // popup window
      try {
        if (frame.close) {
          frame.close();
        }
      } catch (x) {
        // do nothing, permission error
      }

      // cleanup and fire
      delete Mu.Content._xdFrames[data.frame];
      delete Mu._callbacks[data.cb];
      cb(data);
    },

    /**
     * Some Facebook redirect URLs use a special ``xxRESULTTOKENxx`` to return
     * custom values. This is a convenience function to wrap a callback that
     * expects this value back.
     *
     * @access private
     * @param cb     {Function} the callback function
     * @param frame  {String}   the frame id for the callback will be used with
     * @param target {String}   parent or opener to indicate the window relation
     * @param id     {String}   custom id for callback. defaults to frame id
     * @returns      {String}   the xd url bound to the callback
     */
    result: function(cb, frame, target, id) {
      return (
        Mu.XD.handler(function(params) {
          cb && cb(params.result != Mu.XD._resultTokens &&
                   JSON.parse(params.result));
        }, frame, target, id) +
        '&result=' + encodeURIComponent(Mu.XD._resultToken)
      );
    },

    /**
     * This handles receiving a session from:
     *  - login_status.php
     *  - login.php
     *  - tos.php
     *
     * It also (optionally) handles the ``xxRESULTTOKENxx`` response from:
     *  - prompt_permissions.php
     *
     * And calls the given callback with::
     *
     *   {
     *     session: session or null,
     *     state: 'unknown' or 'disconnected' or 'connected',
     *     perms: comma separated string of perm names
     *   }
     *
     * @access private
     * @param cb      {Function} the callback function
     * @param frame   {String}   the frame id for the callback will be used with
     * @param target  {String}   parent or opener to indicate window relation
     * @param id      {String}   custom id for callback. defaults to frame id
     * @param state   {String}   the connect state this handler will trigger
     * @param session {Object}   backup session, if none is found in response
     * @returns       {String}   the xd url bound to the callback
     */
    session: function(cb, frame, target, id, state, session) {
      return Mu.XD.handler(function(params) {
        // try to extract a session
        var response;
        try {
          response = Mu.setSession(JSON.parse(params.session), state);
        } catch(x) {
          response = Mu.setSession(session || null, state);
        }

        // incase we were granted some new permissions
        response.perms = (
          params.result != 'xxRESULTTOKENxx' && params.result || '');

        // user defined callback
        cb && cb(response);
      }, frame, target, id) + '&result=xxRESULTTOKENxx';
    },



    /**
     * Provides Native ``window.postMessage`` based XD support.
     *
     * @class Mu.XD.PostMessage
     * @static
     * @for Mu.XD
     * @access private
     */
    PostMessage: {
      /**
       * Initialize the native PostMessage system.
       *
       * @access private
       */
      init: function() {
        var H = Mu.XD.PostMessage.onMessage;
        window.addEventListener
          ? window.addEventListener('message', H, false)
          : window.attachEvent('onmessage', H);
      },

      /**
       * Handles a message event.
       *
       * @access private
       * @param event {Event} the event object
       */
      onMessage: function(event) {
        Mu.XD.recv(event.data);
      }
    },

    /**
     * Provides Flash Local Connection based XD support.
     *
     * @class Mu.XD.Flash
     * @static
     * @for Mu.XD
     * @access private
     */
    Flash: {
      /**
       * Initialize the Flash Local Connection.
       *
       * @access private
       */
      init: function() {
        Mu.Flash.onReady(function() {
          document.XdComm.postMessage_init('Mu.XD.Flash.onMessage',
                                           Mu.XD._origin);
        });
      },

      /**
       * Handles a message received by the Flash Local Connection.
       *
       * @access private
       * @param message {String} the URI encoded string sent by the SWF
       */
      onMessage: function(message) {
        Mu.XD.recv(decodeURIComponent(message));
      }
    }
  },


  /**
   * Cookie Support.
   *
   * @class Mu.Cookie
   * @static
   * @for Mu
   * @access private
   */
  Cookie: {
    /**
     * Initialize the Cookie support. Sets up the handler to update the cookie
     * as the session changes.
     *
     * @access private
     * @returns {Object} the session object from the cookie if one is found
     */
    init: function() {
      Mu.status(function(response) {
        Mu.Cookie.set(response.session);
      }, true);
      return Mu.Cookie.load();
    },

    /**
     * Try loading the session from the Cookie.
     *
     * @access private
     * @returns {Object} the session object from the cookie if one is found
     */
    load: function() {
      var
        prefix  = 'fbs_' + Mu._apiKey + '=',
        cookies = document.cookie.split(';'),
        cookie,
        session;

      // look through all the cookies
      for (var i=0, l=cookies.length; i<l; i++) {
        cookie = cookies[i];

        // bad browser bad
        while (cookie.charAt(0) === ' ') {
          cookie = cookie.substring(1, cookie.length);
        }

        // is it the cookie we want?
        if (cookie.indexOf(prefix) === 0) {
          // url encoded session
          session = Mu.QS.decode(
            cookie.substring(prefix.length, cookie.length));
          // decodes as a string, convert to a number
          session.expires = parseInt(session.expires, 10);

          // dont use expired cookies, not that they should be around in the
          // first place.
          if (new Date(session.expires * 1000) < new Date()) {
            session = null;
          }
          break;
        }
      }

      return session;
    },

    /**
     * Helper function to set cookie value.
     *
     * @access private
     * @param val       {String} the string value (should already be encoded)
     * @param timestamp {Number} a unix timestamp denoting expiry
     */
    setRaw: function(val, timestamp) {
      document.cookie =
        'fbs_' + Mu._apiKey + '=' + val +
        '; expires=' + new Date(timestamp * 1000).toGMTString() +
        '; path=/';
    },

    /**
     * Set the cookie using the given session object.
     *
     * @access private
     * @param session {Object} the session object
     */
    set: function(session) {
      session
        ? Mu.Cookie.setRaw(Mu.QS.encode(session), session.expires)
        : Mu.Cookie.clear();
    },

    /**
     * Clear the cookie.
     *
     * @access private
     */
    clear: function() {
      Mu.Cookie.setRaw('', 0);
    }
  },



  //
  // status and logut are hidden iframes, as they do not involve user
  // interaction. others are popup windows.
  //

  /**
   * Find out the current status from the server, and get a session if the user
   * is connected. The callback is invoked with (session).
   *
   * The User's Status or the question of "who is the current user" is
   * the first thing you will typically start with. For the answer, we
   * ask facebook.com.  Facebook will answer this question in one of
   * two ways:
   *
   *     #. Someone you don't know.
   *     #. Someone you know and have interacted with. Here's a
   *        session for them.
   *
   * Here's how you find out::
   *
   *     Mu.status(function(response) {
   *       if (response.session) {
   *         // logged in and connected user, someone you know
   *       } else {
   *         // no user session available, someone you dont know
   *       }
   *     });
   *
   * For more advanced use, you may also need a way to monitor status
   * changes. For example, you may include something along these lines on all
   * your logged-out pages::
   *
   *     Mu.status(function(response) {
   *       if (response.session) {
   *         window.location = '/dashboard';
   *       }
   *     }, true); // notice the second argument 'true'
   *
   * The call simply registers a subscriber. It does not trigger a actual
   * status check against the server. Now if you get a session on a status
   * check, or if the user Connect's with your site, they will get redirected
   * to /dashboard.
   *
   * @access public
   * @param cb         {Function} the callback function
   * @param subscriber {Boolean}  indicate if this is a subscriber
   * @for Mu
   */
  status: function(cb, subscriber) {
    // a subscriber does not trigger actually getting the status.
    // the caller can finally call `Mu.status()` to trigger getting
    // the status, which would invoke all subscribers with the
    // result.
    if (subscriber) {
      Mu._sessionCallbacks.push(cb);
      return;
    }


    var
      g     = Mu.guid(),
      url   = Mu._domain.www + 'extern/login_status.php?' + Mu.QS.encode({
        api_key    : Mu._apiKey,
        no_session : Mu.XD.session(cb, g, 'parent', g,     'disconnected'),
        no_user    : Mu.XD.session(cb, g, 'parent', g+'1', 'unknown'),
        ok_session : Mu.XD.session(cb, g, 'parent', g+'2', 'connected')
      });

    Mu.Content.hiddenIframe(url, g);
  },

  /**
   * Login/Authorize/Permissions.
   *
   * Once you have determined the user's status, you may need to
   * prompt the user to login. It is best to delay this action to
   * reduce user friction when they first arrive at your site. You can
   * then prompt and show them the "Connect with Facebook" button
   * bound to an event handler which does the following::
   *
   *    Mu.login(function(response) {
   *      if (response.session) {
   *        // user successfully logged in
   *      } else {
   *        // user cancelled login
   *      }
   *    });
   *
   * You should **only** call this on a user event as it opens a
   * popup. Most browsers block popups, *unless* they were initiated
   * from a user event, such as a click on a button or a link.
   *
   *
   * Depending on your application's needs, you may need additional
   * permissions from the user. A large number of calls do not require
   * any additional permissions, so you should first make sure you
   * need a permission. This is a good idea because this step
   * potentially adds friction to the user's process. Another point to
   * remember is that this call can be made even *after* the user has
   * first connected. So you may want to delay asking for permissions
   * until as late as possible::
   *
   *     Mu.login(function(response) {
   *       if (response.session) {
   *         if (response.perms) {
   *           // user is logged in and granted some permissions.
   *           // perms is a comma separated list of granted permissions
   *         } else {
   *           // user is logged in, but did not grant any permissions
   *         }
   *       } else {
   *         // user is not logged in
   *       }
   *     }, 'read_stream,publish_stream,offline_access');
   *
   * @access public
   * @param cb    {Function} the callback function
   * @param perms {String}   (optional) comma separated list of permissions
   */
  login: function(cb, perms) {
    var
      g      = Mu.guid(),
      cancel = Mu.XD.session(cb, g, 'opener', g, Mu._userState, Mu._session),
      next   = Mu.XD.session(cb, g, 'opener', g+'1', 'connected', Mu._session),
      url    = Mu._domain.www + 'login.php?' + Mu.QS.encode({
        api_key        : Mu._apiKey,
        cancel_url     : cancel,
        channel_url    : Mu.XD._origin,
        display        : 'popup',
        fbconnect      : 1,
        next           : next,
        req_perms      : perms,
        return_session : 1,
        v              : '1.0'
      });

    Mu.Content.popup(url, 450, 415, g);
  },

  /**
   * Logout the user in the background.
   *
   * Just like logging in is tied to facebook.com, so is logging out.
   * The status shared between your site and Facebook, and logging out
   * affects both sites. This is a simple call::
   *
   *     Mu.logout(function(response) {
   *       // user is now logged out
   *     });
   *
   * @access public
   * @param cb    {Function} the callback function
   */
  logout: function(cb) {
    var
      g   = Mu.guid(),
      url = Mu._domain.www + 'logout.php?' + Mu.QS.encode({
        api_key     : Mu._apiKey,
        next        : Mu.XD.session(cb, g, 'parent', g, 'unknown'),
        session_key : Mu._session.session_key
      });

    Mu.Content.hiddenIframe(url, g);
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
      cb(Mu.setSession(null, 'disconnected'));
    });
  },

  /**
   * Sharing is the light weight way of distributing your content. As opposed
   * to the structured data explicitly given in the publish call, with share
   * you simply provide the URL and optionally a title::
   *
   *    Mu.share('http://mu.daaku.org/', 'Mu Connect');
   *
   * Both arguments are optional, and just calling ``Mu.share()`` will share the
   * current page.
   *
   * This call can be used without requiring the user to sign in.
   *
   * @access public
   * @param u     {String} the url (defaults to current URL)
   * @param title {String} a custom title
   */
  share: function(u, title) {
    var
      url = Mu._domain.www + 'sharer.php?' + Mu.QS.encode({
        title : title,
        u     : u || window.location.toString()
      });

    Mu.Content.popup(url, 575, 380);
  },

  /**
   * Publish a post to the stream.
   *
   * This is the main, fully featured distribution mechanism for you
   * to publish into the user's stream. It can be used, with or
   * without an API key. With an API key you can control the
   * Application Icon and get attribution. You must also do this if
   * you wish to use the callback to get notified of the ``post_id``
   * and the ``message`` the user typed in the published post, or find
   * out if the user did not publish (clicked on the skipped button).
   *
   * Publishing is a powerful feature that allows you to submit rich
   * media and provide a integrated experience with control over your
   * stream post. You can guide the user by choosing the prompt,
   * and/or a default message which they may customize. In addition,
   * you may provide image, video, audio or flash based attachments
   * with along with their metadata. You also get the ability to
   * provide action links which show next to the "Like" and "Comment"
   * actions. All this together provides you full control over your
   * stream post. In addition, if you may also specify a target for
   * the story, such as another user or a page.
   *
   * A post may contain the following properties:
   *
   * ===================   ======   =====================================
   * Property              Type     Description
   * ===================   ======   =====================================
   * message               String   this allows prepopulating the message
   * attachment            Array    an attachment_ object
   * action_links          Array    an array of `action links`_
   * actor_id              String   a actor profile/page id
   * target_id             String   a target profile id
   * user_message_prompt   String   custom prompt message
   * ===================   ======   =====================================
   *
   * The post and all the parameters are optional, so use what is best
   * for your specific case.
   *
   * .. _attachment: http://wiki.developers.facebook.com/index.php/Attachment_(Streams)
   * .. _action links: http://wiki.developers.facebook.com/index.php/Action_Links
   *
   * Example::
   *
   *     var post = {
   *       message: 'getting educated about Facebook Connect',
   *       attachment: {
   *         name: 'Mu Connect',
   *         caption: 'A micro Facebook Connect library.',
   *         description: (
   *           'Mu is a small JavaScript library that allows you to harness ' +
   *           'the power of Facebook, bringing the user\'s identity, ' +
   *           'social graph and distribution power to your site.'
   *         ),
   *         href: 'http://mu.daaku.org/',
   *       },
   *       action_links: [
   *         { text: 'Mu Console', href: 'http://mu.daaku.org/' },
   *         { text: 'GitHub Repo', href: 'http://github.com/nshah/mu' }
   *       ],
   *       user_prompt_message: 'Share your thoughts about Mu Connect'
   *     };
   *
   *     Mu.publish(
   *       post,
   *       function(published_post) {
   *         if (published_post) {
   *           alert(
   *             'The post was successfully published. ' +
   *             'Post ID: ' + published_post.post_id +
   *             '. Message: ' + published_post.message
   *           );
   *         } else {
   *           alert('The post was not published.');
   *         }
   *       }
   *     );
   *
   * @access public
   * @param post  {Object}   the post object
   * @param cb    {Function} called with the result of the action
   */
  publish: function(post, cb) {
    // YUCK
    if (cb) {
      var old_cb = cb;
      cb = function(result) {
        if (result && result.postId) {
          result = {
            message: result.data.user_message,
            post_id: result.postId
          };
        } else if (!result.postId) {
          result = null;
        }
        old_cb(result);
      };
    }

    post = post || {};
    var
      g   = Mu._apiKey && Mu.guid(),
      url = Mu._domain.www + 'connect/prompt_feed.php?' + Mu.QS.encode({
        action_links        : JSON.stringify(post.action_links || {}),
        actor_id            : post.actor_id,
        api_key             : Mu._apiKey,
        attachment          : JSON.stringify(post.attachment || {}),
        callback            : g && Mu.XD.result(cb, g),
        message             : post.message,
        preview             : 1,
        session_key         : Mu._session && Mu._session.session_key,
        target_id           : post.target_id,
        user_message_prompt : post.user_message_prompt
      });

    Mu.Content.popup(url, 550, 242, g);
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
      url = Mu._domain.www + 'addfriend.php?' + Mu.QS.encode({
        api_key     : Mu._apiKey,
        display     : 'dialog',
        id          : id,
        next        : Mu.XD.result(cb, g),
        session_key : Mu._session.session_key
      });

    Mu.Content.popup(url, 565, 240, g);
  },

  /**
   * Sign the given params and prepare them for an API call, either using an
   * explicit secret or using the current session. It updates the given params
   * object *in place* with the necessary parameters.
   *
   * @access private
   * @param params {Object} the parameters to sign
   * @param secret {String} secret to sign the call (defaults to the current
   * session secret)
   * @returns {Object} the *same* params object back
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
      params.sig = Mu.md5sum(
        Mu.QS.encode(params, '', false) +
        (secret || Mu._session.secret)
      );
    }

    return params;
  },

  /**
   * Once you have a session for the current user, you will want to
   * access data about that user, such as getting their name & profile
   * picture, friends lists or upcoming events they will be
   * attending. In order to do this, you will be making signed API
   * calls to Facebook using their session. Suppose we want to alert
   * the current user's name::
   *
   *     Mu.api(
   *       {
   *         method: 'fql.query',
   *         query: 'SELECT name FROM profile WHERE id=' + Mu.session().uid
   *       },
   *       function(response) {
   *         alert(response[0].name);
   *       }
   *     );
   *
   * API Calls are listed here:
   * http://wiki.developers.facebook.com/index.php/API
   *
   * FQL is the preferred way of reading data from Facebook (write/update/delete
   * queries are done via simpler URL parameters). FQL.multiQuery is also very
   * crucial for good performance, as it allows efficiently collecting different
   * types of data.
   *
   * FQL is described here: http://wiki.developers.facebook.com/index.php/FQL
   *
   * FQL Tables are listed here:
   * http://wiki.developers.facebook.com/index.php/FQL_Tables
   *
   * .. _FQL: http://wiki.developers.facebook.com/index.php/FQL
   *
   * @access public
   * @param params {Object}   the parameters for the query
   * @param cb     {Function} the callback function to handle the response
   * @param secret {String}   secret to sign the call (defaults to the current
   * session secret)
   */
  api: function(params, cb, secret) {
    try {
      Mu.jsonp(params, cb, secret);
    } catch (x) {
      if (Mu.Flash.hasMinVersion()) {
        Mu.Flash.api(params, cb, secret);
      } else {
        throw new Error('Flash is required for this API call.');
      }
    }
  },

  /**
   * Make a API call to restserver.php. This call will be automatically signed
   * if a session is available. The call is made using JSONP, which is
   * restricted to a GET with a maximum payload of 2k (including the signature
   * and other params).
   *
   * @access private
   * @param params {Object}   the parameters for the query
   * @param cb     {Function} the callback function to handle the response
   * @param secret {String}   secret to sign the call (defaults to the current
   * session secret)
   */
  jsonp: function(params, cb, secret) {
    var
      g      = Mu.guid(),
      script = document.createElement('script'),
      url;

    // shallow clone of params, add callback and sign
    params = Mu.sign(Mu.copy({callback: 'Mu._callbacks.' + g}, params), secret);

    url = Mu._domain.api + 'restserver.php?' + Mu.QS.encode(params);
    if (url.length > 2000) {
      throw new Error('JSONP only support a maximum of 2000 bytes of input.');
    }

    // this is the JSONP callback invoked by the response from restserver.php
    Mu._callbacks[g] = function(response) {
      cb(response);
      delete Mu._callbacks[g];
      script.parentNode.removeChild(script);
    };

    script.src = url;
    document.getElementsByTagName('head')[0].appendChild(script);
  },

  /**
   * Set a new session value. Invokes all the registered subscribers
   * if needed.
   *
   * @access private
   * @param session {Object}  the new Session
   * @param state   {String}  the new state
   * @param forceCb {Boolean} force invoke the callbacks
   */
  setSession: function(session, state, forceCb) {
    var
      response = { session: session, state: state },
      changed  = (forceCb ||                   // force callbacks
                  (session && !Mu._session) || // new session
                  (!session && Mu._session) || // lost session
                  (session && Mu._session &&   // updated session
                   (session.session_key != Mu._session.session_key)));

    Mu._session = session;
    Mu._userState = state;
    if (changed) {
      for (var i=0, l=Mu._sessionCallbacks.length; i<l; i++) {
        Mu._sessionCallbacks[i](response);
      }
    }
    return response;
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
