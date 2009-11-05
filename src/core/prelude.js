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
 *   FB.copy('Event', {
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
     * Copy stuff from one object to another.
     *
     * If ``target`` is a ``String``, it will be resolved using the FB object
     * as the root.
     *
     * @access private
     * @param target    {Object|String}  the target object to copy into
     * @param source    {Object}         the source object to copy from
     * @param overwrite {Boolean}        indicate if we should overwrite
     * @return {Object} the *same* target object back
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
     * @return {String}  a random ID
     */
    guid: function() {
      return 'f' + (Math.random() * (1<<30)).toString(16).replace('.', '');
    },

    /**
     * Logs a message for the developer if logging is on.
     *
     * @access private
     * @param args {Object} the thing to log
     */
    log: function(args) {
      if (FB._logging && window.console) {
        console.log(args);
      }

      // fire an event if the event system is available
      if (FB.Event) {
        FB.Event.fire('fb.log', args);
      }
    }
  };
}
