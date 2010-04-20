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
FB.subclass('XFBML.Login', 'XFBML.Facepile', null, {
  _visibleAfter: 'load',

  /**
   * Get the initial size.
   *
   * By default, shows one row of 6 profiles
   *
   * @return {Object} the size
   */
  getSize: function() {
    return { width: this._attr.width, height: 94 };
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
