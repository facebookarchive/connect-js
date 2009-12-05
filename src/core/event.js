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
 * @provides fb.event
 * @requires fb.prelude
 */

/**
 * Event Provider.
 *
 * NB: We are calling this FB.Event instead of FB.EventProvider to punt
 * on properly implementing "extends" support in our doc system (for now).
 * @class FB.Event
 * @static
 * @access private
 */
FB.provide('EventProvider', {
  /**
   * Returns the internal subscriber array that can be directly manipulated by
   * adding/removing things.
   *
   * @access private
   * @return {Object}
   */
  subscribers: function() {
    // this odd looking logic is to allow instances to lazily have a map of
    // their events. if subscribers were an object literal itself, we would
    // have issues with instances sharing the subscribers when its being used
    // in a mixin style.
    if (!this._subscribersMap) {
      this._subscribersMap = {};
    }
    return this._subscribersMap;
  },

  /**
   * Bind an event handler to a given event name.
   *
   * For example, suppose you want to get notified whenever the session
   * changes:
   *
   *     FB.Event.subscribe('auth.sessionChange', function(response) {
   *       // do something with response.session
   *     });
   *
   * @access public
   * @param name {String} name of the event
   * @param cb {Function} the handler function
   */
  subscribe: function(name, cb) {
    var subs = this.subscribers();

    if (!subs[name]) {
      subs[name] = [cb];
    } else {
      subs[name].push(cb);
    }
  },

  /**
   * Removes subscribers, inverse of [FB.Event.subscribe][subscribe].
   *
   * Removing a subscriber is basically the same as adding one. You need to
   * pass the same event name and function to unsubscribe that you passed into
   * subscribe. If we use a similar example to [FB.Event.subscribe][subscribe],
   * we get:
   *
   *     var onSessionChange = function(response) {
   *       // do something with response.session
   *     };
   *     FB.Event.subscribe('auth.sessionChange', onSessionChange);
   *
   *     // sometime later in your code you dont want to get notified anymore
   *     FB.Event.unsubscribe('auth.sessionChange', onSessionChange);
   *
   * [subscribe]: /docs/?u=facebook.jslib-alpha.FB.Event.subscribe
   *
   * @access public
   * @param name {String} name of the event
   * @param cb {Function} the handler function
   */
  unsubscribe: function(name, cb) {
    var subs = this.subscribers();

    if (subs[name]) {
      for (var i=0, l=subs[name].length; i<l; i++) {
        if (subs[name][i] == cb) {
          subs[name][i] = null;
        }
      }
    }
  },

  /**
   * Invoke callback immediately and when specified event is fired,
   * until the callback return true
   * @param {string} name Name of event.
   * @param {function} callback A callback function. arguments may be
   *   passed to the callback.
   *     If the callback function returns true, the event will be unsubscribed.
   * @static
   */
  monitor: function(name, callback) {
    if (!callback()) {
      var ctx = this,
      fn = function() {
        if (callback.apply(callback, arguments)) {
          // unsubscribe
          this.unsubscribe(name, fn);
        }
      };

      this.subscribe(name, fn);
    }
  },

  /**
   * Removes all subscribers for named event.
   *
   * You need to pass the same event name that was passed to FB.Event.subscribe.
   * This is useful if the event is no longer worth listening to and you
   * believe that multiple subscribers have been set up.
   *
   * @access public
   * @param name    {String}   name of the event
   */
  clear: function(name) {
    var subs = this.subscribers();

    if (subs[name]) {
      for (var i=0, l=subs[name].length; i<l; i++) {
        subs[name][i] = null;
      }
    }
  },

  /**
   * Fires a named event. The first argument is the name, the rest of the
   * arguments are passed to the subscribers.
   *
   * @access private
   * @param name {String} the event name
   */
  fire: function() {
    var
      args        = Array.prototype.slice.call(arguments),
      name        = args.shift(),
      subscribers = this.subscribers()[name],
      sub;

    // no subscribers, boo
    if (!subscribers) {
      return;
    }

    for (var i=0, l=subscribers.length; i<l; i++) {
      sub = subscribers[i];
      // this is because we null out unsubscribed rather than jiggle the array
      if (sub) {
        sub.apply(this, args);
      }
    }
  }
});

/**
 * Event.
 *
 * @class FB.Event
 * @static
 * @access public
 */
FB.provide('Event', FB.EventProvider);
