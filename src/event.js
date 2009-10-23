/**
 * @module Mu
 * @provides mu.event
 * @requires mu.prelude
 */

/**
 * Event.
 *
 * @class Mu.Event
 * @static
 * @access private
 */
Mu.copy('Event', {
  /**
   * Map of event name to subscribers.
   *
   * @access private
   * @type Object
   */
  _subscribers: {},

  /**
   * Bind an event handler to a given event name.
   *
   * @access public
   * @param name    {String}   name of the event
   * @param cb      {Function} the handler function
   */
  on: function(name, cb) {
    var S = Mu.Event._subscribers;

    if (!S[name]) {
      S[name] = [cb];
    } else {
      S[name].push(cb);
    }
  },

  /**
   * Removes subscribers, inverse of Mu.Event.on().
   *
   * @access public
   * @param name    {String}   name of the event
   * @param cb      {Function} the handler function
   */
  unsubscribe: function(name, cb) {
    var S = Mu.Event._subscribers;

    if (S[name]) {
      for (var i=0, l=S[name].length; i<l; i++) {
        if (S[name][i] == cb) {
          S[name][i] = null;
        }
      }
    }
  },

  /**
   * Fires a named event. The first argument is the name, the rest of the
   * arguments are passed to the subscribers.
   *
   * @access private
   * @param name {String}     the event name
   * @param ...  arguments    passed to the subscriber
   */
  fire: function() {
    var
      args        = Array.prototype.slice.call(arguments),
      name        = args.shift(),
      subscribers = Mu.Event._subscribers[name],
      sub;

    // no subscribers, boo
    if (!subscribers) {
      return;
    }

    for (var i=0, l=subscribers.length; i<l; i++) {
      sub = subscribers[i];
      // this is because we null out unsubscribed rather than jiggle the array
      if (sub) {
        if (sub.apply(window, args) === false) {
          // return false means "unsubscribe me"
          subscribers[i] = null;
        }
      }
    }
  }
});
