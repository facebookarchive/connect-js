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
 * @provides fb.ui.methods
 * @requires fb.prelude
 *           fb.ui
 */

/**
 * Simple UI methods. Consider putting complex UI methods in their own modules.
 *
 * NOTE: Right now, Methods need to provide an initial size, as well as a URL.
 * In the UIServer enabled world, we should not need the URL.
 */
FB.provide('UIServer.Methods', {
  'friends.add': {
    size      : { width: 575, height: 240 },
    url       : 'connect/uiserver.php',
    transform : FB.UIServer.genericTransform
  },

  'stream.publish': {
    size : { width: 575, height: 240 },
    url  : 'connect/prompt_feed.php',
    transform: function(call) {
      var cb = call.cb;
      call.cb = function(result) {
        if (result) {
          if (result.postId) {
            result = { post_id: result.postId };
          } else {
            result = null;
          }
        }
        cb && cb(result);
      };

      call.params.callback = FB.UIServer._xdResult(
        call.cb,
        call.id,
        call.params.display == 'popup' ? 'opener' : 'parent',
        true
      );
      return call;
    }
  },

  'stream.share': {
    size      : { width: 575, height: 380 },
    url       : 'sharer.php',
    transform : function(call) {
      if (!call.params.u) {
        call.params.u = window.location.toString();
      }
      return call;
    }
  },

  'fbml.dialog': {
    size            : { width: 575, height: 300 },
    url             : 'render_fbml.php',
    loggedOutIframe : true
  },

  'bookmark.add': {
    size      : { width: 460, height: 226 },
    url       : 'connect/uiserver.php',
    transform : FB.UIServer.genericTransform
  },

  'profile.addtab': {
    size      : { width: 460, height: 226 },
    url       : 'connect/uiserver.php',
    transform : FB.UIServer.genericTransform
  }
});
