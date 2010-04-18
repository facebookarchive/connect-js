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
 * @provides fb.xfbml.comments
 * @layer xfbml
 * @requires fb.type fb.xfbml.iframewidget fb.auth
 */

/**
 * Implementation for fb:comments tag.
 *
 * @class FB.XFBML.Comments
 * @extends FB.XFBML.IframeWidget
 * @private
 */
FB.subclass('XFBML.Comments', 'XFBML.IframeWidget', null, {
  /**
   * Make the iframe visible only when we get the initial resize message.
   */
  _visibleAfter: 'resize',

  /**
   * Refresh the iframe on auth.statusChange events.
   */
  _refreshOnAuthChange: true,

  /**
   * Do initial attribute processing.
   */
  setupAndValidate: function() {
    // query parameters to the comments iframe
    var attr = {
      channel_url : this.getChannelUrl(),
      css         : this.getAttribute('css'),
      notify      : this.getAttribute('notify'),
      numposts    : this.getAttribute('num-posts', 10),
      quiet       : this.getAttribute('quiet'),
      reverse     : this.getAttribute('reverse'),
      simple      : this.getAttribute('simple'),
      title       : this.getAttribute('title', document.title),
      url         : this.getAttribute('url', document.URL),
      width       : this._getPxAttribute('width', 550),
      xid         : this.getAttribute('xid')
    };

    // default xid to current URL
    if (!attr.xid) {
      // We always want the URL minus the hash "#" also note the encoding here
      // and down below when the url is built. This is intentional, so the
      // string received by the server is url-encoded and thus valid.
      var index = document.URL.indexOf('#');
      if (index > 0) {
        attr.xid = encodeURIComponent(document.URL.substring(0, index));
      }
      else {
        attr.xid = encodeURIComponent(document.URL);
      }
    }
    this._attr = attr;
    return true;
  },

  /**
   * Setup event handlers.
   */
  oneTimeSetup: function() {
    this.subscribe('xd.addComment', FB.bind(this._handleCommentMsg, this));
  },

  /**
   * Get the initial size.
   *
   * @return {Object} the size
   */
  getSize: function() {
    return { width: this._attr.width, height: 200 };
  },

  /**
   * Get the URL bits for the iframe.
   *
   * @return {Object} the iframe URL bits
   */
  getUrlBits: function() {
    return { name: 'comments', params: this._attr };
  },

  /**
   * Invoked by the iframe when a comment is added. Note, this feature needs to
   * be enabled by specifying the notify=true attribute on the tag. This is in
   * order to improve performance by only requiring this overhead when a
   * developer explicitly said they want it.
   *
   * @param message {Object} the message received via XD
   */
  _handleCommentMsg: function(message) {
    //TODO (naitik) what should we be giving the developers here? is there a
    //              comment_id they can get?
    if (!this.isValid()) {
      return;
    }
    FB.Event.fire('comments.add', {
      post: message.post,
      user: message.user,
      widget: this
    });
  }
});
