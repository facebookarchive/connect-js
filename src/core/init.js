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
 * JavaScript library providing Facebook Connect integration.
 *
 * @provides fb.init
 * @requires fb.prelude
 *           fb.api
 *           fb.auth
 *           fb.cookie
 *           fb.ui
 *           fb.xd
 */

/**
 * This is the top level for all the public APIs.
 *
 * @class FB
 * @static
 * @access public
 */
FB.provide('', {
  /**
   * Initialize the library.
   *
   * Typical initialization enabling all optional features:
   *
   *      <div id="fb-root"></div>
   *      <script src="http://static.ak.fbcdn.net/connect/en_US/core.js"></script>
   *      <script>
   *        FB.init({
   *          apiKey : 'YOUR API KEY',
   *          status : true, // check login status
   *          cookie : true, // enable cookies to allow the server to access the session
   *          xfbml  : true  // parse XFBML
   *        });
   *      </script>
   *
   * The best place to put this code is right before the closing
   * `</body>` tag.
   *
   * ### Asynchronous Loading
   *
   * The library makes non-blocking loading of the script easy to use by
   * providing the `fbAsyncInit` hook. If this global function is defined, it
   * will be executed when the library is loaded:
   *
   *     <div id="fb-root"></div>
   *     <script>
   *       window.fbAsyncInit = function() {
   *         FB.init({
   *           apiKey : 'YOUR API KEY',
   *           status : true, // check login status
   *           cookie : true, // enable cookies to allow the server to access the session
   *           xfbml  : true  // parse XFBML
   *         });
   *       };
   *
   *       (function() {
   *         var e = document.createElement('script');
   *         e.type = 'text/javascript';
   *         e.src = 'http://static.ak.fbcdn.net/connect/en_US/core.js';
   *         e.async = true;
   *         document.getElementById('fb-root').appendChild(e);
   *       }());
   *     </script>
   *
   * The best place to put the asynchronous version of the code is right after
   * the opening `<body>` tag. This allows Facebook initialization to happen in
   * parallel with the initialization on the rest of your page.
   *
   *
   * **Note**: Some [UI methods][FB.ui] like **stream.publish** and
   * **stream.share** can be used without registering an application or calling
   * this method. If you are using an API key, all methods **must** be called
   * after this method.
   *
   * [FB.ui]: /docs/?u=facebook.joey.FB.ui
   *
   * @access public
   * @param options {Object}
   *
   * Property | Type    | Description                          | Argument     | Default
   * -------- | ------- | ------------------------------------ | ------------ | -------
   * apiKey   | String  | Your application API key.            | **Required** |
   * cookie   | Boolean | `true` to enable cookie support.     | *Optional*   | `false`
   * logging  | Boolean | `false` to disable logging.          | *Optional*   | `true`
   * session  | Object  | Use specified session object.        | *Optional*   | `null`
   * status   | Boolean | `true` to fetch fresh status.        | *Optional*   | `false`
   * xfbml    | Boolean | `true` to parse [[wiki:XFBML]] tags. | *Optional*   | `false`
   */
  init: function(options) {
    if (!options || !options.apiKey) {
      FB.log('FB.init() called without an apiKey.');
      return;
    }

    // only need to list values here that do not already have a falsy default.
    // this is why cookie/session/status are not listed here.
    FB.copy(options, {
      logging: true
    });

    FB._apiKey = options.apiKey;

    // disable logging if told to do so, but only if the url doesnt have the
    // token to turn it on. this allows for easier debugging of third party
    // sites even if logging has been turned off.
    if (!options.logging &&
        window.location.toString().indexOf('fb_debug=1') < 0) {
      FB._logging = false;
    }

    // enable cookie support if told to do so
    FB.Cookie.setEnabled(options.cookie);

    // if an explicit session was not given, try to _read_ an existing cookie.
    // we dont enable writing automatically, but we do read automatically.
    options.session = options.session || FB.Cookie.load();

    // set the session
    FB.Auth.setSession(options.session,
                       options.session ? 'connected' : 'unknown');

    // load a fresh session if requested
    if (options.status) {
      FB.getLoginStatus();
    }

    // weak dependency on XFBML
    if (options.xfbml) {
      // do this in a setTimeout to delay it until the current call stack has
      // finished executing
      window.setTimeout(function() {
        if (FB.XFBML) {
          FB.XFBML.parse();
        }
      }, 0);
    }
  }
});

// this is useful when the library is being loaded asynchronously
//
// we do it in a setTimeout to wait until the current event loop as finished.
// this allows potential library code being included below this block (possible
// when being served from an automatically combined version)
//
// Usage:
//
//  <div id="fb-root"></div>
//  <script>
//    window.fbAsyncInit = function() {
//      FB.init({
//        apiKey: '6a25de06224e9b21a2b33fcdae593daa',
//        status: true
//      });
//      FB.XFBML.parse();
//    };
//
//    (function() {
//      var e = document.createElement('script');
//      e.type = 'text/javascript';
//      e.src = 'http://static.ak.fbcdn.net/connect/en_US/core.js';
//      e.async = true;
//      document.getElementById('fb-root').appendChild(e);
//    }());
//  </script>
//
window.setTimeout(function() { if (window.fbAsyncInit) { fbAsyncInit(); }}, 0);
