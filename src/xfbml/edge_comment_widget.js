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
 * @provides fb.xfbml.edgecommentwidget
 * @layer xfbml
 * @requires fb.type
 *           fb.xfbml.iframewidget
 *           fb.css.edgecommentwidget
 */

/**
 * Base implementation for Edge Comment Widgets.
 *
 * @class FB.XFBML.EdgeCommentWidget
 * @extends FB.XFBML.IframeWidget
 * @private
 */
FB.subclass('XFBML.EdgeCommentWidget', 'XFBML.IframeWidget',
  function(opts) {
    this._iframeWidth = opts.width;
    this._iframeHeight = opts.height;
    this._attr = {
      master_frame_name: opts.masterFrameName
    };
    this.dom = opts.commentNode;
    this.dom.style.top = opts.relativeHeightOffset;
    this.dom.style.zIndex = FB.XFBML.EdgeCommentWidget.NextZIndex++;
    FB.Dom.addCss(this.dom, 'fb_edge_comment_widget');
  }, {

  /////////////////////////////////////////////////////////////////////////////
  // Internal stuff.
  /////////////////////////////////////////////////////////////////////////////

  /**
   * Make the iframe visible only when it has finished loading.
   */
  _visibleAfter: 'load',
  _showLoader: false,

  /**
   * Get the initial size.
   *
   * @return {Object} the size
   */
  getSize: function() {
    return {
      width: this._iframeWidth,
      height: this._iframeHeight
    };
  },

  /**
   * Get there URL bits for the iframe.
   *
   * @return {Object} the iframe URL bits.
   */
  getUrlBits: function() {
    return { name: 'comment_widget_shell', params: this._attr };
  }
});

FB.provide('XFBML.EdgeCommentWidget', {
  NextZIndex : 10000
});
