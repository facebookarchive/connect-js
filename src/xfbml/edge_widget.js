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
  // Methods the implementation MUST override.
  /////////////////////////////////////////////////////////////////////////////

  /**
   * The edge type.
   *
   * @return {String} the edge type
   */
  getEdgeType: function() {
    throw new Error('The inheriting class must specify the edge type.');
  },

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
      bgcolor      : this.getAttribute('bgcolor', 'white'),
      debug        : this._getBoolAttribute('debug'),
      edge_type    : this.getEdgeType(),
      external_url : this.getAttribute('permalink', window.location.href),
      node_type    : this.getAttribute('node_type', 'page'),
      page_url     : window.location.href
    };

    return true;
  },

  /**
   * Get the initial size.
   *
   * @return {Object} the size
   */
  getSize: function() {
    // might allow this to be overridden in the future
    return { width: 580, height: 100 };
  },

  /**
   * Get the URL for the iframe.
   *
   * @return {String} the iframe URL
   */
  getIframeUrl : function() {
    return (
      FB._domain.www +
      'connect/connect_to_node.php?' +
      FB.QS.encode(this._attr)
    );
  }
});
