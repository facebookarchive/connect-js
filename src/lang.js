/**
 * @module Mu
 * @provides Mu.Lang
 *
 * @requires Mu.Prelude
 */

/**
 * Language Utilities.
 *
 * @class Mu.Lang
 * @static
 * @access private
 */
Mu.copy('Lang', {
  arrayMerge: function(target, source) {
    for (var i=0, l=source.length; i<l; i++) {
      target.push(source[i]);
    }
  },

  arrayUnique: function(arr) {
    var
      tmp = {},
      res = [],
      val;

    for (var i=0, l=arr.length; i<l; i++) {
      val = arr[i];
      if (!(val in tmp)) {
        res.push(val);
        tmp[val] = 1;
      }
    }

    return res;
  },

  /**
   * Return the keys of an Object.
   *
   * TODO move this to a more appropriate place
   *
   * @access private
   * @param obj {Object} the Object from which to extract the keys
   * @returns   {Array}  the keys of the Object
   */
  keys: function(obj) {
    var keys = [];
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) {
        keys.push(key);
      }
    }
    return keys;
  }
});
