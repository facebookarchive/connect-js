/**
 * @module Mu
 * @provides Mu.API
 *
 * @requires Mu.Prelude
 *           Mu.QS
 *           Mu.XD
 *           Mu.Content
 */

/**
 * Authentication, Authorization & Sessions.
 *
 * @class Mu
 * @static
 * @access private
 */
Mu.copy('', {
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
    // Auth.revokeAuthorization affects the session
    if (params.method == 'Auth.revokeAuthorization') {
      var old_cb = cb;
      cb = function(response) {
        if (response === true) {
          Mu.setSession(null, 'disconnected');
        }
        old_cb && old_cb(response);
      };
    }

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
  }
});
