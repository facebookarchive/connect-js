/**
 * @provides fb.Waitable
 * @layer Data
 * @requires fb.prelude fb.Type fb.String fb.Array fb.event fb.Obj
 */

/**
 * An node that holds data that may not be available immediately
 * @class FB.Waitable
 */
FB.subclass('Waitable', 'Obj',

/**
 * Constructor
 * @constructor
 * @param {object} value [Optional] value of the data, if available.
 */
function(value) {
  this.value = value;
}, {

  /**
   * @param {object} Set value property of the data object. This will
   *  cause "value" event to be fire on the object. Any callback functions
   *  that are waiting for the data through wait() methods will be invoked
   *  if the value was previously not set.
   */
  set: function(value) {
    this.setProperty('value', value);
  },

  error: function(ex) {
    this.fire("error", ex);
  },

  /**
   * Wait until this.value is set.
   * Example:
   * <div class="code_border">
   * <xmp class="prettyprint lang-js">
   *     var friendInfos = FB.Data.query(
   *      'select name, pic from user where uid in (select uid2 from {0})',
   *      friends);
   *
   *     friendInfos.wait(function(data) {
   *       // Render info. For illustration of API, I am using any XFBML tags
   *       var html = '';
   *       FB.forEach(data, function(info) {
   *         html += '<p>' + info.name + '<img src="' + info.pic + '" /></p>';
   *       });
   *       FB.$('infos').innerHTML = html;
   *     });
   * </xmp>
   * </div>
   * @param {function} A callback function that will be invoked when this.value
   *   is set.
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



