/**
 * @module Mu
 * @provides Mu.NodeData
 *
 * @requires Mu.Prelude
 */

/**
 * Store data against a given node.
 *
 * Inspired by jQuery's data() APIs.
 *
 * @class Mu.NodeData
 * @static
 * @access private
 */
Mu.copy('NodeData', {
  /**
   * A psuedo unique prefix for storing DOM data.
   *
   * @access private
   * @type String
   */
  _expando: 'mu-' + new Date,

  /**
   * Incremental counter used to mark each node.
   *
   * @access private
   * @type Number
   */
  _uuid: 0,

  /**
   * Store's data keyed off the UUID.
   *
   * @access private
   * @type Array
   */
  _store: [],

  /**
   * Get or generate and get the UUID for the node.
   *
   * @access private
   * @param node {Node}   the Node
   * @returns    {String} the UUID for the Node
   */
  uuid: function(node) {
    var uuid = node[Mu.NodeData._expando];
    if (uuid) {
      return uuid;
    }

    // set the uuid and initialize the data store
    uuid = node[Mu.NodeData._expando] = ++Mu.NodeData._uuid;
    Mu.NodeData._store[uuid] = {};

    return uuid;
  },

  /**
   * Store data against the given node.
   *
   * @access private
   * @param node  {Node}   the Node to store data for
   * @param key   {String} the key to store the data against
   * @param value {Object} the value for the key
   */
  put: function(node, key, value) {
    Mu.NodeData._store[Mu.NodeData.uuid(node)][key] = value;
  },

  /**
   * Get data against the given node.
   *
   * @access private
   * @param node  {Node}   the Node to store data for
   * @param key   {String} the key to lookup
   * @param def   {Object} optional default value if one is not found
   */
  get: function(node, key, def) {
    var data = Mu.NodeData._store[Mu.NodeData.uuid(node)];
    if (key in data) {
      return data[key];
    } else {
      return def;
    }
  },

  /**
   * Remove data against the given node.
   *
   * @access private
   * @param node  {Node}   the Node to store data for
   * @param key   {String} the key to remove
   * @returns     {Object} the removed value
   */
  remove: function(node, key) {
    var
      data    = Mu.NodeData._store[Mu.NodeData.uuid(node)],
      current = data[key];

    delete data[key];
    return current;
  }
});
