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
 * @provides fb.helper
 * @layer xfbml
 * @requires fb.prelude
 */

/**
 * Helper class for XFBML
 * @class FB.Helper
 * @static
 * @private
 */
FB.provide('Helper', {
  /**
   * Check if an id is an user id, instead of a page id
   *
   * [NOTE:] This code is based on is_user_id function in our server code.
   * If that function changes, we'd have to update this one as well.
   *
   * @param {uid} id
   * @returns {Boolean} true if the given id is a user id
   */
  isUser: function(id) {
    return id < 2200000000 || (
              id >= 100000000000000 &&  // 100T is first 64-bit UID
              id <= 100099999989999); // 100T + 3,333,333*30,000 - 1)
  },

  /**
   * Return the current user's UID if available.
   *
   * @returns {String|Number} returns the current user's UID or null
   */
  getLoggedInUser: function() {
    return FB._session ? FB._session.uid : null;
  },

  /**
   * Uppercase the first character of the String.
   *
   * @param s {String} the string
   * @return {String} the string with an uppercase first character
   */
  upperCaseFirstChar: function(s) {
    if (s.length > 0) {
      return s.substr(0, 1).toUpperCase() + s.substr(1);
    }
    else {
      return s;
    }
  },

  /**
   * Link to the explicit href or profile.php.
   *
   * @param userInfo {FB.UserInfo} User info object.
   * @param html {String} Markup for the anchor tag.
   * @param href {String} Custom href.
   * @returns {String} the anchor tag markup
   */
  getProfileLink: function(userInfo, html, href) {
    href = href || (userInfo ? FB._domain.www + 'profile.php?id=' +
                    userInfo.uid : null);
    if (href) {
      html = '<a class="fb_link" href="' + href + '">' + html + '</a>';
    }
    return html;
  },

  /**
   * Convenienve function to fire an event handler attribute value. This is a
   * no-op for falsy values, eval for strings and invoke for functions.
   *
   * @param handler {Object}
   * @param scope {Object}
   * @param args {Array}
   */
  invokeHandler: function(handler, scope, args) {
    if (handler) {
      if (typeof handler === 'string') {
        eval(handler);
      } else if (handler.apply) {
        handler.apply(scope, args || []);
      }
    }
  }
});
