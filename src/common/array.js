/**
 * @provides fb.Array
 * @layer Basic
 * @requires fb.prelude
 *
 */

/**
 * Array related helper methods
 * @class FB.Array
 * @private
 * @static
 */
FB.provide('Array', {
  /**
   * Get index of item inside an array
   * @param {array} Array
   * @param {object} item to locate
   * @return {number} index of item
   */
  indexOf: function (a, item) {
    if (a.indexOf) {
      return a.indexOf(item);
    }
    var length = a.length;
    if (length) {
      for (var index = 0; index < length; index++) {
        if (a[index] === item) {
          return index;
        }
      }
    }
    return -1;
  },

  /**
   * Create an new array that start contains all of a and any
   * item from b that doesn't exist in a already
   * @param {array} a
   * @param {array} b
   * @return {array} merged array
   */
  merge: function(a, b) {
    for (var i=0; i < b.length; i++) {
      if (FB.Array.indexOf(a, (b[i])) < 0) {
        a.push(b[i]);
      }
    }
    return a;
  },

  /**
   * Create an new array from the given array and a filter
   * function
   * @param {array} source array
   * @param {function} filter callback function
   * @return {array} filtered array
   */
  filter: function(a, fn) {
    var b  = [];
    for (var i=0; i < a.length; i++) {
      if (fn(a[i])) {
        b.push(a[i]);
      }
    }
    return b;
  },

  /**
   * Create an array from the keys in an object
   * Example: keys({'x': 2, 'y': 3'}) returns ['x', 'y']
   * @param {object} source object
   * @return {array} an array
   */
  keys: function(obj) {
    var a =[];
    for (key in obj) {
      a.push(key);
    }
    return a;
  },

  /**
   * Create an array by performing transformation
   * on the items in a source array
   * @param {array} source array
   * @param {function} transformation function
   * @return {array} A transformed array
   */
  map: function(a, transform) {
    var newArray = [];
    for(var i=0; i < a.length; i++) {
      newArray.push(transform(a[i]));
    }
    return newArray;
  }
});
