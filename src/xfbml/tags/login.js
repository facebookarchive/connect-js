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
 * @provides fb.xfbml.login
 * @layer xfbml
 * @requires fb.type fb.xfbml.iframewidget fb.auth
 */

/**
 * Implementation for fb:login tag.
 *
 * @class FB.XFBML.Login
 * @extends FB.XFBML.IframeWidget
 * @private
 */
FB.subclass('XFBML.Login', 'XFBML.IframeWidget', null, {
  _visibleAfter: 'load',

  /**
   * Do initial attribute processing.
   */
  setupAndValidate: function() {
    this._attr = {
      channel: this.getChannelUrl(),
      max_friends: this.getAttribute('max-friends', 6)
    };

    return true;
  },

  /**
   * Setup event handlers.
   */
  oneTimeSetup: function() {
    // this widget's internal state is tied to the "connected" status. it
    // doesn't care about the difference between "unknown" and "notConnected".
    var lastStatus = FB._userStatus;
    FB.Event.subscribe('auth.statusChange', FB.bind(function(response) {
      if (lastStatus == 'connected' || response.status == 'connected') {
        this.process(true);
      }
      lastStatus = response.status;
    }, this));
  },

  /**
   * Get the initial size.
   *
   * By default, shows one row of 6 profiles
   *
   * @return {Object} the size
   */
  getSize: function() {
    return { width: 305, height: 97 };
  },

  /**
   * Get the URL bits for the iframe.
   *
   * @return {Object} the iframe URL bits
   */
  getUrlBits: function() {
    return { name: 'login', params: this._attr };
  }
});
