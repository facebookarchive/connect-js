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
 * @requires fb.type fb.xfbml.iframewidget
 */

/**
 * Base implementation for Edge Widgets.
 *
 * @class FB.XFBML.EdgeWidget
 * @extends FB.XFBML.IframeWidget
 * @private
 */
FB.subclass('XFBML.EdgeWidget', 'XFBML.IframeWidget', null, {
  /////////////////////////////////////////////////////////////////////////////
  // Internal stuff.
  /////////////////////////////////////////////////////////////////////////////

  /**
   * Make the iframe visible only when it has finished loading.
   */
  _visibleAfter: 'load',

  /**
   * Do initial attribute processing.
   */
  setupAndValidate : function() {
    this._attr = {
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
   * account the chosen layout, the user supplied height, and
   * the min and max values we'll allow.  As it turns out, we
   * don't see too much.
   *
   * @return {String} the CSS-legitimate width in pixels, as
   *         with '460px'.
   */

  _getWidgetHeight : function() {
    return this._getDefaultHeight();
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
    var width = this.getAttribute('width', this._getDefaultWidth());
    width = parseInt(width, 10);
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
   * Returns the default width that should be used for the
   * button rendering, and it's influenced by the actual
   * layout being used.
   *
   * @return {String} the default width that should be used to
   *         render the button, expressed as a CSS string (as
   *         with '580px'.
   */

  _getDefaultWidth : function() {
    var layout = this._getLayout();
    var should_show_faces = this._shouldShowFaces() ? 'show' : 'hide';
    var layoutToDefaultWidthMap =
      { 'standard': {'show': '580', 'hide': '580'},
        'box': {'show': '400', 'hide': '400'},
        'bar': {'show': '800', 'hide': '580'}};
    return layoutToDefaultWidthMap[layout][should_show_faces];
  },

  /**
   * Returns the default width that should be used for the
   * button rendering.  Note that the default height is influenced
   * by the layout.
   *
   * @return {String} the default width that should be used to
   *         render the button, expressed as a CSS string (as
   *         with '750px'.
   */

  _getDefaultHeight : function() {
    var layout = this._getLayout();
    var should_show_faces = this._shouldShowFaces() ? 'show' : 'hide';
    var layoutToDefaultHeightMap =
      { 'standard' : {'show': '78', 'hide': '42'},
        'box' : {'show': '105', 'hide': '65'},
        'bar' : {'show': '45' , 'hide': '45'}};
    return layoutToDefaultHeightMap[layout][should_show_faces];
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
    var layout = this.getAttribute('layout', this._getDefaultLayout());
    layout = layout.toLowerCase();
    var supported_layouts = {
      'standard' : true,
      'box' : true,
      'bar' : true
    };

    if (supported_layouts[layout] === undefined) {
      layout = this._getDefaultLayout();
    }

    return layout;
  },

  /**
   * Returns the layout that should be used if the user omits it,
   * or if he/she supplies a bogus layout we can't understand.
   *
   * @return {String} the name of the default layout.
   */

  _getDefaultLayout : function() {
      return 'standard';
  },

  /**
   * Returns true if and only if we should be showing faces in the
   * widget, and false otherwise.
   *
   * @return {String} described above.
   */

  _shouldShowFaces : function() {
    return this._getBoolAttribute('show_faces', false);
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
  }

});
