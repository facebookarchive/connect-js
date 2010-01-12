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
 * @provides xfbml.fb:login-button
 * @layer xfbml
 * @requires fb.type fb.xfbml.element fb.auth
 */

/**
 * Implementation for fb:login-button tag.
 * Note this implementation does not suppport the following features
 * in Connect V1:
 *   1. i18n support
 *   2. logout button
 *   3. 'onlogin' and 'onlogout' attributes
 *   3. Validation of allowed values on attributes
 *
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
    var
      size = this.getAttribute('size', 'medium'),
      background = this.getAttribute('background', 'light'),
      length = this.getAttribute('length', 'short'),
      rsrc = 'http://static.ak.fbcdn.net/rsrc.php/',
      imgMap = {
        dark_small_short: rsrc + 'zF1W2/hash/a969rwcd.gif',
        dark_medium_short: rsrc + 'zEF9L/hash/156b4b3s.gif',
        dark_medium_long: rsrc + 'zBIU2/hash/85b5jlja.gif',
        dark_large_short: rsrc + 'z1UX3/hash/a22m3ibb.gif',
        dark_large_long: rsrc + 'z7SXD/hash/8mzymam2.gif',
        light_small_short: rsrc + 'zDGBW/hash/8t35mjql.gif',
        light_medium_short: rsrc + 'z38X1/hash/6ad3z8m6.gif',
        light_medium_long: rsrc + 'zB6N8/hash/4li2k73z.gif',
        light_large_short: rsrc + 'zA114/hash/7e3mp7ee.gif',
        light_large_long: rsrc + 'z4Z4Q/hash/8rc0izvz.gif',
        white_small_short: rsrc + 'z900E/hash/di0gkqrt.gif',
        white_medium_short: rsrc + 'z10GM/hash/cdozw38w.gif',
        white_medium_long: rsrc + 'zBT3E/hash/338d3m67.gif',
        white_large_short: rsrc + 'zCOUP/hash/8yzn0wu3.gif',
        white_large_long: rsrc + 'zC6AR/hash/5pwowlag.gif'
      },
      src = imgMap[background + '_' + size + '_' + length];
    this.dom.innerHTML = (
      '<a onclick="FB.login(function(){});" ' +
      'class=\"fbconnect_login_button\">' +
      '<img src="' + src + '" alt="Connect"/></a>'
    );
  }
});
