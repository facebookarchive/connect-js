/**
 * @provides fb.XFBML.Element
 * @layer XFBML
 * @requires fb.Type
 */

/**
 * Base class for all XFBML elements. To create your own XFBML element,
 * make a class that derives from this, and then call [[joey:FB.XFBML.registerTag]].
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

{
  /**
   * Get the value of an attribute associated with this tag.
   * @param  {String} name
   * Name of the attribute
   * @param  {Object} defaultValue
   * Default value for the
   * attribute, if it isn't set.
   * @return  Object
   */
  getAttribute: function(name, defaultValue, transform) {
    var value = this.dom.getAttribute(name);
    return value ? (transform ? transform(value) : value) : defaultValue;
  },

  _getBoolAttribute: function(name, defaultValue) {
    return this.getAttribute(name, defaultValue, function(s) {
                             return s.toLowerCase() == 'true';
                             });
  },

  /**
   * Check if this node is still valid and in the document.
   */
  isValid: function() {
    for (var dom = this.dom; dom; dom = dom.parentNode) {
      if (dom == document.body) {
        return true;
      }
    }
  },

  clear: function() {
    this.dom.innerHTML = '';
  }

});
