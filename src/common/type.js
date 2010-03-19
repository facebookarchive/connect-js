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
 * @provides fb.type
 * @layer basic
 * @requires fb.prelude
 */

// Provide Class/Type support.
// TODO: As a temporary hack, this docblock is written as if it describes the
// top level FB namespace. This is necessary because the current documentation
// parser uses the description from this file for some reason.
/**
 * The top level namespace exposed by the SDK. Look at the [readme on
 * **GitHub**][readme] for more information.
 *
 * [readme]: http://github.com/facebook/connect-js
 *
 * @class FB
 * @static
 */
FB.provide('', {
  /**
   * Bind a function to a given context and arguments.
   *
   * @static
   * @access private
   * @param fn {Function} the function to bind
   * @param context {Object} object used as context for function execution
   * @param {...} arguments additional arguments to be bound to the function
   * @returns {Function} the bound function
   */
  bind: function() {
    var
      args    = Array.prototype.slice.call(arguments),
      fn      = args.shift(),
      context = args.shift();
    return function() {
      return fn.apply(
        context,
        args.concat(Array.prototype.slice.call(arguments))
      );
    };
  },

  /**
   * Create a new class.
   *
   * Note: I have to use 'Class' instead of 'class' because 'class' is
   * a reserved (but unused) keyword.
   *
   * @access private
   * @param name {string} class name
   * @param constructor {function} class constructor
   * @param proto {object} instance methods for class
   */
  Class: function(name, constructor, proto) {
    if (FB.CLASSES[name]) {
      return FB.CLASSES[name];
    }

    var newClass = constructor ||  function() {};

    newClass.prototype = proto;
    newClass.prototype.bind = function(fn) {
      return FB.bind(fn, this);
    };

    newClass.prototype.constructor = newClass;
    FB.create(name, newClass);
    FB.CLASSES[name] = newClass;
    return newClass;
  },

  /**
   * Create a subclass
   *
   * Note: To call base class constructor, use this._base(...).
   * If you override a method 'foo' but still want to call
   * the base class's method 'foo', use this._callBase('foo', ...)
   *
   * @access private
   * @param {string} name class name
   * @param {string} baseName,
   * @param {function} constructor class constructor
   * @param {object} proto instance methods for class
   */
  subclass: function(name, baseName, constructor, proto) {
    if (FB.CLASSES[name]) {
      return FB.CLASSES[name];
    }
    var base = FB.create(baseName);
    FB.copy(proto, base.prototype);
    proto._base = base;
    proto._callBase = function(method) {
      var args = Array.prototype.slice.call(arguments, 1);
      return base.prototype[method].apply(this, args);
    };

    return FB.Class(
      name,
      constructor ? constructor : function() {
        if (base.apply) {
          base.apply(this, arguments);
        }
      },
      proto
    );
  },

  CLASSES: {}
});

/**
 * @class FB.Type
 * @static
 * @private
 */
FB.provide('Type', {
  isType: function(obj, type) {
    while (obj) {
      if (obj.constructor === type || obj === type) {
        return true;
      } else {
        obj = obj._base;
      }
    }
    return false;
  }
});
