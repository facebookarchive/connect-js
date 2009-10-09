/**
 * @module Mu
 * @provides Mu.Frames
 *
 * @requires Mu.Prelude
 *           Mu.Content
 *           Mu.QS
 *           Mu.XD
 */

/**
 * Browser Frames: Popup Windows, Iframe Dialogs and Hidden Iframes.
 *
 * @class Mu.Frames
 * @static
 * @access private
 */
Mu.copy('Frames', {
  _monitor     : null,
  _count       : 0,
  _active      : {},
  _defaultCb   : {},
  _resultToken : '"xxRESULTTOKENxx"',

  /**
   * Builds and inserts a hidden iframe.
   *
   * @access private
   * @param url {String} the URL for the iframe
   * @param id  {String} the id to store the node against in _active
   */
  hidden: function(url, id) {
    var node = document.createElement('iframe');
    // In IE, we must set the iframe src _before_ injecting the node into the
    // document to prevent the click noise.
    if (document.attachEvent) {
      node.setAttribute('src', url);
    }
    Mu.Frames._active[id] = Mu.Content.hidden(node);
    // For Firefox, we must set the iframe src _after_ injecting the node into
    // the document to prevent caching issues. This also works fine in other
    // browsers.
    if (!document.attachEvent) {
      node.setAttribute('src', url);
    }
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

    Mu.Frames._active[id] = window.open(url, '_blank', features);

    // if there's a default close action, setup the monitor for it
    if (id in Mu.Frames._defaultCb) {
      Mu.Frames._count++;
      Mu.Frames.winMonitor();
    }
  },

  /**
   * Start and manage the window monitor interval. This allows us to invoke
   * the default callback for a window when the user closes the window
   * directly.
   *
   * @access private
   */
  winMonitor: function() {
    // shutdown if we have nothing to monitor
    if (Mu.Frames._count < 1) {
      window.clearInterval(Mu.Frames._monitor);
      Mu.Frames._monitor = null;
      return;
    }

    // start the monitor if its not already running
    if (!Mu.Frames._monitor) {
      Mu.Frames._monitor = window.setInterval(Mu.Frames.winMonitor, 100);
    }

    // check all open windows
    for (var id in Mu.Frames._active) {
      // ignore prototype properties, and ones without a default callback
      if (Mu.Frames._active.hasOwnProperty(id) && id in Mu.Frames._defaultCb) {
        var win = Mu.Frames._active[id];

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
            Mu.Frames._count--;
            Mu.Frames.xdRecv({ cb: id, frame: id }, Mu.Frames._defaultCb[id]);
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
   * @returns         {String}   the xd url bound to the callback
   */
  handler: function(cb, frame, relation, isDefault) {
    if (isDefault) {
      Mu.Frames._defaultCb[frame] = cb;
    }

    return Mu.XD.handler(function(data) {
      Mu.Frames.xdRecv(data, cb);
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
    var frame = Mu.Frames._active[data.frame];

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
    delete Mu.Frames._active[data.frame];
    delete Mu.Frames._defaultCb[data.frame];
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
   * @returns         {String}   the xd url bound to the callback
   */
  xdResult: function(cb, frame, target, isDefault) {
    return (
      Mu.Frames.handler(function(params) {
        cb && cb(params.result &&
                 params.result != Mu.Frames._resultToken &&
                 JSON.parse(params.result));
      }, frame, target, isDefault) +
      '&result=' + encodeURIComponent(Mu.Frames._resultToken)
    );
  }
});
