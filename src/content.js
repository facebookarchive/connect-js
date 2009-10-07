/**
 * @module Mu
 * @provides Mu.Content
 * @requires Mu.Prelude
 */

/**
 * "Content" is a very flexible term. Helpers for things like hidden
 * DOM content, iframes and popups.
 *
 * @class Mu.Content
 * @static
 * @access private
 */
Mu.copy('Content', {
  _root       : null,
  _hiddenRoot : null,

  /**
   * Append some content.
   *
   * @access private
   * @param content {String|Node} a DOM Node or HTML string
   * @param root    {Node}        (optional) a custom root node
   * @returns {Node} the node that was just appended
   */
  append: function(content, root) {
    // setup the root node, creating it if necessary
    if (!root) {
      if (!Mu.Content._root) {
        root = document.getElementById('mu-root');
        if (!root) {
          root = document.createElement('div');
          root.id = 'mu-root';
          Mu.Content._root = document.body.appendChild(root);
        }
      } else {
        root = Mu.Content._root;
      }
    }

    if (typeof content == 'string') {
      var div = document.createElement('div');
      root.appendChild(div).innerHTML = content;
      return div;
    } else {
      return root.appendChild(content);
    }
  },

  /**
   * Append some hidden content.
   *
   * @access private
   * @param content {String|Node} a DOM Node or HTML string
   * @returns {Node} the node that was just appended
   */
  hidden: function(content) {
    if (!Mu.Content._hiddenRoot) {
      var
        hiddenRoot = document.createElement('div'),
        style      = hiddenRoot.style;
      style.position = 'absolute';
      style.top      = '-10000px';
      style.width    = style.height = 0;
      Mu.Content._hiddenRoot = Mu.Content.append(hiddenRoot);
    }

    return Mu.Content.append(content, Mu.Content._hiddenRoot);
  }
});
