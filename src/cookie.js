/**
 * @module Mu
 * @provides mu.cookie
 * @requires mu.prelude
 *           mu.qs
 *           mu.auth
 */

/**
 * Cookie Support.
 *
 * @class Mu.Cookie
 * @static
 * @access private
 */
Mu.copy('Cookie', {
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
    if (!Mu.Cookie._initDone) {
      Mu.Event.on('auth.sessionChange', function(response) {
        Mu.Cookie.set(response.session);
      });
      Mu.Cookie._initDone = true;
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
      cookie = document.cookie.match('\\b' +'fbs_' + Mu._apiKey+ '=([^;]*)\\b'),
      session,
      expires;

    if (cookie) {
      // url encoded session
      session = Mu.QS.decode(cookie[1]);
      // decodes as a string, convert to a number
      expires = session.expires = parseInt(session.expires, 10);
      // capture base_domain for use when we need to clear
      Mu.Cookie._domain = session.base_domain;

      // dont use expired cookies, not that they should be around in the
      // first place. expires is 0 when offline_access has been granted.
      if (expires != 0 && new Date(expires * 1000) < new Date()) {
        session = null;
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
   * @param domain    {String} optional domain for cookie
   */
  setRaw: function(val, timestamp, domain) {
    document.cookie =
      'fbs_' + Mu._apiKey + '=' + val +
      '; expires=' + new Date(timestamp * 1000).toGMTString() +
      '; path=/' +
      (domain ? '; domain=.' + domain : '');

    // capture domain for use when we need to clear
    Mu.Cookie._domain = domain;
  },

  /**
   * Set the cookie using the given session object.
   *
   * @access private
   * @param session {Object} the session object
   */
  set: function(session) {
    session
      ? Mu.Cookie.setRaw(
          Mu.QS.encode(session),
          session.expires,
          session.base_domain)
      : Mu.Cookie.clear();
  },

  /**
   * Clear the cookie.
   *
   * @access private
   */
  clear: function() {
    Mu.Cookie.setRaw('', 0, Mu.Cookie._domain);
  }
});
