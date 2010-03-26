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
 * @provides fb.xfbml.serverfbml
 * @layer xfbml
 * @requires fb.type fb.content fb.xfbml.iframewidget fb.auth
 */

/**
 * Implementation for fb:serverfbml tag.
 *
 * @class FB.XFBML.ServerFbml
 * @extends FB.XFBML.IframeWidget
 * @private
 */
FB.subclass('XFBML.ServerFbml', 'XFBML.IframeWidget', null, {
  /**
   * Make the iframe visible only when we get the initial resize message.
   */
  _visibleAfter: 'resize',

  /**
   * Do initial attribute processing.
   */
  setupAndValidate: function() {
    // query parameters to the comments iframe
    this._attr = {
      channel_url : this.getChannelUrl(),
      fbml        : this.getAttribute('fbml'),
      width       : this._getPxAttribute('width')
    };

    // fbml may also be specified as a child script tag
    if (!this._attr.fbml) {
      var child = this.dom.getElementsByTagName('script')[0];
      if (child && child.type === 'text/fbml') {
        this._attr.fbml = child.innerHTML;
      }
    }

    // if still no fbml, error
    if (!this._attr.fbml) {
      FB.log('<fb:serverfbml> requires the "fbml" attribute.');
      return false;
    }

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
    return { name: 'serverfbml', params: this._attr };
  }
});
