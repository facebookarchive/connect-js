/**
 * @module FB
 * @provides fb.cookie
 * @requires fb.prelude
 *           fb.qs
 *           fb.event
 *           fb.auth
 */

/**
 * Cookie Support.
 *
 * @class FB.Cookie
 * @static
 * @access private
 */
FB.copy('Cookie', {
  /**
   * Holds the base_domain property to match the Cookie domain.
   *
   * @access private
   * @type String
   */
  _domain: null,

  /**
   * Initialize the Cookie support. Sets up the handler to update the cookie
   * as the session changes.
   *
   * @access private
   * @returns {Object} the session object from the cookie if one is found
   */
  init: function() {
    if (!FB.Cookie._initDone) {
      FB.Event.subscribe('auth.sessionChange', function(response) {
        FB.Cookie.set(response.session);
      });
      FB.Cookie._initDone = true;
    }
  },

  /**
   * Try loading the session from the Cookie.
   *
   * @access private
   * @returns {Object} the session object from the cookie if one is found
   */
  load: function() {
    var
      cookie = document.cookie.match('\\b' +'fbs_' + FB._apiKey+ '=([^;]*)\\b'),
      session,
      expires;

    if (cookie) {
      // url encoded session stored as "sub-cookies"
      session = FB.QS.decode(cookie[1]);
      // decodes as a string, convert to a number
      expires = session.expires = parseInt(session.expires, 10);
      // capture base_domain for use when we need to clear
      FB.Cookie._domain = session.base_domain;
    }

    return session;
  },

  /**
   * Helper function to set cookie value.
   *
   * @access private
   * @param val       {String} the string value (should already be encoded)
   * @param timestamp {Number} a unix timestamp denoting expiry
   * @param domain    {String} optional domain for cookie
   */
  setRaw: function(val, timestamp, domain) {
    document.cookie =
      'fbs_' + FB._apiKey + '=' + val +
      '; expires=' + new Date(timestamp * 1000).toGMTString() +
      '; path=/' +
      (domain ? '; domain=.' + domain : '');

    // capture domain for use when we need to clear
    FB.Cookie._domain = domain;
  },

  /**
   * Set the cookie using the given session object.
   *
   * @access private
   * @param session {Object} the session object
   */
  set: function(session) {
    session
      ? FB.Cookie.setRaw(
          FB.QS.encode(session),
          session.expires,
          session.base_domain)
      : FB.Cookie.clear();
  },

  /**
   * Clear the cookie.
   *
   * @access private
   */
  clear: function() {
    FB.Cookie.setRaw('', 0, FB.Cookie._domain);
  }
});
