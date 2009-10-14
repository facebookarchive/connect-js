/**
 * @module Mu
 * @provides Mu.Cache
 *
 * @requires Mu.Prelude
 */

/**
 * Cache Support.
 *
 * @class Mu.Cache
 * @static
 * @access private
 */
Mu.copy('Cache', {
  _store: {},

  get: function(key) {
    return Mu.Cache._store[key];
  },

  put: function(key, value) {
    Mu.Cache._store[key] = value;
  }
});
