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
 * @provides fb.xfbml.fan
 * @layer xfbml
 * @requires fb.type fb.xfbml.iframewidget
 */

/**
 * Implementation for fb:fan tag.
 *
 * @class FB.XFBML.Fan
 * @extends FB.XFBML.IframeWidget
 * @private
 */
FB.subclass('XFBML.Fan', 'XFBML.IframeWidget', null, {
  _visibleAfter: 'load',

  /**
   * Do initial attribute processing.
   */
  setupAndValidate: function() {
    this._attr = {
      api_key     : FB._apiKey,
      connections : this.getAttribute('connections', '10'),
      css         : this.getAttribute('css'),
      height      : this.getAttribute('height'),
      id          : this.getAttribute('profile-id'),
      logobar     : this._getBoolAttribute('logo-bar'),
      name        : this.getAttribute('name'),
      stream      : this._getBoolAttribute('stream', true),
      width       : this._getPxAttribute('width', 300)
    };

    // "id" or "name" is required
    if (!this._attr.id && !this._attr.name) {
      FB.log('<fb:fan> requires one of the "id" or "name" attributes.');
      return false;
    }

    var height = this._attr.height;
    if (!height) {
      if ((!this._attr.connections || this._attr.connections === '0') &&
          !this._attr.stream) {
        height = 65;
      } else if (!this._attr.connections || this._attr.connections === '0') {
        height = 375;
      } else if (!this._attr.stream) {
        height = 250;
      } else {
        height = 550;
      }
    }
    // add space for logobar
    if (this._attr.logobar) {
      height += 25;
    }

    this._attr.height = height;
    return true;
  },

  /**
   * Get the initial size.
   *
   * @return {Object} the size
   */
  getSize: function() {
    return { width: this._attr.width, height: this._attr.height };
  },

  /**
   * Get the URL bits for the iframe.
   *
   * @return {Object} the iframe URL bits
   */
  getUrlBits: function() {
    return { name: 'fan', params: this._attr };
  }
});
