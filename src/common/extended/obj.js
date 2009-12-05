/**
 * @provides fb.Obj
 * @requires fb.Type fb.json2 fb.event
 */

/**
 * Base object type that support events
 * @class FB.Obj
 */
FB.Class('Obj', null,
  FB.copy(FB.Event, {
    /*
     * Set property on an object and fire property
     * changed event if changed
     * @param {String} Property name. A event with the same name
     *                 will be fire when the property is changed.
     * @param {Object} new value of the property
     * @private
     * @static
     */
     setProperty: function(propertyName, newValue) {
       // Check if property actually changed
       if(JSON.stringify(newValue) != JSON.stringify(this[propertyName])) {
         this[propertyName] = newValue;
         this.fire(propertyName, newValue);
       }
     }
  })
);

