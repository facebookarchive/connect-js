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
 * @provides fb.waitable
 * @layer data
 * @requires fb.prelude fb.type fb.string fb.array fb.event fb.obj
 */

/**
 * A container for asynchronous data that may not be available immediately.
 * This is base type for results returned from FB.Data.query()
 * method.
 *
 * @class FB.Waitable
 */
FB.subclass('Waitable', 'Obj',
  /**
   * Construct a Waitable object.
   *
   * @access private
   * @constructor
   */
  function() {},
  {
  /**
   * Set value property of the data object. This will
   * cause "value" event to be fire on the object. Any callback functions
   * that are waiting for the data through wait() methods will be invoked
   * if the value was previously not set.
   *
   * @private
   * @param {Object} value new value for the Waitable
   */
  set: function(value) {
    this.setProperty('value', value);
  },


  /**
   * Fire the error event.
   *
   * @access private
   * @param ex {Exception} the exception object
   */
  error: function(ex) {
    this.fire("error", ex);
  },

  /**
   * Register a callback for an asynchronous value, which will be invoked when
   * the value is ready.
   *
   * Example
   * -------
   *
   * In this
   *      val v = get_a_waitable();
   *      v.wait(function (value) {
   *        // handle the value now
   *      },
   *      function(error) {
   *        // handle the errro
   *      });
   *      // later, whoever generated the waitable will call .set() and
   *      // invoke the callback
   *
   * @param {Function} callback A callback function that will be invoked
   * when this.value is set. The value property will be passed to the
   * callback function as a parameter
   * @param {Function} errorHandler [optional] A callback function that
   * will be invoked if there is an error in getting the value. The errorHandler
   * takes an optional Error object.
   */
  wait: function(callback, errorHandler) {
    // register error handler first incase the monitor call causes an exception
    if (errorHandler) {
      this.subscribe('error', errorHandler);
    }

    this.monitor('value', this.bind(function() {
      if (this.value !== undefined) {
        callback(this.value);
        return true;
      }
    }));
  }
});
