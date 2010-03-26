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
 * @provides fb.xfbml.edgewidget
 * @layer xfbml
 * @requires fb.type
 *           fb.dom
 *           fb.xfbml.iframewidget
 *           fb.xfbml.edgecommentwidget
 */

/**
 * Base implementation for Edge Widgets.
 *
 * @class FB.XFBML.EdgeWidget
 * @extends FB.XFBML.IframeWidget
 * @private
 */
FB.subclass('XFBML.EdgeWidget', 'XFBML.IframeWidget', null, {
  /**
   * Make the iframe visible only when it has finished loading.
   */
  _visibleAfter: 'load',

  /**
   * Do initial attribute processing.
   */
  setupAndValidate : function() {
    FB.Dom.addCss(this.dom, 'fb_edge_widget_with_comment');
    this._attr = {
      channel_url      : this.getChannelUrl(),
      text_color       : this.getAttribute('text_color', 'black'),
      background_color : this.getAttribute('background_color', 'white'),
      debug            : this._getBoolAttribute('debug'),
      href             : this.getAttribute('href', window.location.href),
      is_permalink     : this._getBoolAttribute('is_permalink'),
      node_type        : this.getAttribute('node_type', 'link'),
      layout           : this._getLayout(),
      show_faces       : this._shouldShowFaces(),
      max_faces        : this._getMaxFacesToShow()
    };

    return true;
  },

 /**
  * Our edge widget needs to
  *
  */

  oneTimeSetup : function() {
    this.subscribe('xd.presentEdgeCommentDialog',
                   FB.bind(this._handleEdgeCommentDialogPresentation, this));
    this.subscribe('xd.dismissEdgeCommentDialog',
                   FB.bind(this._handleEdgeCommentDialogDismissal, this));
  },

  /**
   * Get the initial size.
   *
   * @return {Object} the size
   */
  getSize: function() {
    return {
      width: this._getWidgetWidth(),
      height: this._getWidgetHeight()
    };
  },

  /**
   * Returns the height of the widget iframe, taking into
   * account the chosen layout, a user-supplied height, and
   * the min and max values we'll allow.  As it turns out, we
   * don't see too much.  (At the moment, we ignore the any
   * user-defined height, but that might change.)
   *
   * @return {String} the CSS-legitimate width in pixels, as
   *         with '460px'.
   */

  _getWidgetHeight : function() {
    var layout = this._getLayout();
    var should_show_faces = this._shouldShowFaces() ? 'show' : 'hide';
    var layoutToDefaultHeightMap =
      { 'standard' : {'show': 78, 'hide': 45},
        'box' : {'show': 105, 'hide': 65},
        'bar' : {'show': 45 , 'hide': 45}};
    return layoutToDefaultHeightMap[layout][should_show_faces];
  },

  /**
   * Returns the width of the widget iframe, taking into
   * account the chosen layout, the user supplied width, and
   * the min and max values we'll allow.  There is much more
   * flexibility in how wide the widget is, so a user-supplied
   * width just needs to fall within a certain range.
   *
   * @return {String} the CSS-legitimate width in pixels, as
   *         with '460px'.
   */

  _getWidgetWidth : function() {
    var layout = this._getLayout();
    var should_show_faces = this._shouldShowFaces() ? 'show' : 'hide';
    var layoutToDefaultWidthMap =
      { 'standard': {'show': 580, 'hide': 580},
        'box': {'show': 400, 'hide': 400},
        'bar': {'show': 800, 'hide': 580}};
    var defaultWidth = layoutToDefaultWidthMap[layout][should_show_faces];
    var width = this._getPxAttribute('width', defaultWidth)

    var allowedWidths =
      {'bar' : {'min' : 600, 'max' : 900 },
       'box' : {'min' : 350, 'max' : 450 },
       'standard' : {'min' : 500, 'max' : 900}};
    if (width < allowedWidths[layout].min) {
      width = allowedWidths[layout].min;
    } else if (width > allowedWidths[layout].max) {
      width = allowedWidths[layout].max;
    }

    return width;
  },

  /**
   * Returns the layout provided by the user, which can be
   * any one of 'standard', 'box', or 'bar'.  If the user
   * omits a layout, or if they layout they specify is invalid,
   * then we just go with 'standard'.
   *
   * @return {String} the layout of the Connect Widget.
   */

  _getLayout : function() {
    return this._getAttributeFromList('layout',
                                      'standard',
                                      ['standard', 'box', 'bar']);
  },

  /**
   * Returns true if and only if we should be showing faces in the
   * widget, and false otherwise.
   *
   * @return {String} described above.
   */

  _shouldShowFaces : function() {
    return this._getBoolAttribute('show_faces', true);
  },

  /**
   * Returns the maximum number of profiles pictures
   * that should be displayed in the widget.
   *
   * @return {Integer} the maximum number of profile pictures
   *         we're willing to show inside a connect widget.
   */

  _getMaxFacesToShow : function() {
    var max_faces = this.getAttribute('max_faces', 24);
    if (max_faces < 3) {
      max_faces = 3;
    } else if (max_faces > 36) {
      max_faces = 36;
    }

    return max_faces;
  },

  /**
   * Handles the event fired when the user actually connects to
   * something.  The idea is to tell the host to drop in
   * another iframe widget--an FB.XFBML.EdgeCommentWidget--
   * and sensibly position it so it partially overlays
   * the mother widget.
   *
   * @param {Object} message a dictionary of information about the
   *        event.
   * @return void
   */

  _handleEdgeCommentDialogPresentation : function(message) {
    if (!this.isValid()) {
      return;
    }

    var comment_node = document.createElement('span');
    // TODO(jcain): auto-resizing of comment widget isn't working perfectly,
    // so manually passing through iframe size until bug can be resolved.
    var opts = {
      commentNode : comment_node,
      externalUrl : message.externalURL,
      width : 330,
      height : 200,
      widgetID : message.widgetID,
      backgroundColor : this._attr.background_color,
      relativeHeightOffset : message.relativeHeightOffset
    };

    this._commentSlave = new FB.XFBML.EdgeCommentWidget(opts);
    this.dom.appendChild(comment_node);
    this._commentSlave.process();
    this._commentWidgetNode = comment_node;
  },

  /**
   * Handles the XD event instructing the host to
   * remove the comment widget iframe.  The DOM node
   * for this widget is currently carrying just one child
   * node, which is the span representing the iframe.
   * We just need to return that one child in order for the
   * comment widget to disappear.
   *
   * @param {Object} message a dictionary of information about
   *        the event.
   * @return void
   */

  _handleEdgeCommentDialogDismissal : function(message) {
    if (this._commentWidgetNode) {
      this.dom.removeChild(this._commentWidgetNode);
      delete this._commentWidgetNode;
    }
  }
});
