/**
 * @module FB
 * @prelude
 * @provides mu.prelude
 */

/**
 * Prelude.
 *
 *     Namespaces are one honking great idea -- let's do more of those!
 *                                                            -- Tim Peters
 *
 *
 * @class FB
 * @static
 * @access private
 */
if (!window.FB) {
  FB = {
    // use the init method to set these values correctly
    _apiKey     : null,
    _session    : null,
    _userStatus : 'unknown', // or 'notConnected' or 'connected'

    // enable debug logging. this can be turned on via a URL parameter or when
    // calling FB.init
    _debug : window.location.toString().indexOf('mu_debug=1') > -1,

    // the various domains needed for using Connect
    _domain: {
      api : window.location.protocol + '//api.facebook.com/',
      cdn : window.location.protocol + '//static.ak.fbcdn.net/',
      www : window.location.protocol + '//www.facebook.com/'
    },

    // "dynamic constants"
    _registry: {
      // minimum required flash versions
      flashVersions: [
        [9,  0, 159, 0 ],
        [10, 0, 22,  87]
      ]
    },

    /**
     * Copy stuff from one object to another.
     *
     * If ``target`` is a ``String``, it will be resolved using the FB object
     * as the root.
     *
     * @access private
     * @param target    {Object|String}  the target object to copy into
     * @param source    {Object}         the source object to copy from
     * @param overwrite {Boolean}        indicate if we should overwrite
     * @returns {Object} the *same* target object back
     */
    copy: function(target, source, overwrite) {
      // a string means a dot separated object that gets appended to, or created
      if (typeof target == 'string') {
        var
          root = FB,
          parts = target.split('.');

        for (var i=0, l=parts.length; i<l; i++) {
          var part = parts[i];

          if (part === '') {
            continue;
          }

          if (typeof root[part] === 'undefined') {
            root[part] = {};
          }

          root = root[part];
        }

        target = root;
      }

      for (var k in source) {
        if (source.hasOwnProperty(k) && (overwrite || !(k in target))) {
          target[k] = source[k];
        }
      }
      return target;
    },

    /**
     * Generates a weak random ID.
     *
     * @access private
     * @returns {String}  a random ID
     */
    guid: function() {
      return 'f' + (Math.random() * (1<<30)).toString(16).replace('.', '');
    },

    /**
     * Logs a message for the developer if debug is on.
     *
     * @access private
     * @param args {Object} the thing to log
     */
    log: function(args) {
      if (FB._debug && window.console) {
        console.log(args);
      }

      // fire an event if the event system is available
      if (FB.Event) {
        FB.Event.fire('fb.log', args);
      }
    }
  };
}
