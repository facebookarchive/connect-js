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
 * @provides fb.ui
 * @requires fb.prelude
 *           fb.content
 *           fb.dialog
 *           fb.qs
 *           fb.json
 *           fb.xd
 */

/**
 * UI Calls.
 *
 * @class FB
 * @static
 * @access private
 */
FB.provide('', {
  /**
   * Method for triggering UI interaction with Facebook as iframe dialogs or
   * popups, like publishing to the stream, sharing links.
   *
   * Example **stream.publish**:
   *
   *      FB.ui(
   *        {
   *          method: 'stream.publish',
   *          message: 'getting educated about Facebook Connect',
   *          attachment: {
   *            name: 'Connect',
   *            caption: 'The Facebook Connect JavaScript SDK',
   *            description: (
   *              'A small JavaScript library that allows you to harness ' +
   *              'the power of Facebook, bringing the user\'s identity, ' +
   *              'social graph and distribution power to your site.'
   *            ),
   *            href: 'http://github.com/facebook/connect-js'
   *          },
   *          action_links: [
   *            { text: 'Code', href: 'http://github.com/facebook/connect-js' }
   *          ],
   *          user_prompt_message: 'Share your thoughts about Connect'
   *        },
   *        function(response) {
   *          if (response && response.post_id) {
   *            alert('Post was published.');
   *          } else {
   *            alert('Post was not published.');
   *          }
   *        }
   *      );
   *
   * Example **stream.share**:
   *
   *      var share = {
   *        method: 'stream.share',
   *        u: 'http://fbrell.com/'
   *      };
   *
   *      FB.ui(share, function(response) { console.log(response); });
   *
   * @access public
   * @param params {Object} The required arguments vary based on the method
   * being used, but specifying the method itself is mandatory. If *display* is
   * not specified, then iframe dialogs will be used when possible, and popups
   * otherwise.
   *
   * Property | Type    | Description                        | Argument
   * -------- | ------- | ---------------------------------- | ------------
   * method   | String  | The UI dialog to invoke.           | **Required**
   * display  | String  | Specify `"popup"` to force popups. | **Optional**
   * @param cb {Function} Optional callback function to handle the result. Not
   * all methods may have a response.
   */
  ui: function(params, cb) {
    if (!params.method) {
      FB.log('"method" is a required parameter for FB.ui().');
      return;
    }

    var call = FB.UIServer.prepareCall(params, cb);
    if (!call) { // aborted
      return;
    }

    // each allowed "display" value maps to a function
    var displayName = call.params.display;
    if (displayName == 'dialog') { // TODO remove once all dialogs are on
                                   // uiserver
      displayName = 'iframe';
    }
    var displayFn = FB.UIServer[displayName];
    if (!displayFn) {
      FB.log('"display" must be one of "popup", "iframe" or "hidden".');
      return;
    }

    displayFn(call);
  }
});

/**
 * Internal UI functions.
 *
 * @class FB.UIServer
 * @static
 * @access private
 */
