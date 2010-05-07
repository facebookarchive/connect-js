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
 * @provides fb.xd
 * @requires fb.prelude
 *           fb.qs
 *           fb.flash
 */

/**
 * The cross domain communication layer.
 *
 * @class FB.XD
 * @static
 * @access private
 */
FB.provide('XD', {
  _origin    : null,
  _transport : null,
  _callbacks : {},
  _forever   : {},

  /**
   * Initialize the XD layer. Native postMessage or Flash is required.
   *
   * @param channelUrl {String} optional channel URL
   * @access private
   */
  init: function(channelUrl) {
    // only do init once, if this is set, we're already done
    if (FB.XD._origin) {
      return;
    }

    // We currently disable postMessage in IE8 because it does not work with
    // window.opener. We can probably be smarter about it.
//#JSCOVERAGE_IF
    if (window.addEventListener && window.postMessage) {
      // The origin here is used for postMessage security. It needs to be based
      // on the URL of the current window. It is required and validated by
      // Facebook as part of the xd_proxy.php.
      FB.XD._origin = (window.location.protocol + '//' +
                       window.location.host + '/' + FB.guid());
      FB.XD.PostMessage.init();
      FB.XD._transport = 'postmessage';
    } else if (!channelUrl && FB.Flash.hasMinVersion()) {
      // The origin here is used for Flash XD security. It needs to be based on
      // document.domain rather than the URL of the current window. It is
      // required and validated by Facebook as part of the xd_proxy.php.
      FB.XD._origin = (window.location.protocol + '//' + document.domain +
                       '/' + FB.guid());
      FB.XD.Flash.init();
      FB.XD._transport = 'flash';
    } else {
      FB.XD._transport = 'fragment';
      FB.XD.Fragment._channelUrl = channelUrl || window.location.toString();
    }
  },

  /**
   * Resolve a id back to a node. An id is a string like:
   *   top.frames[5].frames['crazy'].parent.frames["two"].opener
   *
   * @param   id {String}   the string to resolve
   * @returns    {Node}     the resolved window object
   * @throws  SyntaxError   if the id is malformed
   */
  resolveRelation: function(id) {
    var
      pt,
      matches,
      parts = id.split('.'),
      node = window;

    for (var i=0, l=parts.length; i<l; i++) {
      pt = parts[i];

      if (pt === 'opener' || pt === 'parent' || pt === 'top') {
        node = node[pt];
      } else if (matches = /^frames\[['"]?([a-zA-Z0-9-_]+)['"]?\]$/.exec(pt)) {
        // these regex has the `feature' of fixing some badly quoted strings
        node = node.frames[matches[1]];
      } else {
        throw new SyntaxError('Malformed id to resolve: ' + id + ', pt: ' + pt);
      }
    }

    return node;
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
   * @param forever  {Boolean}  indicate this handler needs to live forever
   * @return        {String}   the xd url bound to the callback
   */
  handler: function(cb, relation, forever) {
    // if for some reason, we end up trying to create a handler on a page that
    // is already being used for XD comm as part of the fragment, we simply
    // return 'javascript:false' to prevent a recursive page load loop
    //
    // the // after it makes any appended things to the url become a JS
    // comment, and prevents JS parse errors. cloWntoWn.
    if (window.location.toString().indexOf(FB.XD.Fragment._magic) > 0) {
      return 'javascript:false;//';
    }

    // the ?=& tricks login.php into appending at the end instead
    // of before the fragment as a query string
    // FIXME
    var
      xdProxy = FB._domain.cdn + 'connect/xd_proxy.php#?=&',
      id = FB.guid();

    // in fragment mode, the url is the current page and a fragment with a
    // magic token
    if (FB.XD._transport == 'fragment') {
      xdProxy = FB.XD.Fragment._channelUrl;
      var poundIndex = xdProxy.indexOf('#');
      if (poundIndex > 0) {
        xdProxy = xdProxy.substr(0, poundIndex);
      }
      xdProxy += (
        (xdProxy.indexOf('?') < 0 ? '?' : '&') +
        FB.XD.Fragment._magic + '#?=&'
      );
    }

    if (forever) {
      FB.XD._forever[id] = true;
    }

    FB.XD._callbacks[id] = cb;
    return xdProxy + FB.QS.encode({
      cb        : id,
      origin    : FB.XD._origin,
      relation  : relation || 'opener',
      transport : FB.XD._transport
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
      data = FB.QS.decode(data);
    }

    var cb = FB.XD._callbacks[data.cb];
    if (!FB.XD._forever[data.cb]) {
      delete FB.XD._callbacks[data.cb];
    }
    cb && cb(data);
  },

  /**
   * Provides Native ``window.postMessage`` based XD support.
   *
   * @class FB.XD.PostMessage
   * @static
   * @for FB.XD
   * @access private
   */
  PostMessage: {
    /**
     * Initialize the native PostMessage system.
     *
     * @access private
     */
    init: function() {
      var H = FB.XD.PostMessage.onMessage;
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
      FB.XD.recv(event.data);
    }
  },

  /**
   * Provides Flash Local Connection based XD support.
   *
   * @class FB.XD.Flash
   * @static
   * @for FB.XD
   * @access private
   */
  Flash: {
    /**
     * Initialize the Flash Local Connection.
     *
     * @access private
     */
    init: function() {
      FB.Flash.onReady(function() {
        document.XdComm.postMessage_init('FB.XD.Flash.onMessage',
                                         FB.XD._origin);
      });
    },

    /**
     * Handles a message received by the Flash Local Connection.
     *
     * @access private
     * @param message {String} the URI encoded string sent by the SWF
     */
    onMessage: function(message) {
      FB.XD.recv(decodeURIComponent(message));
    }
  },

  /**
   * Provides XD support via a fragment by reusing the current page.
   *
   * @class FB.XD.Fragment
   * @static
   * @for FB.XD
   * @access private
   */
  Fragment: {
    _magic: 'fb_xd_fragment',

    /**
     * Check if the fragment looks like a message, and dispatch if it does.
     */
    checkAndDispatch: function() {
      var
        loc = window.location.toString(),
        fragment = loc.substr(loc.indexOf('#') + 1),
        magicIndex = loc.indexOf(FB.XD.Fragment._magic);

      if (magicIndex > 0) {
        // make these no-op to help with performance
        //
        // this works independent of the module being present or not, or being
        // loaded before or after
        FB.init = FB.getLoginStatus = FB.api = function() {};

        // display none helps prevent loading of some stuff
        document.documentElement.style.display = 'none';

        FB.XD.resolveRelation(
          FB.QS.decode(fragment).relation).FB.XD.recv(fragment);
      }
    }
  }
});

// NOTE: self executing code.
//
// if the page is being used for fragment based XD messaging, we need to
// dispatch on load without needing any API calls. it only does stuff if the
// magic token is found in the fragment.
FB.XD.Fragment.checkAndDispatch();
