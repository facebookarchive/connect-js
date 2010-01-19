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
 * @provides fb.xfbml.addtowishlist
 * @layer xfbml
 * @requires fb.type fb.xfbml.edgewidget
 */

/**
 * Implementation for fb:add-to-wishlist tag.
 *
 * @class FB.XFBML.AddToWishList
 * @extends FB.XFBML.EdgeWidget
 * @private
 */
FB.subclass('XFBML.AddToWishList', 'XFBML.EdgeWidget', null, {
  /**
   * Returns the name that should be given to the iFrame being fetched and
   * rendered on behalf of this <fb:add-to-wishlist> button.
   *
   * @return {String} the name that should be given to the button's
   *         iFrame rendering.
   */
  getIframeName : function() {
    return 'fbAddToWishListIFrame_' + FB.XFBML.AddToWishList._iframeIdCount++;
  },

  /**
   * Returns the type of edge managed by the AddToWish button.
   *
   * @return string the string 'wish'
   */
  getEdgeType : function() {
    return 'wish';
  }
});

/**
 * Defines the collection of class-level directives needed to help control of
 * <fb:add-to-wishlist> buttons.
 */
FB.provide('XFBML.AddToWishList', {
  _iframeIdCount : 0
});
