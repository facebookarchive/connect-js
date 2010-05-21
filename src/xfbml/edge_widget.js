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
 *           fb.event
 *           fb.helper
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
  _visibleAfter: 'immediate',
  _showLoader: false,

  /**
   * Do initial attribute processing.
   */
  setupAndValidate : function() {
    FB.Dom.addCss(this.dom, 'fb_edge_widget_with_comment');
    this._attr = {
      channel_url      : this.getChannelUrl(),
      debug            : this._getBoolAttribute('debug'),
      href             : this.getAttribute('href', window.location.href),
      is_permalink     : this._getBoolAttribute('is-permalink'),
      node_type        : this.getAttribute('node-type', 'link'),
      width            : this._getWidgetWidth(),
      font             : this.getAttribute('font'),
      layout           : this._getLayout(),
      colorscheme      : this.getAttribute('color-scheme'),
      action           : this.getAttribute('action'),
      show_faces       : this._shouldShowFaces(),
      no_resize        : this._getBoolAttribute('no_resize')
    };

    return true;
  },

  // TODO(jcain): update so that master iframe controls everything,
  // including commenting
  oneTimeSetup : function() {
    // for now, showing the comment dialog also implies the user created an
    // edge to the thing, so we alias it.
    this.subscribe('xd.presentEdgeCommentDialog',
                   FB.bind(this._onEdgeCreate, this));
    this.subscribe('xd.presentEdgeCommentDialog',
                   FB.bind(this._handleEdgeCommentDialogPresentation, this));
    this.subscribe('xd.dismissEdgeCommentDialog',
                   FB.bind(this._handleEdgeCommentDialogDismissal, this));
    this.subscribe('xd.hideEdgeCommentDialog',
                   FB.bind(this._handleEdgeCommentDialogHide, this));
    this.subscribe('xd.showEdgeCommentDialog',
                   FB.bind(this._handleEdgeCommentDialogShow, this));

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
   * This logic is replicated in html/plugins/like.php and
   * lib/external_node/param_validation.php, and must be replicated
   * because it helps size the client's iframe.
   *
   * @return {String} the CSS-legitimate width in pixels, as
   *         with '460px'.
   */
  _getWidgetHeight : function() {
    var layout = this._getLayout();
    var should_show_faces = this._shouldShowFaces() ? 'show' : 'hide';
    var layoutToDefaultHeightMap =
      { 'standard' : {'show': 80, 'hide': 35},
        'bar' : {'show': 45 , 'hide': 35},
        'button_count' : {'show': 21, 'hide': 21}};
    return layoutToDefaultHeightMap[layout][should_show_faces];
  },

  /**
   * Returns the width of the widget iframe, taking into
   * account the chosen layout, the user supplied width, and
   * the min and max values we'll allow.  There is much more
   * flexibility in how wide the widget is, so a user-supplied
   * width just needs to fall within a certain range.
   *
   * This logic is replicated in html/plugins/like.php and
   * lib/external_node/param_validation.php, and must be replicated
   * because it helps size the client's iframe.
   *
   * @return {String} the CSS-legitimate width in pixels, as
   *         with '460px'.
   */
  _getWidgetWidth : function() {
    var layout = this._getLayout();
    var should_show_faces = this._shouldShowFaces() ? 'show' : 'hide';
    var button_count_default_width =
      this.getAttribute('action') === 'recommend' ? 130 : 90;
    var layoutToDefaultWidthMap =
      { 'standard': {'show': 450,
                     'hide': 450},
        'bar': {'show': 700,
                'hide': 450},
        'button_count': {'show': button_count_default_width,
                         'hide': button_count_default_width}};
    var defaultWidth = layoutToDefaultWidthMap[layout][should_show_faces];
    var width = this._getPxAttribute('width', defaultWidth)

    var allowedWidths =
      { 'bar' : {'min' : 600, 'max' : 900 },
        'standard' : {'min' : 225, 'max' : 900},
        'button_count' : {'min' : button_count_default_width,
                          'max' : 900}};
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
   * This logic is replicated in html/plugins/like.php and
   * lib/external_node/param_validation.php, and must be replicated
   * because it helps size the client's iframe.
   *
   * @return {String} the layout of the Connect Widget.
   */
  _getLayout : function() {
    return this._getAttributeFromList('layout',
                                      'standard',
                                      ['standard', 'bar', 'button_count']);
  },

  /**
   * Returns true if and only if we should be showing faces in the
   * widget, and false otherwise.
   *
   * This logic is replicated in html/plugins/like.php and
   * lib/external_node/param_validation.php, and must be replicated
   * because it helps size the client's iframe.
   *
   * @return {String} described above.
   */
  _shouldShowFaces : function() {
    return this._getLayout() !== 'button_count' &&
           this._getBoolAttribute('show-faces', true);
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
    var opts = {
      commentNode : comment_node,
      externalUrl : message.externalURL,
      width : 330,
      height : 200,
      masterFrameName : message.masterFrameName,
      relativeHeightOffset : '26px'
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
  },

  /**
   * Handles the XD event instructing the hose to hide the comment
   * widget iframe.
   */
  _handleEdgeCommentDialogHide: function() {
    if (this._commentWidgetNode) {
      this._commentWidgetNode.style.display="none";
    }
  },

  /**
   * Handles the XD event instructing the hose to show the comment
   * widget iframe.
   */
  _handleEdgeCommentDialogShow: function() {
    if (this._commentWidgetNode) {
      this._commentWidgetNode.style.display="block";
    }
  },

  /**
   * Invoked when the user likes/recommends/whatever the thing to create an
   * edge.
   */
  _onEdgeCreate: function() {
    this.fire('edge.create', this._attr.href); // dynamically attached
    FB.Event.fire('edge.create', this._attr.href, this); // global
    FB.Helper.invokeHandler(
      this.getAttribute('on-create'), this, [this._attr.href]); // inline
  }
});
