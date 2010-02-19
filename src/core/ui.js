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
 * @provides fb.ui
 * @requires fb.prelude
 *           fb.qs
 *           fb.frames
 *           fb.json
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
   * Sharing is the light weight way of distributing your content. As opposed
   * to the structured data explicitly given in the [FB.publish][publish] call,
   * with share you simply provide the URL and optionally a title:
   *
   *      FB.share(
   *        'http://github.com/facebook/connect-js',
   *        'Connect JavaScript SDK'
   *      );
   *
   * Both arguments are optional, and just calling [FB.share][share] will share
   * the current page.
   *
   * This call can be used without requiring the user to sign in.
   *
   * [publish]: /docs/?u=facebook.jslib-alpha.FB.publish
   * [share]: /docs/?u=facebook.jslib-alpha.FB.share
   *
   * @access public
   * @param u {String} the url (defaults to current URL)
   * @param title {String} a custom title
   */
  share: function(u, title) {
    var
      url = FB._domain.www + 'sharer.php?' + FB.QS.encode({
        title : title,
        u     : u || window.location.toString()
      });

    FB.Frames.popup(url, 575, 380);
  },

  /**
   * Publish a post to the stream.
   *
   * This is the main, fully featured distribution mechanism for you
   * to publish into the user's stream. It can be used, with or
   * without an API key. With an API key you can control the
   * Application Icon and get attribution. You must also do this if
   * you wish to use the callback to get notified of the `post_id`
   * and the `message` the user typed in the published post, or find
   * out if the user did not publish (clicked on the skipped button).
   *
   * Publishing is a powerful feature that allows you to submit rich
   * media and provide a integrated experience with control over your
   * stream post. You can guide the user by choosing the prompt,
   * and/or a default message which they may customize. In addition,
   * you may provide image, video, audio or flash based attachments
   * with along with their metadata. You also get the ability to
   * provide action links which show next to the "Like" and "Comment"
   * actions. All this together provides you full control over your
   * stream post. In addition, if you may also specify a target for
   * the story, such as another user or a page.
   *
   * A post may contain the following properties:
   *
   * Property            | Type   | Description
   * ------------------- | ------ | --------------------------------------
   * message             | String | This allows prepopulating the message.
   * attachment          | Object | An [[wiki:Attachment (Streams)]] object.
   * action_links        | Array  | An array of [[wiki:Action Links]].
   * actor_id            | String | A actor profile/page id.
   * target_id           | String | A target profile id.
   * user_message_prompt | String | Custom prompt message.
   *
   * The post and all the parameters are optional, so use what is best
   * for your specific case.
   *
   * Example:
   *
   *     var post = {
   *       message: 'getting educated about Facebook Connect',
   *       attachment: {
   *         name: 'Facebook Connect JavaScript SDK',
   *         description: (
   *           'A JavaScript library that allows you to harness ' +
   *           'the power of Facebook, bringing the user\'s identity, ' +
   *           'social graph and distribution power to your site.'
   *         ),
   *         href: 'http://github.com/facebook/connect-js'
   *       },
   *       action_links: [
   *         {
   *           text: 'SDK Console',
   *           href: 'http://developers.facebook.com/connect/console.php'
   *         },
   *         {
   *           text: 'GitHub Repo',
   *           href: 'http://github.com/facebook/connect-js'
   *         },
   *       ],
   *       user_message_prompt: 'Share your thoughts about Facebook Connect'
   *     };
   *
   *     FB.publish(
   *       post,
   *       function(published_post) {
   *         if (published_post) {
   *           alert(
   *             'The post was successfully published. ' +
   *             'Post ID: ' + published_post.post_id +
   *             '. Message: ' + published_post.message
   *           );
   *         } else {
   *           alert('The post was not published.');
   *         }
   *       }
   *     );
   *
   * @access public
   * @param post {Object} the post object
   * @param cb {Function} called with the result of the action
   */
  publish: function(post, cb) {
    // YUCK
    if (cb) {
      var old_cb = cb;
      cb = function(result) {
        if (result) {
          if (result.postId) {
            result = {
              message: result.data.user_message,
              post_id: result.postId
            };
          } else {
            result = null;
          }
        }
        old_cb(result);
      };
    }

    post = post || {};
    var
      g   = FB._apiKey && FB.guid(),
      url = FB._domain.www + 'connect/prompt_feed.php?' + FB.QS.encode({
        action_links        : FB.JSON.stringify(post.action_links || {}),
        actor_id            : post.actor_id,
        api_key             : FB._apiKey,
        attachment          : FB.JSON.stringify(post.attachment || {}),
        callback            : g && FB.Frames.xdResult(cb, g, 'opener', true),
        message             : post.message,
        preview             : 1,
        session_key         : FB._session && FB._session.session_key,
        target_id           : post.target_id,
        user_message_prompt : post.user_message_prompt
      });

    FB.Frames.popup(url, 550, 242, g);
  },

  /**
   * Prompt the user to add the given id as a friend.
   *
   * @access public
   * @param id {String} the id of the target user
   * @param cb {Function} called with the result of the action
   */
  addFriend: function(id, cb) {
    var
      g   = FB.guid(),
      url = FB._domain.www + 'addfriend.php?' + FB.QS.encode({
        api_key     : FB._apiKey,
        display     : 'dialog',
        id          : id,
        next        : FB.Frames.xdResult(cb, g, 'opener', true),
        session_key : FB._session.session_key
      });

    FB.Frames.popup(url, 565, 240, g);
  }
});
