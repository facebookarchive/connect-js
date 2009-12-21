/**
 * @provides fb.Waitable
 * @layer Data
 * @requires fb.prelude fb.Type fb.String fb.Array fb.event fb.Obj
 */

/**
 * A container for asynchronous data that may not be available immediately.
 * This is base type for results returned from FB.Data.query()
 * method.
 * @class FB.Waitable
 */
FB.subclass('Waitable', 'Obj',

 /**
  * Construct a Waitable object.
  *
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
   *   when this.value is set. The value property will be passed to the
   *   callback function as a parameter
   * @param {Function} errorHandler [optional] A callback function that
   * will be invoked if there is an error in getting the value. The errorHandler
   * takes an optional Error object.
   */
  wait: function(callback, errorHandler) {
    this.monitor('value', this.bind(function() {
      if (this.value != undefined) {
        callback(this.value);
        return true;
      }
    }));

    if (errorHandler) {
      this.subscribe('error', errorHandler);
    }
  }
});

