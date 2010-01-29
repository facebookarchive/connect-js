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
 * @requires fb.type fb.event
 */

/**
 * Base class for all XFBML elements. To create your own XFBML element, make a
 * class that derives from this, and then call [[joey:FB.XFBML.registerTag]].
 *
 * @class FB.XFBML.Element
 */
FB.Class('XFBML.Element',
  /*
   * @constructor
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
   * @param name {String} Name of the attribute.
   * @param defaultValue {Object} Default value if attribute isn't set.
   * @param transform {Function} Optional function to transform found value.
   * @return {Object} final value
   */
  getAttribute: function(name, defaultValue, transform) {
    var value = this.dom.getAttribute(name);
    return value ? (transform ? transform(value) : value) : defaultValue;
  },

  /**
   * Helper function to extract boolean attribute value.
   *
   * @param name {String} Name of the attribute.
   * @param defaultValue {Object} Default value if attribute isn't set.
   */
  _getBoolAttribute: function(name, defaultValue) {
    return this.getAttribute(name, defaultValue, function(s) {
      s = s.toLowerCase();
      return s == 'true' || s == '1' || s == 'yes';
    });
  },

  /**
   * Get an integer value for size in pixels.
   *
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
   * Check if this node is still valid and in the document.
   *
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
   */
  clear: function() {
    this.dom.innerHTML = '';
  }
}, FB.EventProvider));
