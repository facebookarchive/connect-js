/**
 * @module Mu
 * @provides Mu.XD
 *
 * @requires Mu.Prelude
 *           Mu.QS
 *           Mu.Flash
 */

/**
 * The cross domain communication layer.
 *
 * @class Mu.XD
 * @static
 * @access private
 */
Mu.copy('XD', {
  _origin    : null,
  _transport : null,
  _callbacks : {},

  /**
   * Initialize the XD layer. Native postMessage or Flash is required.
   *
   * @access private
   */
  init: function() {
    // The origin is used for:
    // 1) postMessage origin, provides security
    // 2) Flash Local Connection name
    // It is required and validated by Facebook as part of the xd_proxy.php.
    Mu.XD._origin = (
      window.location.protocol +
      '//' +
      window.location.host +
      '/' +
      Mu.guid()
    );

    // We currently disable postMessage in IE8 because it does not work with
    // window.opener. We can probably be smarter about it.
    if (window.addEventListener && window.postMessage) {
      Mu.XD.PostMessage.init();
      Mu.XD._transport = 'postmessage';
    } else if (Mu.Flash.hasMinVersion()) {
      Mu.XD.Flash.init();
      Mu.XD._transport = 'flash';
    } else {
      throw new Error('Could not find postMessage or Flash.');
    }
  },

  /**
   * Builds a url attached to a callback for xd messages.
   *
   * This is one half of the XD layer. Given a callback function, we generate
   * a xd URL which will invoke the function. This allows us to generate
   * redirect urls (used for next/cancel and so on) which will invoke our
   * callback functions.
   *
   * @access private
   * @param cb       {Function} the callback function
   * @param relation {String}   parent or opener to indicate window relation
   * @returns        {String}   the xd url bound to the callback
   */
  handler: function(cb, relation) {
    // the ?=& tricks login.php into appending at the end instead
    // of before the fragment as a query string
    // FIXME
    var
      xdProxy = Mu._domain.cdn + 'connect/xd_proxy.php#?=&',
      id      = Mu.guid();
    Mu.XD._callbacks[id] = cb;
    return xdProxy + Mu.QS.encode({
      cb        : id,
      origin    : Mu.XD._origin,
      relation  : relation || 'opener',
      transport : Mu.XD._transport
    });
  },

  /**
   * Handles the raw or parsed message and invokes the bound callback with
   * the data and removes the related window/frame.
   *
   * @access private
   * @param data {String|Object} the message fragment string or parameters
   */
  recv: function(data) {
    if (typeof data == 'string') {
      data = Mu.QS.decode(data);
    }

    var cb = Mu.XD._callbacks[data.cb];
    delete Mu.XD._callbacks[data.cb];
    cb(data);
  },

  /**
   * Provides Native ``window.postMessage`` based XD support.
   *
   * @class Mu.XD.PostMessage
   * @static
   * @for Mu.XD
   * @access private
   */
  PostMessage: {
    /**
     * Initialize the native PostMessage system.
     *
     * @access private
     */
    init: function() {
      var H = Mu.XD.PostMessage.onMessage;
      window.addEventListener
        ? window.addEventListener('message', H, false)
        : window.attachEvent('onmessage', H);
    },

    /**
     * Handles a message event.
     *
     * @access private
     * @param event {Event} the event object
     */
    onMessage: function(event) {
      Mu.XD.recv(event.data);
    }
  },

  /**
   * Provides Flash Local Connection based XD support.
   *
   * @class Mu.XD.Flash
   * @static
   * @for Mu.XD
   * @access private
   */
  Flash: {
    /**
     * Initialize the Flash Local Connection.
     *
     * @access private
     */
    init: function() {
      Mu.Flash.onReady(function() {
        document.XdComm.postMessage_init('Mu.XD.Flash.onMessage',
                                         Mu.XD._origin);
      });
    },

    /**
     * Handles a message received by the Flash Local Connection.
     *
     * @access private
     * @param message {String} the URI encoded string sent by the SWF
     */
    onMessage: function(message) {
      Mu.XD.recv(decodeURIComponent(message));
    }
  }
});
