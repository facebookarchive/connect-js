/**
 * Mu is a JavaScript library that provides Facebook Connect integration.
 *
 * @module Mu
 * @provides Mu.Core
 * @requires Mu.Prelude
 *           Mu.API
 *           Mu.Auth
 *           Mu.Cookie
 *           Mu.UI
 *           Mu.XD
 */

/**
 * This is the top level for all the public APIs.
 *
 * @class Mu
 * @static
 * @access public
 */
Mu.copy('', {
  /**
   * Initialize the library::
   *
   *    <div id="mu-root"></div>
   *    <script src="http://mu.daaku.org/m.js"></script>
   *    <script>
   *      Mu.init({ apiKey: 'YOUR API KEY' });
   *    </script>
   *
   * The best place to put this code is right before the closing
   * ``</body>`` tag.
   *
   *
   * Options:
   *
   * ======== ======= ================================== ============ =========
   * Property Type    Description                        Argument     Default
   * ======== ======= ================================== ============ =========
   * apiKey   String  Your application API key.          **Required**
   * cookie   Boolean ``true`` to enable cookie support. *Optional*   ``false``
   * session  Object  Use specified session object.      *Optional*   ``null``
   * status   Boolean ``true`` to fetch fresh status.    *Optional*   ``false``
   * ======== ======= ================================== ============ =========
   *
   * *Note*: `Mu.publish()`_ and `Mu.share()`_ can be used without
   * registering an application or calling this method. If you are
   * using an API key, all methods **must** be called after this method.
   *
   * .. _Mu.publish(): #method_publish
   * .. _Mu.share(): #method_share
   *
   * @access public
   * @param opts    {Object} options
   */
  init: function(opts) {
    Mu._apiKey = opts.apiKey;

    // initialize the XD layer
    Mu.XD.init();

    // enable cookie support and use cookie session if possible
    if (opts.cookie) {
      opts.session = opts.session || Mu.Cookie.init();
    }

    // set the given or cookie session
    Mu.Auth.setSession(opts.session, opts.session ? 'connected' : 'unknown', true);

    // fetch a fresh status from facebook.com if requested
    opts.status && Mu.watchStatus();
  }
});
