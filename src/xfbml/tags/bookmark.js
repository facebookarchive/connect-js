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
 * @provides fb.xfbml.bookmark
 * @layer xfbml
 * @requires fb.type
 *           fb.intl
 *           fb.ui
 *           fb.xfbml.buttonelement
 *           fb.helper
 */

/**
 * Implementation for fb:bookmark tag.
 *
 * @class FB.XFBML.Bookmark
 * @extends  FB.XFBML.ButtonElement
 * @private
 */
FB.subclass('XFBML.Bookmark', 'XFBML.ButtonElement', null, {
  /**
   * Should return the button markup. The default behaviour is to return the
   * original innerHTML of the element.
   *
   * @return {String} the HTML markup for the button
   */
  getButtonMarkup: function() {
    return FB.Intl.tx('cs:bookmark-on-facebook');
  },

  /**
   * The ButtonElement base class will invoke this when the button is clicked.
   */
  onClick: function() {
    FB.ui({ method: 'bookmark.add' }, this.bind(function(result) {
      if (result.bookmarked) {
        FB.Helper.invokeHandler(this.getAttribute('on-add'), this);
      }
    }));
  }
});
