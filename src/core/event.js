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
 * @provides fb.event
 * @requires fb.prelude fb.array
 */

// NOTE: We tag this as FB.Event even though it is actually FB.EventProvider to
// work around limitations in the documentation system.
/**
 * Event handling mechanism for globally named events.
 *
 * @static
 * @class FB.Event
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
   * Subscribe to a given event name, invoking your callback function whenever
   * the event is fired.
   *
   * For example, suppose you want to get notified whenever the session
   * changes:
   *
   *     FB.Event.subscribe('auth.sessionChange', function(response) {
   *       // do something with response.session
   *     });
   *
   * Global Events:
   *
   * - auth.login -- fired when the user logs in
   * - auth.logout -- fired when the user logs out
   * - auth.sessionChange -- fired when the session changes
   * - auth.statusChange -- fired when the status changes
   * - xfbml.render -- fired when a call to FB.XFBML.parse() completes
   * - edge.create -- fired when the user likes something (fb:like)
   * - comments.add -- fired when the user adds a comment (fb:comments)
   * - fb.log -- fired on log message
   *
   * @access public
   * @param name {String} Name of the event.
   * @param cb {Function} The handler function.
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
   * @param name {String} Name of the event.
   * @param cb {Function} The handler function.
   */
  unsubscribe: function(name, cb) {
    var subs = this.subscribers()[name];

    FB.Array.forEach(subs, function(value, key) {
      if (value == cb) {
        subs[key] = null;
      }
    });
  },

  /**
   * Repeatedly listen for an event over time. The callback is invoked
   * immediately when monitor is called, and then every time the event
   * fires. The subscription is canceled when the callback returns true.
   *
   * @access private
   * @param {string} name Name of event.
   * @param {function} callback A callback function. Any additional arguments
   * to monitor() will be passed on to the callback. When the callback returns
   * true, the monitoring will cease.
   */
  monitor: function(name, callback) {
    if (!callback()) {
      var
        ctx = this,
        fn = function() {
          if (callback.apply(callback, arguments)) {
            ctx.unsubscribe(name, fn);
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
   * @access private
   * @param name    {String}   name of the event
   */
  clear: function(name) {
    delete this.subscribers()[name];
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
      args = Array.prototype.slice.call(arguments),
      name = args.shift();

    FB.Array.forEach(this.subscribers()[name], function(sub) {
      // this is because we sometimes null out unsubscribed rather than jiggle
      // the array
      if (sub) {
        sub.apply(this, args);
      }
    });
  }
});

/**
 * Event handling mechanism for globally named events.
 *
 * @class FB.Event
 * @extends FB.EventProvider
 */
FB.provide('Event', FB.EventProvider);
