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
 * @provides fb.json
 * @requires fb.prelude
 *           fb.thirdparty.json2
 */

/**
 * Simple wrapper around standard JSON to handle third-party library quirks.
 *
 * @class FB.JSON
 * @static
 * @access private
 */
FB.provide('JSON', {
  /**
   * Stringify an object.
   *
   * @param obj {Object} the input object
   * @return {String} the JSON string
   */
  stringify: function(obj) {
    // PrototypeJS is incompatible with native JSON or JSON2 (which is what
    // native JSON is based on)
    if (window.Prototype && Object.toJSON) {
      return Object.toJSON(obj);
    } else {
      return JSON.stringify(obj);
    }
  },

  /**
   * Parse a JSON string.
   *
   * @param str {String} the JSON string
   * @param {Object} the parsed object
   */
  parse: function(str) {
    return JSON.parse(str);
  },

  /**
   * Flatten an object to "stringified" values only. This is useful as a
   * pre-processing query strings where the server expects query parameter
   * values to be JSON encoded.
   *
   * @param obj {Object} the input object
   * @return {Object} object with only string values
   */
  flatten: function(obj) {
    var flat = {};
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) {
        var value = obj[key];
        if (null === value || undefined === value) {
          continue;
        } else if (typeof value == 'string') {
          flat[key] = value;
        } else {
          flat[key] = FB.JSON.stringify(value);
        }
      }
    }
    return flat;
  }
});
