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
 * @provides fb.frames
 * @requires fb.prelude
 *           fb.content
 *           fb.qs
 *           fb.xd
 *           fb.json2
 */

/**
 * Browser Frames: Popup Windows, Iframe Dialogs and Hidden Iframes.
 *
 * @class FB.Frames
 * @static
 * @access private
 */
FB.copy('Frames', {
  _monitor     : null,
  _count       : 0,
  _active      : {},
  _defaultCb   : {},
  _resultToken : '"xxRESULTTOKENxx"',

  /**
   * Builds and inserts a hidden iframe with the reference stored against the
   * given id.
   *
   * @access private
   * @param url {String} the URL for the iframe
   * @param id  {String} the id to store the node against in _active
   */
  hidden: function(url, id) {
    FB.Content.insertIframe(url, FB.Content.appendHidden(''), function(node) {
      FB.Frames._active[id] = node;
    });
  },

  /**
   * Open a popup window with the given url and dimensions and place it at the
   * center of the current window.
   *
   * @access private
   * @param url    {String}  the url for the popup
   * @param width  {Integer} the initial width for the popup
   * @param height {Integer} the initial height for the popup
   * @param id     {String}  the id to store the window against in _active
   */
  popup: function(url, width, height, id) {
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
      left     = parseInt(screenX + ((outerWidth - width) / 2), 10),
      top      = parseInt(screenY + ((outerHeight - height) / 2.5), 10),
      features = (
        'width=' + width +
        ',height=' + height +
        ',left=' + left +
        ',top=' + top
      );

    FB.Frames._active[id] = window.open(url, '_blank', features);

    // if there's a default close action, setup the monitor for it
    if (id in FB.Frames._defaultCb) {
      FB.Frames._count++;
      FB.Frames.popupMonitor();
    }
  },

  /**
   * Start and manage the window monitor interval. This allows us to invoke
   * the default callback for a window when the user closes the window
   * directly.
   *
   * @access private
   */
  popupMonitor: function() {
    // shutdown if we have nothing to monitor
    if (FB.Frames._count < 1) {
      window.clearInterval(FB.Frames._monitor);
      FB.Frames._monitor = null;
      return;
    }

    // start the monitor if its not already running
    if (!FB.Frames._monitor) {
      FB.Frames._monitor = window.setInterval(FB.Frames.popupMonitor, 100);
    }

    // check all open windows
    for (var id in FB.Frames._active) {
      // ignore prototype properties, and ones without a default callback
      if (FB.Frames._active.hasOwnProperty(id) && id in FB.Frames._defaultCb) {
        var win = FB.Frames._active[id];

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
            FB.Frames._count--;
            FB.Frames.xdRecv({ frame: id }, FB.Frames._defaultCb[id]);
          }
        } catch(y) {
          // probably a permission error
        }
      }
    }
  },


  /**
   * A "frame handler" is a specialized XD handler that will also close the
   * frame. This can be a hidden iframe, iframe dialog or a popup window.
   *
   * @access private
   * @param cb        {Function} the callback function
   * @param frame     {String}   frame id for the callback will be used with
   * @param relation  {String}   parent or opener to indicate window relation
   * @param isDefault {Boolean}  is this the default callback for the frame
   * @return         {String}   the xd url bound to the callback
   */
  xdHandler: function(cb, frame, relation, isDefault) {
    if (isDefault) {
      FB.Frames._defaultCb[frame] = cb;
    }

    return FB.XD.handler(function(data) {
      FB.Frames.xdRecv(data, cb);
    }, relation) + '&frame=' + frame;
  },

  /**
   * Handles the parsed message, invokes the bound callback with the data
   * and removes the related window/frame.
   *
   * @access private
   * @param data {Object} the message parameters
   */
  xdRecv: function(data, cb) {
    var frame = FB.Frames._active[data.frame];

    // iframe
    try {
      if (frame.tagName) {
        // timeout of 500 prevents the safari forever waiting bug if we end
        // up using this for visible iframe dialogs, the 500 would be
        // unacceptable
        window.setTimeout(function() {
                            frame.parentNode.removeChild(frame);
                          }, 500);
      }
    } catch (x) {
      // do nothing, permission error
    }

    // popup window
    try {
      if (frame.close) {
        frame.close();
      }
    } catch (y) {
      // do nothing, permission error
    }

    // cleanup and fire
    delete FB.Frames._active[data.frame];
    delete FB.Frames._defaultCb[data.frame];
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
   * @return         {String}   the xd url bound to the callback
   */
  xdResult: function(cb, frame, target, isDefault) {
    return (
      FB.Frames.xdHandler(function(params) {
        cb && cb(params.result &&
                 params.result != FB.Frames._resultToken &&
                 JSON.parse(params.result));
      }, frame, target, isDefault) +
      '&result=' + encodeURIComponent(FB.Frames._resultToken)
    );
  }
});
