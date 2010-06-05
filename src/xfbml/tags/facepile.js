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
 * @provides fb.xfbml.facepile
 * @layer xfbml
 * @requires fb.type fb.xfbml.facepile fb.auth
 */

/**
 * Implementation for fb:facepile tag.
 *
 * @class FB.XFBML.Facepile
 * @extends FB.XFBML.Facepile
 * @private
 */
FB.subclass('XFBML.Facepile', 'XFBML.IframeWidget', null, {
  _visibleAfter: 'load',
  _showFaces: true,

  /**
   * Do initial attribute processing.
   */
  setupAndValidate: function() {
    this._attr = {
      channel: this.getChannelUrl(),
      max_rows: this.getAttribute('max-rows'),
      width: this._getPxAttribute('width', 200),
      show_faces: this._showFaces
    };

    return true;
  },

  /**
   * Set the value of one of the parameters that will be passed
   * to the url widget's url.
   */
  setShowFaces: function(val) {
    this._showFaces = val;
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
    return { width: this._attr.width, height: 70 };
  },

  /**
   * Get the URL bits for the iframe.
   *
   * @return {Object} the iframe URL bits
   */
  getUrlBits: function() {
    return { name: 'facepile', params: this._attr };
  }
});
