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
 * @provides fb.xfbml.like
 * @layer xfbml
 * @requires fb.type fb.xfbml.edgewidget
 */

/**
 * Implementation for fb:like tag.
 *
 * @class FB.XFBML.Like
 * @extends FB.XFBML.EdgeWidget
 * @private
 */
FB.subclass('XFBML.Like', 'XFBML.EdgeWidget', null, {
  /**
   * @return {String} the name that should be given to the button's
   *         iFrame rendering.
   */
  getIframeName : function() {
    return 'fbLikeIFrame_' + FB.XFBML.Like._iframeIdCount++;
  },

  /**
   * Get the URL for the iframe.
   *
   * @return {String} the iframe URL
   */
  getIframeUrl : function() {
    return FB._domain.www + 'widgets/like.php?' + FB.QS.encode(this._attr);
  }
});

/**
 * Defines the collection of class-level directives needed to help control of
 * <fb:like> buttons.
 */
FB.provide('XFBML.Like', {
  _iframeIdCount : 0
});
