/**
 * @module Mu
 * @provides Mu.XFBML.Core
 *
 * @requires Mu.Prelude
 */

/**
 * XFBML Public API.
 *
 * @class Mu
 * @static
 * @access private
 */
Mu.copy('', {
  /**
   * Process the given Node. If a Node is not given, process the entire
   * document body. The callback is invoked when XFBML is done rendering.
   *
   * @access public
   * @param node {Node}      the root node
   * @param cb   {Function}  callback to invoke when rendering is complete
   * @for Mu
   */
  processXFBML: function(node, cb) {
    node = node || document.body;

    // maintain a counter of each tag we are asking to process, and every time
    // the callback is invoked, we know a tag is done rendering. when the
    // counter hits 0, we're done processing all tags we set out to process.
    //
    // note, we start with a counter of 1, and finally invoke the callback once
    // after we've kicked off all the processing of tags. this helps prevent
    // the race conditions and ensures the user callback is only invoked once
    // all the tags have been processed.
    var
      count = 1,
      xfbmlCb = function(node, error) {
        // log the error message if one was given
        error && Mu.log([node, error]);

        // one more down
        count -= 1;

        // when we're done processing them all, invoke the user callback
        if (count == 0) {
          cb && cb();
        }
      };

    //
    // each component in the Mu.XFBML.Tag namespace is a XFBML Tag
    // implementation. An implementation must provide:
    //
    // name -- name of tag. the fb namespace is implied
    // attrConfig -- a function which returns the attribute configuration
    // process(node, config, callback) -- a function to do the hard work
    //
    for (var impl in Mu.XFBML.Tag) {
      // skip prototype stuff, we're running in a hostile environment
      if (!Mu.XFBML.Tag.hasOwnProperty(impl)) {
        continue;
      }

      // for the tag, find any nodes we need to process
      var
        tag        = Mu.XFBML.Tag[impl],
        elements   = Mu.XFBML.getElements(node, tag.name),
        attrConfig = tag.attrConfig();

      for (var i=0, l=elements.length; i<l; i++) {
        count += 1;
        tag.process(
          elements[i],
          Mu.XFBML.parseAttr(elements[i], attrConfig),
          xfbmlCb
        );
      }
    }

    // finally, fire any queued requests if the IndexedQuery module is
    // available. its a loose dependency.
    if (Mu.IndexedQuery) {
      Mu.IndexedQuery.fire();
    }

    // as described above where we defined xfbmlCb, this prevents premature
    // invocation of the user callback
    xfbmlCb();
  }
});

/**
 * Internal XFBML implementation.
 *
 * @class Mu.XFBML
 * @static
 * @access private
 */
Mu.copy('XFBML', {
  /**
   * Find XFBML elements.
   *
   * @access private
   * @param node {Node}     the HTML Node to look under
   * @param name {String}   the tag name. the fb namespace is assumed
   * @returns    {NodeList} the NodeList of matching elements
   */
  getElements: function(node, name) {
    if (document.namespaces && document.namespaces.fb) {
      // Internet Explorer with namespace
      return node.getElementsByTagName(name);
    } else {
      return node.getElementsByTagName('fb:' + name);
    }
  },

  /**
   * Parse the attributes on a node and validate it based on the given config.
   *
   * @access private
   * @param node   {Node}   the HTML Node
   * @param config {Object} the configuration object
   * @returns      {Object} the parsed configuration
   */
  parseAttr: function(node, config) {
    var parsed = {};
    for (var key in config) {
      parsed[key] = config[key](node.getAttribute(key));
    }
    return parsed;
  }
});

/**
 * XFBML Attribute Parser.
 *
 * @class Mu.XFBML.Attr
 * @static
 * @access private
 */
Mu.copy('XFBML.Attr', {
  /**
   * Attribute type to allow any value.
   *
   * @access private
   * @param def {Object} the default value if any
   * @returns {Function} the validator function
   */
  any: function(def) {
    return function(val) {
      return val === undefined ? def : val;
    };
  },

  /**
   * Attribute type to allow a boolean value.
   *
   * @access private
   * @param def {Object} the default value if any
   * @returns {Function} the validator function
   */
  bool: function(def) {
    return function(val) {
      switch (val) {
        case undefined:
        case null:
          return def;
        case true:
        case '': // yes, empty value. be like html
        case '1':
        case 'true':
        case 'yes':
          return true;
        default:
          return false;
      }
    };
  },

  /**
   * Attribute type to allow an integer value.
   *
   * @access private
   * @param def {Object} the default value if any
   * @returns {Function} the validator function
   */
  integer: function(def) {
    return function (val) {
      try {
        var val = parseInt(val, 10);
        if (!isNaN(val)) {
          return val;
        }
      } catch (x) {}
      return def;
    }
  },

  /**
   * Attribute type to allow an size value for use with HTML dimensions. This
   * allows bare numbers (treated as pixels), values specified with % or em or
   * pt.
   *
   * @access private
   * @param def {Object} the default value if any
   * @returns {Function} the validator function
   */
  size: function(def) {
    return function (val) {
      if (val !== '' && val !== undefined && val !== null) {
        if (/\d+(%|px|em|pt)/.test(val)) {
          return val;
        }

        try {
          var integer = parseInt(val, 10);
          if (!isNaN(integer)) {
            return integer + 'px';
          }
        } catch (x) {}
      }
      return def;
    }
  },

  /**
   * Attribute type to allow one of the enumerated values. Values are treated
   * in a case insensitive manner.
   *
   * @access private
   * @param def     {Object}   the default value if any
   * @param allowed {Array}    the allowed values
   * @returns       {Function} the validator function
   */
  ienum: function(def, allowed) {
    return function(val) {
      if (val && val.toLowerCase) {
        for (var i=0, l=allowed.length; i<l; i++) {
          if (val.toLowerCase() == allowed[i]) {
            return allowed[i];
          }
        }
      }
      return def;
    }
  },

  /**
   * Basically the same as 'any', but automatically defaults the value to the
   * current session uid if available. Also replaces 'loggedinuser' with the
   * current uid.
   *
   * @access private
   * @returns       {Function} the validator function
   */
  uid: function() {
    return function(val) {
      if (!val || val == 'loggedinuser') {
        val = Mu._session && Mu._session.uid;
      }
      return val;
    }
  }
});


// NOTE: self executing code.
//
// This allows namespaced XFBML tags to function even if the developer has not
// specified the namespace on the <html> tag. Its necessary for IE.
if (document.namespaces && !document.namespaces.item['fb']) {
  document.namespaces.add('fb');
}
