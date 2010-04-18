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
 * @provides fb.xfbml.activity
 * @layer xfbml
 * @requires fb.type fb.xfbml.iframewidget
 */

/**
 * Implementation for fb:activity tag.
 *
 * @class FB.XFBML.Activity
 * @extends FB.XFBML.IframeWidget
 * @private
 */
FB.subclass('XFBML.Activity', 'XFBML.IframeWidget', null, {
  _visibleAfter: 'load',

  /**
   * Refresh the iframe on auth.statusChange events.
   */
  _refreshOnAuthChange: true,

  /**
   * Do initial attribute processing.
   */
  setupAndValidate: function() {
    this._attr = {
      border_color    : this.getAttribute('border-color'),
      colorscheme     : this.getAttribute('color-scheme'),
      font            : this.getAttribute('font'),
      header          : this._getBoolAttribute('header'),
      height          : this._getPxAttribute('height', 300),
      recommendations : this._getBoolAttribute('recommendations'),
      site            : this.getAttribute('site', location.hostname),
      width           : this._getPxAttribute('width', 300)
    };

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
    return { name: 'activity', params: this._attr };
  }
});