FB.provide('UIServer', {
  /**
   * UI Methods will be defined in this namespace.
   */
  Methods: {},

  _active        : {},
  _defaultCb     : {},
  _resultToken   : '"xxRESULTTOKENxx"',

  /**
   * Serves as a generic transform for UI Server dialogs. Once all dialogs are
   * built on UI Server, this will just become the default behavior.
   *
   * Current transforms:
   * 1) display=dialog -> display=iframe. Most of the old Connect stuff uses
   *    dialog, but UI Server uses iframe.
   * 2) Renaming of channel_url parameter to channel.
   */
  genericTransform: function(call) {
    if (call.params.display == 'dialog') {
      call.params.display = 'iframe';
      call.params.channel = FB.UIServer._xdChannelHandler(
        call.id,
        'parent.parent'
      );
    }
    return call;
  },

  /**
   * Prepares a generic UI call.
   *
   * @access private
   * @param params {Object} the user supplied parameters
   * @param cb {Function} the response callback
   * @returns {Object} the call data
   */
  prepareCall: function(params, cb) {
    var
      method = FB.UIServer.Methods[params.method.toLowerCase()],
      id     = FB.guid();

    if (!method) {
      FB.log('"' + params.method + '" is an unknown method.');
      return;
    }

    // default stuff
    FB.copy(params, {
      api_key     : FB._apiKey,
      // TODO change "dialog" to "iframe" once moved to uiserver
      display     : FB._session ? 'dialog' : 'popup',
      locale      : FB._locale,
      sdk         : 'joey',
      session_key : FB._session && FB._session.session_key
    });

    // cannot use an iframe "dialog" if a session is not available
    if (!FB._session && params.display == 'dialog' && !method.loggedOutIframe) {
      FB.log('"dialog" mode can only be used when the user is connected.');
      params.display = 'popup';
    }

    // the basic call data
    var call = {
      cb     : cb,
      id     : id,
      size   : method.size || {},
      url    : FB._domain.www + method.url,
      params : params
    };

    // optional method transform
    if (method.transform) {
      call = method.transform(call);

      // nothing returned from a transform means we abort
      if (!call) {
        return;
      }
    }

    // setting these after to ensure the value is based on the final
    // params.display value
    var relation = call.params.display == 'popup' ? 'opener' : 'parent';
    if (!(call.id in FB.UIServer._defaultCb) && !('next' in call.params)) {
      call.params.next = FB.UIServer._xdResult(
        call.cb,
        call.id,
        relation,
        true // isDefault
      );
    }
    if (relation === 'parent') {
      call.params.channel_url = FB.UIServer._xdChannelHandler(
        id,
        'parent.parent'
      );
    }

    // set this at the end to include all possible params
    var encodedQS = FB.QS.encode(FB.JSON.flatten(call.params));
    if ((call.url + encodedQS).length > 2000) {
      call.post = true;
    } else {
      if (encodedQS) {
        call.url += '?' + encodedQS;
      }
    }

    return call;
  },

  /**
   * Open a popup window with the given url and dimensions and place it at the
   * center of the current window.
   *
   * @access private
   * @param call {Object} the call data
   */
  popup: function(call) {
    // we try to place it at the center of the current window
    var
      screenX    = typeof window.screenX      != 'undefined'
        ? window.screenX
        : window.screenLeft,
      screenY    = typeof window.screenY      != 'undefined'
        ? window.screenY
        : window.screenTop,
      outerWidth = typeof window.outerWidth   != 'undefined'
        ? window.outerWidth
        : document.body.clientWidth,
      outerHeight = typeof window.outerHeight != 'undefined'
        ? window.outerHeight
        : (document.body.clientHeight - 22),
      width    = call.size.width,
      height   = call.size.height,
      left     = parseInt(screenX + ((outerWidth - width) / 2), 10),
      top      = parseInt(screenY + ((outerHeight - height) / 2.5), 10),
      features = (
        'width=' + width +
        ',height=' + height +
        ',left=' + left +
        ',top=' + top
      );

    // either a empty window and then a POST, or a direct GET to the full url
    if (call.post) {
      FB.UIServer._active[call.id] = window.open(
        'about:blank',
        call.id,
        features
      );
      FB.Content.postTarget({
        url    : call.url,
        target : call.id,
        params : call.params
      });
    } else {
      FB.UIServer._active[call.id] = window.open(
        call.url,
        call.id,
        features
      );
    }

    // if there's a default close action, setup the monitor for it
    if (call.id in FB.UIServer._defaultCb) {
      FB.UIServer._popupMonitor();
    }
  },

  /**
   * Builds and inserts a hidden iframe based on the given call data.
   *
   * @access private
   * @param call {Object} the call data
   */
  hidden: function(call) {
    call.className = 'FB_UI_Hidden';
    call.root = FB.Content.appendHidden('');
    FB.UIServer._insertIframe(call);
  },

  /**
   * Builds and inserts a iframe dialog based on the given call data.
   *
   * @access private
   * @param call {Object} the call data
   */
  iframe: function(call) {
    call.className = 'FB_UI_Dialog';
    call.root = FB.Dialog.create({
      onClose: function() {
        FB.UIServer._triggerDefault(call.id);
      },
      loader: true,
      closeIcon: true
    });
    FB.Dom.addCss(call.root, 'fb_dialog_iframe');
    FB.UIServer._insertIframe(call);
  },

  /**
   * Inserts an iframe based on the given call data.
   *
   * @access private
   * @param call {Object} the call data
   */
  _insertIframe: function(call) {
    // either a empty iframe and then a POST, or a direct GET to the full url
    if (call.post) {
      FB.Content.insertIframe({
        url       : 'about:blank',
        root      : call.root,
        className : call.className,
        width     : call.size.width,
        height    : call.size.height,
        onload    : function(node) {
          FB.UIServer._active[call.id] = node;
          FB.Content.postTarget({
            url    : call.url,
            target : node.name,
            params : call.params
          });
        }
      });
    } else {
      FB.Content.insertIframe({
        url       : call.url,
        root      : call.root,
        className : call.className,
        width     : call.size.width,
        height    : call.size.height,
        onload    : function(node) {
          FB.UIServer._active[call.id] = node;
        }
      });
    }
  },

  /**
   * Trigger the default action for the given call id.
   *
   * @param id {String} the call id
   */
  _triggerDefault: function(id) {
    FB.UIServer._xdRecv(
      { frame: id },
      FB.UIServer._defaultCb[id] || function() {}
    );
  },

  /**
   * Start and manage the window monitor interval. This allows us to invoke
   * the default callback for a window when the user closes the window
   * directly.
   *
   * @access private
   */
  _popupMonitor: function() {
    // check all open windows
    var found;
    for (var id in FB.UIServer._active) {
      // ignore prototype properties, and ones without a default callback
      if (FB.UIServer._active.hasOwnProperty(id) &&
          id in FB.UIServer._defaultCb) {
        var win = FB.UIServer._active[id];

        // ignore iframes
        try {
          if (win.tagName) {
            // is an iframe, we're done
            continue;
          }
        } catch (x) {
          // probably a permission error
        }

        try {
          // found a closed window
          if (win.closed) {
            FB.UIServer._triggerDefault(id);
          } else {
            found = true; // need to monitor this open window
          }
        } catch (y) {
          // probably a permission error
        }
      }
    }

    if (found && !FB.UIServer._popupInterval) {
      // start the monitor if needed and it's not already running
      FB.UIServer._popupInterval = window.setInterval(
        FB.UIServer._popupMonitor,
        100
      );
    } else if (!found && FB.UIServer._popupInterval) {
      // shutdown if we have nothing to monitor but it's running
      window.clearInterval(FB.UIServer._popupInterval);
      FB.UIServer._popupInterval = null;
    }
  },

  /**
   * Handles channel messages. These should be general, like a resize message.
   * Custom logic should be handled as part of the "next" handler.
   *
   * @access private
   * @param frame {String} the frame id
   * @param relation {String} the frame relation
   * @return {String} the handler url
   */
  _xdChannelHandler: function(frame, relation) {
    return FB.XD.handler(function(data) {
      var node = FB.UIServer._active[frame];
      if (!node) { // dead handler
        return;
      }
      if (data.type == 'resize') {
        if (data.height) {
          node.style.height = data.height + 'px';
        }
        if (data.width) {
          node.style.width = data.width + 'px';
        }
        FB.Dialog.show(node);
      }
    }, relation, true);
  },

  /**
   * A "next handler" is a specialized XD handler that will also close the
   * frame. This can be a hidden iframe, iframe dialog or a popup window.
   *
   * @access private
   * @param cb        {Function} the callback function
   * @param frame     {String}   frame id for the callback will be used with
   * @param relation  {String}   parent or opener to indicate window relation
   * @param isDefault {Boolean}  is this the default callback for the frame
   * @return         {String}   the xd url bound to the callback
   */
  _xdNextHandler: function(cb, frame, relation, isDefault) {
    if (isDefault) {
      FB.UIServer._defaultCb[frame] = cb;
    }

    return FB.XD.handler(function(data) {
      FB.UIServer._xdRecv(data, cb);
    }, relation) + '&frame=' + frame;
  },

  /**
   * Handles the parsed message, invokes the bound callback with the data and
   * removes the related window/frame. This is the asynchronous entry point for
   * when a message arrives.
   *
   * @access private
   * @param data {Object} the message parameters
   * @param cb {Function} the callback function
   */
  _xdRecv: function(data, cb) {
    var frame = FB.UIServer._active[data.frame];

    // iframe
    try {
      if (FB.Dom.containsCss(frame, 'FB_UI_Hidden')) {
        // wait before the actual removal because of race conditions with async
        // flash crap. seriously, dont ever ask me about it.
        window.setTimeout(function() {
          // remove iframe's parentNode to match what FB.UIServer.hidden() does
          frame.parentNode.parentNode.removeChild(frame.parentNode);
        }, 3000);
      } else if (FB.Dom.containsCss(frame, 'FB_UI_Dialog')) {
        FB.Dialog.remove(frame);
      }
    } catch (x) {
      // do nothing, permission error
    }

    // popup window
    try {
      if (frame.close) {
        frame.close();
        FB.UIServer._popupCount--;
      }
    } catch (y) {
      // do nothing, permission error
    }

    // cleanup and fire
    delete FB.UIServer._active[data.frame];
    delete FB.UIServer._defaultCb[data.frame];
    cb(data);
  },

  /**
   * Some Facebook redirect URLs use a special ``xxRESULTTOKENxx`` to return
   * custom values. This is a convenience function to wrap a callback that
   * expects this value back.
   *
   * @access private
   * @param cb        {Function} the callback function
   * @param frame     {String}   the frame id for the callback is tied to
   * @param target    {String}   parent or opener to indicate window relation
   * @param isDefault {Boolean}  is this the default callback for the frame
   * @return          {String}   the xd url bound to the callback
   */
  _xdResult: function(cb, frame, target, isDefault) {
    return (
      FB.UIServer._xdNextHandler(function(params) {
        cb && cb(params.result &&
                 params.result != FB.UIServer._resultToken &&
                 JSON.parse(params.result));
      }, frame, target, isDefault) +
      '&result=' + encodeURIComponent(FB.UIServer._resultToken)
    );
  }
});
