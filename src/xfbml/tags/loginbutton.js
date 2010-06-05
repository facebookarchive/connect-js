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
 * @provides fb.xfbml.loginbutton
 * @layer xfbml
 * @requires fb.type
 *           fb.intl
 *           fb.xfbml.buttonelement
 *           fb.helper
 *           fb.auth
 */

/**
 * Implementation for fb:login-button tag.
 *
 * @class FB.XFBML.LoginButton
 * @extends  FB.XFBML.ButtonElement
 * @private
 */
FB.subclass('XFBML.LoginButton', 'XFBML.ButtonElement', null, {
  /**
   * Do initial attribute processing.
   *
   * @return {Boolean} true to continue processing, false to halt it
   */
  setupAndValidate: function() {
    this.autologoutlink = this._getBoolAttribute('auto-logout-link');
    this.onlogin = this.getAttribute('on-login');
    this.perms = this.getAttribute('perms');
    this.length = this._getAttributeFromList(
      'length',         // name
      'short',          // defaultValue
      ['long', 'short'] // allowed
    );
    this.iframe = this._getBoolAttribute('iframe');

    if (this.autologoutlink) {
      FB.Event.subscribe('auth.statusChange', FB.bind(this.process, this));
    }

    return true;
  },

  /**
   * Should return the button markup. The default behaviour is to return the
   * original innerHTML of the element.
   *
   * @return {String} the HTML markup for the button
   */
  getButtonMarkup: function() {
    var originalHTML = this.getOriginalHTML();
    if (originalHTML === '') {
      if (FB.getSession() && this.autologoutlink) {
        return FB.Intl.tx('cs:logout');
      } else {
        return this.length == 'short'
          ? FB.Intl.tx('cs:connect')
          : FB.Intl.tx('cs:connect-with-facebook');
      }
    } else {
      return originalHTML;
    }
  },

  /**
   * The ButtonElement base class will invoke this when the button is clicked.
   */
  onClick: function() {
    if (!FB.getSession() || !this.autologoutlink) {
      FB.login(FB.bind(this._authCallback, this), { perms: this.perms });
    } else {
      FB.logout(FB.bind(this._authCallback, this));
    }
  },

  /**
   * This will be invoked with the result of the FB.login() or FB.logout() to
   * pass the result to the developer specified callback if any.
   *
   * @param response {Object} the auth response object
   */
  _authCallback: function(response) {
    FB.Helper.invokeHandler(this.onlogin, this, [response]);
  }
});
