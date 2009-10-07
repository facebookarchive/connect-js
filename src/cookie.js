/**
 * @module Mu
 * @provides Mu.Cookie
 *
 * @requires Mu.Prelude
 *           Mu.QS
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
    // directly place the cookie subscriber at index 0 in
    // Mu._callbacks.sessionChange
    Mu._callbacks.sessionChange.splice(0, 0, function(response) {
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
      prefix  = 'fbs_' + Mu._apiKey + '=',
      cookies = document.cookie.split(';'),
      cookie,
      session;

    // look through all the cookies
    for (var i=0, l=cookies.length; i<l; i++) {
      cookie = cookies[i];

      // bad browser bad
      while (cookie.charAt(0) === ' ') {
        cookie = cookie.substring(1, cookie.length);
      }

      // is it the cookie we want?
      if (cookie.indexOf(prefix) === 0) {
        // url encoded session
        session = Mu.QS.decode(
          cookie.substring(prefix.length, cookie.length));
        // decodes as a string, convert to a number
        session.expires = parseInt(session.expires, 10);

        // dont use expired cookies, not that they should be around in the
        // first place.
        if (new Date(session.expires * 1000) < new Date()) {
          session = null;
        }
        break;
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
