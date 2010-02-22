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
 * @provides fb.array
 * @layer basic
 * @requires fb.prelude
 */

/**
 * Array related helper methods.
 *
 * @class FB.Array
 * @private
 * @static
 */
FB.provide('Array', {
  /**
   * Get index of item inside an array. Return's -1 if element is not found.
   *
   * @param arr {Array} Array to look through.
   * @param item {Object} Item to locate.
   * @return {Number} Index of item.
   */
  indexOf: function (arr, item) {
    if (arr.indexOf) {
      return arr.indexOf(item);
    }
    var length = arr.length;
    if (length) {
      for (var index = 0; index < length; index++) {
        if (arr[index] === item) {
          return index;
        }
      }
    }
    return -1;
  },

  /**
   * Merge items from source into target, but only if they dont exist. Returns
   * the target array back.
   *
   * @param target {Array} Target array.
   * @param source {Array} Source array.
   * @return {Array} Merged array.
   */
  merge: function(target, source) {
    for (var i=0; i < source.length; i++) {
      if (FB.Array.indexOf(target, source[i]) < 0) {
        target.push(source[i]);
      }
    }
    return target;
  },

  /**
   * Create an new array from the given array and a filter function.
   *
   * @param arr {Array} Source array.
   * @param fn {Function} Filter callback function.
   * @return {Array} Filtered array.
   */
  filter: function(arr, fn) {
    var b = [];
    for (var i=0; i < arr.length; i++) {
      if (fn(arr[i])) {
        b.push(arr[i]);
      }
    }
    return b;
  },

  /**
   * Create an array from the keys in an object.
   *
   * Example: keys({'x': 2, 'y': 3'}) returns ['x', 'y']
   *
   * @param obj {Object} Source object.
   * @param proto {Boolean} Specify true to include inherited properties.
   * @return {Array} The array of keys.
   */
  keys: function(obj, proto) {
    var arr = [];
    for (var key in obj) {
      if (proto || obj.hasOwnProperty(key)) {
        arr.push(key);
      }
    }
    return arr;
  },

  /**
   * Create an array by performing transformation on the items in a source
   * array.
   *
   * @param arr {Array} Source array.
   * @param transform {Function} Transformation function.
   * @return {Array} The transformed array.
   */
  map: function(arr, transform) {
    var ret = [];
    for (var i=0; i < arr.length; i++) {
      ret.push(transform(arr[i]));
    }
    return ret;
  },

  /**
   * For looping through Arrays and Objects.
   *
   * @param {Object} item   an Array or an Object
   * @param {Function} fn   the callback function for iteration.
   *    The function will be pass (value, [index/key], item) paramters
   * @param {Bool} proto  indicate if properties from the prototype should
   *                      be included
   *
   */
   forEach: function(item, fn, proto) {
    if (!item) {
      return;
    }

    if (Object.prototype.toString.apply(item) === '[object Array]' ||
        (!(item instanceof Function) && typeof item.length == 'number')) {
      if (item.forEach) {
        item.forEach(fn);
      } else {
        for (var i=0, l=item.length; i<l; i++) {
          fn(item[i], i, item);
        }
      }
    } else {
      for (var key in item) {
        if (proto || item.hasOwnProperty(key)) {
          fn(item[key], key, item);
        }
      }
    }
  }
});
