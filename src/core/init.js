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
 *           fb.auth
 *           fb.api
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
   *      <script src="http://connect.facebook.net/en_US/all.js"></script>
   *      <script>
   *        FB.init({
   *          appId  : 'YOUR APP ID',
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
   *           appId  : 'YOUR APP ID',
   *           status : true, // check login status
   *           cookie : true, // enable cookies to allow the server to access the session
   *           xfbml  : true  // parse XFBML
   *         });
   *       };
   *
   *       (function() {
   *         var e = document.createElement('script');
   *         e.src = document.location.protocol + '//connect.facebook.net/en_US/all.js';
   *         e.async = true;
   *         document.getElementById('fb-root').appendChild(e);
   *       }());
   *     </script>
   *
   * The best place to put the asynchronous version of the code is right after
   * the opening `<body>` tag. This allows Facebook initialization to happen in
   * parallel with the initialization on the rest of your page.
   *
   * ### Internationalization
   *
   * Facebook Connect features are available many locales. You can replace the
   * `en_US` locale specifed above with one of the [supported Facebook
   * Locales][locales]. For example, to load up the library and trigger dialogs,
   * popups and plugins to be in Hindi (`hi_IN`), you can load the library from
   * this URL:
   *
   *     http://connect.facebook.net/hi_IN/all.js
   *
   * [locales]: http://wiki.developers.facebook.com/index.php/Facebook_Locales
   *
   * ### SSL
   *
   * Facebook Connect is also available over SSL. You should only use this when
   * your own page is served over `https://`. The library will rely on the
   * current page protocol at runtime. The SSL URL is the same, only the
   * protocol is changed:
   *
   *     https://connect.facebook.net/en_US/all.js
   *
   * **Note**: Some [UI methods][FB.ui] like **stream.publish** and
   * **stream.share** can be used without registering an application or calling
   * this method. If you are using an appId, all methods **must** be called
   * after this method.
   *
   * [FB.ui]: /docs/reference/javascript/FB.ui
   *
   * @access public
   * @param options {Object}
   *
   * Property | Type    | Description                          | Argument   | Default
   * -------- | ------- | ------------------------------------ | ---------- | -------
   * appId    | String  | Your application ID.                 | *Optional* | `null`
   * cookie   | Boolean | `true` to enable cookie support.     | *Optional* | `false`
   * logging  | Boolean | `false` to disable logging.          | *Optional* | `true`
   * session  | Object  | Use specified session object.        | *Optional* | `null`
   * status   | Boolean | `true` to fetch fresh status.        | *Optional* | `false`
   * xfbml    | Boolean | `true` to parse [[wiki:XFBML]] tags. | *Optional* | `false`
   */
  init: function(options) {
    // only need to list values here that do not already have a falsy default.
    // this is why cookie/session/status are not listed here.
    options = FB.copy(options || {}, {
      logging: true
    });

    FB._apiKey = options.appId || options.apiKey;

    // disable logging if told to do so, but only if the url doesnt have the
    // token to turn it on. this allows for easier debugging of third party
    // sites even if logging has been turned off.
    if (!options.logging &&
        window.location.toString().indexOf('fb_debug=1') < 0) {
      FB._logging = false;
    }

    FB.XD.init(options.channelUrl);

    if (FB._apiKey) {
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
    }

    // weak dependency on XFBML
    if (options.xfbml) {
      // do this in a setTimeout to delay it until the current call stack has
      // finished executing
      window.setTimeout(function() {
        if (FB.XFBML) {
          FB.Dom.ready(FB.XFBML.parse);
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
window.setTimeout(function() { if (window.fbAsyncInit) { fbAsyncInit(); }}, 0);
