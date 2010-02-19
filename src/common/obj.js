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
 * @provides fb.obj
 * @requires fb.type
 *           fb.json
 *           fb.event
 */

/**
 * Base object type that support events.
 *
 * @class FB.Obj
 * @private
 */
FB.Class('Obj', null,
  FB.copy({
    /**
     * Set property on an object and fire property changed event if changed.
     *
     * @param {String} Property name. A event with the same name
     *                 will be fire when the property is changed.
     * @param {Object} new value of the property
     * @private
     */
     setProperty: function(name, value) {
       // Check if property actually changed
       if (FB.JSON.stringify(value) != FB.JSON.stringify(this[name])) {
         this[name] = value;
         this.fire(name, value);
       }
     }
  }, FB.EventProvider)
);
