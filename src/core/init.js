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
FB.copy('', {
  /**
   * Initialize the library::
   *
   *    <div id="fb-root"></div>
   *    <script src="http://static.ak.fbcdn.net/connect/en_US/core.js"></script>
   *    <script>
   *      FB.init({ apiKey: 'YOUR API KEY' });
   *    </script>
   *
   * The best place to put this code is right before the closing
   * ``</body>`` tag.
   *
   *
   * Options:
   *
   * ======== ======= =================================== ============ =========
   * Property Type    Description                         Argument     Default
   * ======== ======= =================================== ============ =========
   * apiKey   String  Your application API key.           **Required**
   * cookie   Boolean ``true`` to enable cookie support.  *Optional*   ``false``
   * logging  Boolean ``false`` to disable logging.       *Optional*   ``true``
   * session  Object  Use specified session object.       *Optional*   ``null``
   * status   Boolean ``true`` to fetch fresh status.     *Optional*   ``false``
   * ======== ======= =================================== ============ =========
   *
   * *Note*: `FB.publish()`_ and `FB.share()`_ can be used without
   * registering an application or calling this method. If you are
   * using an API key, all methods **must** be called after this method.
   *
   * .. _FB.publish(): #method_FB.publish
   * .. _FB.share(): #method_FB.share
   *
   * @access public
   * @param opts    {Object} options
   */
  init: function(opts) {
    if (!opts || !opts.apiKey) {
      FB.log('FB.init() called without an apiKey.');
      return;
    }

    // only need to list values here that do not already have a falsy default.
    // this is why cookie/session/status are not listed here.
    FB.copy(opts, {
      logging: true
    });

    FB._apiKey = opts.apiKey;

    // disable logging if told to do so, but only if the url doesnt have the
    // token to turn it on. this allows for easier debugging of third party
    // sites even if logging has been turned off.
    if (!opts.logging && window.location.toString().indexOf('fb_debug=1') < 0) {
      FB._logging = false;
    }

    // enable cookie support if told to do so
    if (opts.cookie) {
      FB.Cookie.init();
    }

    // if an explicit session was not given, try to _read_ an existing cookie.
    // we dont enable writing automatically, but we do read automatically.
    opts.session = opts.session || FB.Cookie.load();

    // set the session
    FB.Auth.setSession(opts.session, opts.session ? 'connected' : 'unknown');

    // load a fresh session if requested
    if (opts.status) {
      FB.getLoginStatus();
    }
  }
});
