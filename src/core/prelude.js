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
 *
 *
 * @prelude
 * @provides fb.prelude
 */

/**
 * Prelude.
 *
 *     Namespaces are one honking great idea -- let's do more of those!
 *                                                            -- Tim Peters
 *
 * The Prelude is what keeps us from being messy. In order to co-exist with
 * arbitary environments, we need to control our footprint. The one and only
 * rule to follow here is that we need to limit the globals we introduce. The
 * only global we should every have is ``FB``. This is exactly what the prelude
 * enables us to do.
 *
 * The main method to take away from this file is `FB.copy()`_. As the name
 * suggests it copies things. Its powerful -- but to get started you only need
 * to know that this is what you use when you are augmenting the FB object. For
 * example, this is skeleton for how ``FB.Event`` is defined::
 *
 *   FB.provide('Event', {
 *     subscribe: function() { ... },
 *     unsubscribe: function() { ... },
 *     fire: function() { ... }
 *   });
 *
 * This is similar to saying::
 *
 *   FB.Event = {
 *     subscribe: function() { ... },
 *     unsubscribe: function() { ... },
 *     fire: function() { ... }
 *   };
 *
 * Except it does some housekeeping, prevents redefinition by default and other
 * goodness.
 *
 * .. _FB.copy(): #method_FB.copy
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

    // logging is enabled by default. this is the logging shown to the
    // developer and not at all noisy.
    _logging: true,


    //
    // DYNAMIC DATA
    //
    // the various domains needed for using Connect
    _domain: {
      api : window.location.protocol + '//api.facebook.com/',
      cdn : (window.location.protocol == 'https:'
              ? 'https://s-static.ak.fbcdn.net/'
              : 'http://static.ak.fbcdn.net/'),
      www : window.location.protocol + '//www.facebook.com/'
    },
    _locale: null,


    /**
     * Copies things from source into target.
     *
     * @access protected
     * @param target    {Object}  the target object where things will be copied
     *                            into
     * @param source    {Object}  the source object where things will be copied
     *                            from
     * @param overwrite {Boolean} indicate if existing items should be
     *                            overwritten
     * @param tranform  {function} [Optional], transformation function for
     *        each item
     */
    copy: function(target, source, overwrite, transform) {
      for (key in source) {
        if (overwrite || typeof target[key] === 'undefined') {
          target[key] = transform ? transform(source[key]) :  source[key];
        }
      }
      return target;
    },


    /**
     * Create a namespaced object
     * This create an fullly namespaced name.
     * Examples:
     * FB.create('XFBML.ProfilePic') = function() {...}
     *   create FB.XFBML.ProfilePic and assign the value of the function.
     *   If FB.XFBML does not exist, this call
     *   would automatically create it.
     *
     * FB.create('Util');
     *   create a namespace FB.Util if it doesn't already exist;
     *
     * @access private
     * @param {string} name full qualified name ('Util.foo', etc.)
     * @param {string} value value to set. Default value is {}. [Optional]
     * @return object  The created object, or boolean if testOnly is true.
     */
    create: function(name, value) {
      var node = window.FB, // We will use 'FB' as root namespace
      nameParts = name ? name.split('.') : [],
      c = nameParts.length;
      for (var i = 0; i < c; i++) {
        var part = nameParts[i];
        var nso = node[part];
        if (!nso) {
          nso = (value && i + 1 == c) ? value : {};
          node[part] = nso;
        }
        node = nso;
      }
      return node;
    },



    /**
     * Copy stuff from one object to the specified namespace that
     * is FB.<target>.
     * If the namespace target doesn't exist, it will be created automatically.
     *
     * @access private
     * @param target    {Object|String}  the target object to copy into
     * @param source    {Object}         the source object to copy from
     * @param overwrite {Boolean}        indicate if we should overwrite
     * @return {Object} the *same* target object back
     */
    provide: function(target, source, overwrite) {
      // a string means a dot separated object that gets appended to, or created
      return FB.copy((typeof target == 'string') ?
                     FB.create(target) : target,
                     source, overwrite);
    },

    /**
     * Generates a weak random ID.
     * @param {String}  optional prefix. Default value is 'f'
     * @access private
     * @return {String}  a random ID
     */
    guid: function(prefix) {
      return (prefix || 'f') + (Math.random() *
                                (1<<30)).toString(16).replace('.', '');
    },

    /**
     * Logs a message for the developer if logging is on.
     *
     * @access private
     * @param args {Object} the thing to log
     */
    log: function(args) {
      if (FB._logging) {
        if (window.Debug && window.Debug.writeln) {
          window.Debug.writeln(args);
        } else if (window.console) {
          window.console.log(args);
        }
      }

      // fire an event if the event system is available
      if (FB.Event) {
        FB.Event.fire('fb.log', args);
      }
    },

    /**
     * Shortcut for document.getElementById
     * @method $
     * @param {string} DOM id
     * @return DOMElement
     * @access private
     */
    $: function(id) {
      return document.getElementById(id);
    },

    /**
     * For looping through Arrays and Objects.
     *
     *
     * @param {Object} item   an Array or an Object
     * @param {Function} fn   the callback function for iteration.
     *    The function will be pass (value, [index/key], item) paramters
     * @param {Bool} proto  indicate if properties from the prototype should
     *                      be included
     * @access private
     */
    forEach: function(item, fn, proto) {
      if (Object.prototype.toString.apply(item) === '[object Array]') {
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
  };
}
