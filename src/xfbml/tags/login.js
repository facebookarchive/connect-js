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
      api_key     : FB._apiKey,
      session_key : FB._session && FB._session.session_key,
      channel     : this.getChannelUrl()
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
   * @return {Object} the size
   */
  getSize: function() {
    return { width: 300, height: 300 };
  },

  /**
   * Get the URL for the iframe.
   *
   * @return {String} the iframe URL
   */
  getIframeUrl: function() {
    return FB._domain.www + 'widgets/login.php?' + FB.QS.encode(this._attr);
  }
});
