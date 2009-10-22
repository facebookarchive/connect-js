/**
 * @module Mu
 * @provides Mu.Cookie
 *
 * @requires Mu.Prelude
 *           Mu.QS
 *           Mu.Auth
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
   * Initialize the Cookie support. Sets up the handler to update the cookie
   * as the session changes.
   *
   * @access private
   * @returns {Object} the session object from the cookie if one is found
   */
  init: function() {
    // insert it directly at the begining and do nothing else
    Mu.Auth._callbacks.change.splice(0, 0, function(response) {
      Mu.Cookie.set(response.session);
    });

    return Mu.Cookie.load();
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
   */
  setRaw: function(val, timestamp) {
    document.cookie =
      'fbs_' + Mu._apiKey + '=' + val +
      '; expires=' + new Date(timestamp * 1000).toGMTString() +
      '; path=/';
  },

  /**
   * Set the cookie using the given session object.
   *
   * @access private
   * @param session {Object} the session object
   */
  set: function(session) {
    session
      ? Mu.Cookie.setRaw(Mu.QS.encode(session), session.expires)
      : Mu.Cookie.clear();
  },

  /**
   * Clear the cookie.
   *
   * @access private
   */
  clear: function() {
    Mu.Cookie.setRaw('', 0);
  }
});
