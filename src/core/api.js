/**
 * Contains the public method ``FB.api`` and the internal implementation
 * ``FB.RestServer``.
 *
 * @module FB
 * @provides fb.api
 * @requires fb.prelude
 *           fb.qs
 *           fb.flash
 *           fb.md5sum
 */

/**
 * API calls.
 *
 * @class FB
 * @static
 * @access private
 */
FB.copy('', {
  /**
   * Once you have a session for the current user, you will want to
   * access data about that user, such as getting their name & profile
   * picture, friends lists or upcoming events they will be
   * attending. In order to do this, you will be making signed API
   * calls to Facebook using their session. Suppose we want to alert
   * the current user's name::
   *
   *     FB.api(
   *       {
   *         method: 'fql.query',
   *         query: 'SELECT name FROM profile WHERE id=' + FB.getSession().uid
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
   */
  api: function(params, cb) {
    // this is an optional dependency on FB.Auth
    // Auth.revokeAuthorization affects the session
    if (FB.Auth && params.method == 'Auth.revokeAuthorization') {
      var old_cb = cb;
      cb = function(response) {
        if (response === true) {
          FB.Auth.setSession(null, 'notConnected');
        }
        old_cb && old_cb(response);
      };
    }

    try {
      FB.RestServer.jsonp(params, cb);
    } catch (x) {
      if (FB.Flash.hasMinVersion()) {
        FB.RestServer.flash(params, cb);
      } else {
        throw new Error('Flash is required for this API call.');
      }
    }
  }
});

/**
 * API call implementations.
 *
 * @class FB.RestServer
 * @static
 * @access private
 */
FB.copy('RestServer', {
  _callbacks: {},

  /**
   * Sign the given params and prepare them for an API call using the current
   * session if possible.
   *
   * @access private
   * @param params {Object} the parameters to sign
   * @returns {Object} the *same* params object back
   */
  sign: function(params) {
    // general api call parameters
    FB.copy(params, {
      api_key : FB._apiKey,
      call_id : (new Date()).getTime(),
      format  : 'json',
      v       : '1.0'
    });

    // indicate session signing if session is available
    if (FB._session) {
      FB.copy(params, {
        session_key : FB._session.session_key,
        ss          : 1
      });
    }

    // optionally generate the signature. we do this for both the automatic and
    // explicit case.
    if (FB._session) {
      // the signature is described at:
      // http://wiki.developers.facebook.com/index.php/Verifying_The_Signature
      params.sig = FB.md5sum(
        FB.QS.encode(params, '', false) + FB._session.secret
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
   * @access private
   * @param params {Object}   the parameters for the query
   * @param cb     {Function} the callback function to handle the response
   */
  jsonp: function(params, cb) {
    var
      g      = FB.guid(),
      script = document.createElement('script'),
      url;

    // shallow clone of params, add callback and sign
    params = FB.RestServer.sign(
      FB.copy({ callback: 'FB.RestServer._callbacks.' + g }, params));

    url = FB._domain.api + 'restserver.php?' + FB.QS.encode(params);
    if (url.length > 2000) {
      throw new Error('JSONP only support a maximum of 2000 bytes of input.');
    }

    // this is the JSONP callback invoked by the response from restserver.php
    FB.RestServer._callbacks[g] = function(response) {
      cb(response);
      delete FB.RestServer._callbacks[g];
      script.parentNode.removeChild(script);
    };

    script.src = url;
    document.getElementsByTagName('head')[0].appendChild(script);
  },

  /**
   * Make a API call to restserver.php using Flash.
   *
   * @access private
   * @param params {Object}   the parameters for the query
   * @param cb     {Function} the callback function to handle the response
   */
  flash: function(params, cb) {
    // only need to do this once
    if (!FB.RestServer.flash._init) {
      // the SWF calls this global function when a HTTP response is available
      // FIXME: remove global
      window.FB_OnXdHttpResult = function(reqId, data) {
        FB.RestServer._callbacks[reqId](FB.Flash.decode(data));
      };
      FB.RestServer.flash._init = true;
    }

    FB.Flash.onReady(function() {
      var method, url, body, reqId;

      // shallow clone of params, sign, and encode as query string
      body = FB.QS.encode(FB.RestServer.sign(FB.copy({}, params)));
      url = FB._domain.api + 'restserver.php';

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
      FB.RestServer._callbacks[reqId] = function(response) {
        cb(JSON.parse(FB.Flash.decode(response)));
        delete FB.RestServer._callbacks[reqId];
      };
    });
  }
});
