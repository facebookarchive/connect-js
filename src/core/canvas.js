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
 * @provides fb.canvas
 * @requires fb.prelude
 *           fb.array
 *           fb.content
 *           fb.qs
 */

/**
 * Things used by Canvas apps.
 *
 * ---------------------------------------------------------------------
 * IMPORTANT NOTE: IF YOU ARE USING THESE FUNCTIONS, MAKE SURE YOU GO TO
 *
 * http://www.facebook.com/developers
 *
 * CLICK YOUR APP, CLICK EDIT SETTINGS, CLICK MIGRATIONS AND ENABLE
 *
 * Using the New SDKs
 * ---------------------------------------------------------------------
 *
 * @class FB.Canvas
 * @static
 * @access private
 */
FB.provide('Canvas', {
  /**
   * The timer. We keep it around so we can shut if off
   */
  _timer: null,

  /**
   * Sets the size of the frame to the desired size.
   *
   * You probably want to call this without any parameters because
   * if width or height isn't specified, then they default
   * to the current size of the content.
   *
   * @param {Object} optional
   *
   * Property | Type    | Description                      | Argument   | Default
   * -------- | ------- | -------------------------------- | ---------- | -------
   * width    | Integer | Desired width. Max is app width. | *Optional* | frame width
   * height   | Integer | Desired height.                  | *Optional* | frame height
   *
   * @author ptarjan
   */
  setSize: function(params) {
    // setInterval calls its function with an integer
    if (typeof params != "object") {
      params = {};
    }
    params = FB.copy(params || {}, FB.Canvas._computeContentSize());

    // Deep compare
    if (FB.Canvas._lastSize &&
        FB.Canvas._lastSize.width == params.width &&
        FB.Canvas._lastSize.height == params.height) {
      return false;
    }
    FB.Canvas._lastSize = params;

    FB.Canvas._sendMessageToFacebook({
      method: 'setSize',
      params: params
    });
    return true;
  },

  /**
   * Turns on or off continual adjustment of the iframe's size
   * Used to be known as: startTimerToSizeToContent
   *
   * @param {Boolean} optional Whether to turn the timer on or off - default on
   * @param {Integer} optional How often to resize (in ms) - default 100ms
   *
   * @author ptarjan
   */
  setAutoResize: function(onOrOff, interval) {
    // I did this a few times, so I expect many users will too
    if (interval === undefined && typeof onOrOff == "number") {
      interval = onOrOff;
      onOrOff = true;
    }

    if (onOrOff === undefined || onOrOff) {
      if (FB.Canvas._timer === null) {
        FB.Canvas._timer =
          window.setInterval(FB.Canvas.setSize,
                             interval || 100); // 100 ms is the default
      }
      FB.Canvas.setSize();
    } else {
      if (FB.Canvas._timer !== null) {
        window.clearInterval(FB.Canvas._timer);
        FB.Canvas._timer = null;
      }
    }
  },

  /**
   * Determine the size of the actual contents of the iframe.
   *
   * This is the same number jQuery seems to give for
   * $(document).height() but still causes a scrollbar in some browsers
   * on some sites.
   * Patches and test cases are welcome.
   */
  _computeContentSize: function() {
    var body = document.body,
        docElement = document.documentElement,
        right = 0,
        bottom = Math.max(
          Math.max(body.offsetHeight, body.scrollHeight) +
            body.offsetTop,
          Math.max(docElement.offsetHeight, docElement.scrollHeight) +
            docElement.offsetTop);

    if (body.offsetWidth < body.scrollWidth) {
      right = body.scrollWidth + body.offsetLeft;
    } else {
      FB.Array.forEach(body.childNodes, function(child) {
        var childRight = child.offsetWidth + child.offsetLeft;
        if (childRight > right) {
          right = childRight;
        }
      });
    }
    if (docElement.clientLeft > 0) {
      right += (docElement.clientLeft * 2);
    }
    if (docElement.clientTop > 0) {
      bottom += (docElement.clientTop * 2);
    }

    return {height: bottom, width: right};
  },

  /**
   * Sends a request back to facebook.
   *
   * @author ptarjan
   */
  _sendMessageToFacebook: function(message) {
    var url = FB._domain.staticfb + 'connect/canvas_proxy.php#' +
      FB.QS.encode({method: message.method,
                    params: FB.JSON.stringify(message.params)});

     var root = FB.Content.appendHidden('');
     FB.Content.insertIframe({
       url: url,
       root: root,
       width: 1,
       height: 1,
       onload: function() {
         setTimeout(function() {
           root.parentNode.removeChild(root);
         }, 10);
       }
     });
  }
});
