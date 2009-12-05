/**
 * @provides fb.Helper
 * @layer XFBML
 * @requires fb.prelude
 */

/**
 * Helper class for XFBML
 * @class FB.Helper
 * @private
 */
FB.provide('Helper', {
  /**
   * Check if an id is an user id, instead of a page id
   * [NOTE:] This code is based on is_user_id function in our server code.
   * If that function changes, we'd have to update this one as well.
   * @param {uid} id
   * @static
   */
  isUser: function(id) {
    return id < 2200000000 || (
              id >= 100000000000000 &&  // 100T is first 64-bit UID
              id <= 100099999989999); // 100T + 3,333,333*30,000 - 1)
  },

  getLoggedInUser: function() {
    return FB._session ? FB._session.uid : null;
  },



  /**
   * @param  {String} s
   * @return  {String}
   * @static
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
   * link to the explicit href or profile.php
   * @param  {FB.UserInfo} userInfo
   * @param  {String} html
   * @param  {String} href
   * @return  String
   * @static
   */
  getProfileLink: function(userInfo, html, href) {
    href = href || (userInfo ?  FB._domain.www + 'profile.php?id=' +
                    userInfo.uid : null);
    if (href) {
      html = '<a class="FB_Link" href="' + href + '">' + html + '</a>';
    }
    return html;
  }

});
