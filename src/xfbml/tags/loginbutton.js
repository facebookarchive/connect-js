/**
 * @provides xfbml.fb:login-button
 * @layer XFBML
 * @requires fb.Type fb.XFBML.Element fb.auth
 */

/**
 * Implementation for fb:login-button tag.
 * Note this implementation does not suppport the following features
 * in Connect V1:
 * 1. i18n support
 * 2. logout button
 * 3. 'onlogin' and 'onlogout' attributes
 * 3. Validation of allowed values on attributes
 * @class FB.XFBML.LoginButton
 * @extends  FB.XFBML.Element
 * @private
 */
FB.subclass('XFBML.LoginButton', 'XFBML.Element', null,
  /*
   * Instance methods
   */
  {
  process: function() {

    var size = this.getAttribute('size', 'medium'),
    background = this.getAttribute('background', 'light'),
    length = this.getAttribute('length', 'short'),
    imgMap = {
      dark_small_short: "http:\/\/static.ak.fbcdn.net\/rsrc.php\/zF1W2\/hash\/a969rwcd.gif",
      dark_medium_short: "http:\/\/static.ak.fbcdn.net\/rsrc.php\/zEF9L\/hash\/156b4b3s.gif",
      dark_medium_long: "http:\/\/static.ak.fbcdn.net\/rsrc.php\/zBIU2\/hash\/85b5jlja.gif",
      dark_large_short: "http:\/\/static.ak.fbcdn.net\/rsrc.php\/z1UX3\/hash\/a22m3ibb.gif",
      dark_large_long: "http:\/\/static.ak.fbcdn.net\/rsrc.php\/z7SXD\/hash\/8mzymam2.gif",
      light_small_short: "http:\/\/static.ak.fbcdn.net\/rsrc.php\/zDGBW\/hash\/8t35mjql.gif",
      light_medium_short: "http:\/\/static.ak.fbcdn.net\/rsrc.php\/z38X1\/hash\/6ad3z8m6.gif",
      light_medium_long: "http:\/\/static.ak.fbcdn.net\/rsrc.php\/zB6N8\/hash\/4li2k73z.gif",
      light_large_short: "http:\/\/static.ak.fbcdn.net\/rsrc.php\/zA114\/hash\/7e3mp7ee.gif",
      light_large_long: "http:\/\/static.ak.fbcdn.net\/rsrc.php\/z4Z4Q\/hash\/8rc0izvz.gif",
      white_small_short: "http:\/\/static.ak.fbcdn.net\/rsrc.php\/z900E\/hash\/di0gkqrt.gif",
      white_medium_short: "http:\/\/static.ak.fbcdn.net\/rsrc.php\/z10GM\/hash\/cdozw38w.gif",
      white_medium_long: "http:\/\/static.ak.fbcdn.net\/rsrc.php\/zBT3E\/hash\/338d3m67.gif",
      white_large_short: "http:\/\/static.ak.fbcdn.net\/rsrc.php\/zCOUP\/hash\/8yzn0wu3.gif",
      white_large_long: "http:\/\/static.ak.fbcdn.net\/rsrc.php\/zC6AR\/hash\/5pwowlag.gif"
    },
    src = imgMap[background + '_' + size + '_' + length];
    this.dom.innerHTML = '<a onclick="FB.login(function(){});"  class=\"fbconnect_login_button\">'
      + '<img src="' + src + '" alt="Connect"/></a>';
  }
});
