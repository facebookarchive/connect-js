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
 * @provides fb.xfbml.element
 * @layer xfbml
 * @requires fb.type fb.event fb.array
 */

/**
 * Base class for all XFBML elements. To create your own XFBML element, make a
 * class that derives from this, and then call [[joey:FB.XFBML.registerTag]].
 *
 * @access private
 * @class FB.XFBML.Element
 */
FB.Class('XFBML.Element',
  /**
   * Create a new Element.
   *
   * @access private
   * @constructor
   * @param dom {DOMElement} the DOMElement for the tag
   */
  function(dom) {
    this.dom = dom;
  },

  FB.copy({
  /**
   * Get the value of an attribute associated with this tag.
   *
   * Note, the transform function is never executed over the default value. It
   * is only used to transform user set attribute values.
   *
   * @access private
   * @param name {String} Name of the attribute.
   * @param defaultValue {Object} Default value if attribute isn't set.
   * @param transform {Function} Optional function to transform found value.
   * @return {Object} final value
   */
  getAttribute: function(name, defaultValue, transform) {
    var value = (
      this.dom.getAttribute(name) ||
      this.dom.getAttribute(name.replace(/-/g, '_')) ||
      this.dom.getAttribute(name.replace(/-/g, ''))
    );
    return value ? (transform ? transform(value) : value) : defaultValue;
  },

  /**
   * Helper function to extract boolean attribute value.
   *
   * @access private
   * @param name {String} Name of the attribute.
   * @param defaultValue {Object} Default value if attribute isn't set.
   */
  _getBoolAttribute: function(name, defaultValue) {
    return this.getAttribute(name, defaultValue, function(s) {
      s = s.toLowerCase();
      return s == 'true' || s == '1' || s == 'yes' || s == 'on';
    });
  },

  /**
   * Get an integer value for size in pixels.
   *
   * @access private
   * @param name {String} Name of the attribute.
   * @param defaultValue {Object} Default value if attribute isn't set.
   */
  _getPxAttribute: function(name, defaultValue) {
    return this.getAttribute(name, defaultValue, function(s) {
      var size = parseInt(s.replace('px', ''), 10);
      if (isNaN(size)) {
        return defaultValue;
      } else {
        return size;
      }
    });
  },

  /**
   * Get a value if it is in the allowed list, otherwise return the default
   * value. This function ignores case and expects you to use only lower case
   * allowed values.
   *
   * @access private
   * @param name {String} Name of the attribute.
   * @param defaultValue {Object} Default value
   * @param allowed {Array} List of allowed values.
   */
  _getAttributeFromList: function(name, defaultValue, allowed) {
    return this.getAttribute(name, defaultValue, function(s) {
      s = s.toLowerCase();
      if (FB.Array.indexOf(allowed, s) > -1) {
        return s;
      } else {
        return defaultValue;
      }
    });
  },

  /**
   * Check if this node is still valid and in the document.
   *
   * @access private
   * @returns {Boolean} true if element is valid
   */
  isValid: function() {
    for (var dom = this.dom; dom; dom = dom.parentNode) {
      if (dom == document.body) {
        return true;
      }
    }
  },

  /**
   * Clear this element and remove all contained elements.
   *
   * @access private
   */
  clear: function() {
    this.dom.innerHTML = '';
  }
}, FB.EventProvider));
