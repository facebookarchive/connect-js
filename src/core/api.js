/**
 * Copyright Facebook Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 *
 *
 * Contains the public method ``FB.api`` and the internal implementation
 * ``FB.RestServer``.
 *
 * @provides fb.api
 * @requires fb.prelude
 *           fb.qs
 *           fb.flash
 *           fb.md5sum
 *           fb.json
 */

/**
 * API calls.
 *
 * @class FB
 * @static
 * @access private
 */
FB.provide('', {
  /**
   * Server-side [[wiki:API]] calls are available via the JavaScript SDK that
   * allow you to build rich applications that can make [[wiki:API]] calls
   * against the Facebook servers directly from the user's browser. This can
   * improve performance in many scenarios, as compared to making all calls
   * from your server. It can also help reduce, or eliminate the need to proxy
   * the requests thru your own servers, freeing them to do other things.
   *
   * The range of APIs available covers virtually all facets of Facebook.
   * Public data such as names and profile pictures ([[wiki:User (FQL)]]) are
   * available if you know the UID of the user. Various parts of the API are
   * available depending on the [connect status and the permissions][FB.login]
   * the user has granted your application.
   *
   * Suppose we want to alert the current user's name (assuming they are
   * already [connected][FB.login]):
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
   * [[wiki:API]] Calls are documented on the wiki.
   *
   * [[wiki:FQL]] is the preferred way of reading data from Facebook
   * (write/update/delete queries are done via simpler URL parameters).
   * [[wiki:Fql.multiquery]] is also very crucial for good performance, as it
   * allows efficiently collecting different types of data.
   *
   * [[wiki:FQL Tables]] are available for various types of data.
   *
   * [FB.login]: /docs/?u=facebook.joey.FB.login
   *
   * @access public
   * @param params {Object} The required arguments vary based on the method
   * being used, but specifying the method itself is mandatory:
   *
   * Property | Type    | Description                      | Argument
   * -------- | ------- | -------------------------------- | ------------
   * method   | String  | The API method to invoke.        | **Required**
   * @param cb {Function} The callback function to handle the response.
   */
  api: function(params, cb) {
    // this is an optional dependency on FB.Auth
    // Auth.revokeAuthorization affects the session
    if (FB.Auth &&
        params.method.toLowerCase() == 'auth.revokeauthorization') {
      var old_cb = cb;
      cb = function(response) {
        if (response === true) {
          FB.Auth.setSession(null, 'notConnected');
        }
        old_cb && old_cb(response);
      };
    }

    var flat_params = FB.JSON.flatten(params);

    try {
      FB.RestServer.jsonp(flat_params, cb);
    } catch (x) {
      if (FB.Flash.hasMinVersion()) {
        FB.RestServer.flash(flat_params, cb);
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
 * @access private
 */
FB.provide('RestServer', {
  _callbacks: {},

  /**
   * Sign the given params and prepare them for an API call using the current
   * session if possible.
   *
   * @access private
   * @param params {Object} the parameters to sign
   * @return {Object} the *same* params object back
   */
  sign: function(params) {
    // general api call parameters
    FB.copy(params, {
      api_key : FB._apiKey,
      call_id : new Date().getTime(),
      format  : 'json',
      sdk     : 'joey',
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
      if (cb) { cb(response); }
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
        FB.RestServer._callbacks[reqId](decodeURIComponent(data));
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
        cb(FB.JSON.parse(response));
        delete FB.RestServer._callbacks[reqId];
      };
    });
  }
});
