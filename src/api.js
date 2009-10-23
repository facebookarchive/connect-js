/**
 * Contains the public method ``Mu.api`` and the internal implementation
 * ``Mu.RestServer``.
 *
 * @module Mu
 * @provides mu.api
 * @requires mu.prelude
 *           mu.qs
 *           mu.flash
 *           mu.md5sum
 */

/**
 * API calls.
 *
 * @class Mu
 * @static
 * @access private
 */
Mu.copy('', {
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
   *         query: 'SELECT name FROM profile WHERE id=' + Mu.getSession().uid
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
    // this is an optional dependency on Mu.Auth
    // Auth.revokeAuthorization affects the session
    if (Mu.Auth && params.method == 'Auth.revokeAuthorization') {
      var old_cb = cb;
      cb = function(response) {
        if (response === true) {
          Mu.Auth.setSession(null, 'notConnected');
        }
        old_cb && old_cb(response);
      };
    }

    try {
      Mu.RestServer.jsonp(params, cb);
    } catch (x) {
      if (Mu.Flash.hasMinVersion()) {
        Mu.RestServer.flash(params, cb);
      } else {
        throw new Error('Flash is required for this API call.');
      }
    }
  }
});

/**
 * API call implementations.
 *
 * @class Mu.RestServer
 * @static
 * @access private
 */
Mu.copy('RestServer', {
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
    Mu.copy(params, {
      api_key : Mu._apiKey,
      call_id : (new Date()).getTime(),
      format  : 'json',
      v       : '1.0'
    });

    // indicate session signing if session is available
    if (Mu._session) {
      Mu.copy(params, {
        session_key : Mu._session.session_key,
        ss          : 1
      });
    }

    // optionally generate the signature. we do this for both the automatic and
    // explicit case.
    if (Mu._session) {
      // the signature is described at:
      // http://wiki.developers.facebook.com/index.php/Verifying_The_Signature
      params.sig = Mu.md5sum(
        Mu.QS.encode(params, '', false) + Mu._session.secret
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
      g      = Mu.guid(),
      script = document.createElement('script'),
      url;

    // shallow clone of params, add callback and sign
    params = Mu.RestServer.sign(
      Mu.copy({ callback: 'Mu.RestServer._callbacks.' + g }, params));

    url = Mu._domain.api + 'restserver.php?' + Mu.QS.encode(params);
    if (url.length > 2000) {
      throw new Error('JSONP only support a maximum of 2000 bytes of input.');
    }

    // this is the JSONP callback invoked by the response from restserver.php
    Mu.RestServer._callbacks[g] = function(response) {
      cb(response);
      delete Mu.RestServer._callbacks[g];
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
    if (!Mu.RestServer.flash._init) {
      // the SWF calls this global function when a HTTP response is available
      // FIXME: remove global
      window.FB_OnXdHttpResult = function(reqId, data) {
        Mu.RestServer._callbacks[reqId](Mu.Flash.decode(data));
      };
      Mu.RestServer.flash._init = true;
    }

    Mu.Flash.onReady(function() {
      var method, url, body, reqId;

      // shallow clone of params, sign, and encode as query string
      body = Mu.QS.encode(Mu.RestServer.sign(Mu.copy({}, params)));
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
      Mu.RestServer._callbacks[reqId] = function(response) {
        cb(JSON.parse(Mu.Flash.decode(response)));
        delete Mu.RestServer._callbacks[reqId];
      };
    });
  }
});
