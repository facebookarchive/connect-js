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
 * New SDKs
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
   * Tells Facebook to resize your iframe.
   *
   * ## Migration Requirement
   *
   * To use this function, you MUST have enabled the *New SDKs*
   * [migration](http://developers.facebook.com/blog/post/363).
   *
   * ## Examples
   *
   * Call this whenever you need a resize. This usually means, once after
   * pageload, and whenever your content size changes.
   *
   *     window.fbAsyncInit = function() {
   *       FB.Canvas.setSize();
   *     }
   *
   *     // Do things that will sometimes call sizeChangeCallback()
   *
   *     function sizeChangeCallback() {
   *       FB.Canvas.setSize();
   *     }
   *
   * It will default to the current size of the frame, but if you have a need
   * to pick your own size, you can use the params array.
   *
   *     FB.Canvas.setSize({ width: 640, height: 480 }); // Live in the past
   *
   * The max width is whatever you picked in your app settings, and there is no
   * max height.
   *
   * @param {Object} params
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
   * Starts or stops a timer which resizes your iframe every few milliseconds.
   *
   * Used to be known as:
   * [startTimerToSizeToContent](http://wiki.developers.facebook.com/index.php/Resizable_IFrame)
   *
   * ## Migration Requirement
   *
   * To use this function, you MUST have enabled the *New SDKs*
   * [migration](http://developers.facebook.com/blog/post/363).
   *
   * ## Examples
   *
   * This function is useful if you know your content will change size, but you
   * don't know when. There will be a slight delay, so if you know when your
   * content changes size, you should call [setSize](FB.Canvas.setSize)
   * yourself (and save your user's CPU cycles).
   *
   *     window.fbAsyncInit = function() {
   *       FB.Canvas.setAutoResize();
   *     }
   *
   * If you ever need to stop the timer, just pass false.
   *
   *     FB.Canvas.setAutoResize(false);
   *
   * If you want the timer to run at a different interval, you can do that too.
   *
   *     FB.Canvas.setAutoResize(91); // Paul's favourite number
   *
   * Note: If there is only 1 parameter and it is a number, it is assumed to be
   * the interval.
   *
   * @param {Boolean} onOrOff Whether to turn the timer on or off. truthy ==
   * on, falsy == off. **default** is true
   * @param {Integer} interval How often to resize (in ms). **default** is
   * 100ms
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
