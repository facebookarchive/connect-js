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
 * @provides fb.content
 * @requires fb.prelude
 */

/**
 * "Content" is a very flexible term. Helpers for things like hidden
 * DOM content, iframes and popups.
 *
 * @class FB.Content
 * @static
 * @access private
 */
FB.copy('Content', {
  _root       : null,
  _hiddenRoot : null,
  _callbacks  : {},

  /**
   * Append some content.
   *
   * @access private
   * @param content {String|Node} a DOM Node or HTML string
   * @param root    {Node}        (optional) a custom root node
   * @return {Node} the node that was just appended
   */
  append: function(content, root) {
    // setup the root node, creating it if necessary
    if (!root) {
      if (!FB.Content._root) {
        FB.Content._root = root = document.getElementById('fb-root');
        if (!root) {
          FB.log('The "fb-root" div has not been created.');
          return;
        }
      } else {
        root = FB.Content._root;
      }
    }

    if (typeof content == 'string') {
      var div = document.createElement('div');
      root.appendChild(div).innerHTML = content;
      return div;
    } else {
      return root.appendChild(content);
    }
  },

  /**
   * Append some hidden content.
   *
   * @access private
   * @param content {String|Node} a DOM Node or HTML string
   * @return {Node} the node that was just appended
   */
  appendHidden: function(content) {
    if (!FB.Content._hiddenRoot) {
      var
        hiddenRoot = document.createElement('div'),
        style      = hiddenRoot.style;
      style.position = 'absolute';
      style.top      = '-10000px';
      style.width    = style.height = 0;
      FB.Content._hiddenRoot = FB.Content.append(hiddenRoot);
    }

    return FB.Content.append(content, FB.Content._hiddenRoot);
  },

  /**
   * Insert a new iframe. Unfortunately, its tricker than you imagine.
   *
   * @access private
   * @param url     {String}      url for the iframe
   * @param root    {Node}        node to insert the iframe into
   * @param onload  {Function}    optional onload callback
   */
  insertIframe: function(url, root, onload) {
    //
    // Browsers evolved. Evolution is messy.
    //

    // Dear IE, screw you. Only works with the magical incantations.
    // Dear FF, screw you too. Needs src _after_ DOM insertion.
    // Dear Webkit, you're okay. Works either way.


    var
      guid = FB.guid(),
      div = FB.Content.append('', root),

      // Since we set the src _after_ inserting the iframe node into the DOM,
      // some browsers will fire two onload events, once for the first empty
      // iframe insertion and then again when we set the src. Here some
      // browsers are Webkit browsers which seem to be trying to do the
      // "right thing". So we toggle this boolean right before we expect the
      // correct onload handler to get fired.
      srcSet = false;
    FB.Content._callbacks[guid] = function() {
      if (srcSet) {
        onload && onload(div.firstChild);
        delete FB.Content._callbacks[guid];
      }
    };

    if (document.attachEvent) {
      var html = (
        '<iframe ' +
          ' src="' + url + '"' +
          ' onload="FB.Content._callbacks.' + guid + '()"' +
        '></iframe>'
      );

      // There is an IE bug with iframe caching that we have to work around. We
      // need to load a dummy iframe to consume the initial cache stream. The
      // setTimeout actually sets the content to the HTML we created above, and
      // because its the second load, we no longer suffer from cache sickness.
      // It must be javascript:false instead of about:blank, otherwise IE6 will
      // complain in https.
      div.innerHTML = '<iframe src="javascript:false"></iframe>';

      // Now we'll be setting the real src.
      srcSet = true;

      // You may wonder why this is a setTimeout. Read the IE source if you can
      // somehow get your hands on it, and tell me if you figure it out. This
      // is a continuation of the above trick which apparently does not work if
      // the innerHTML is changed right away. We need to break apart the two
      // with this setTimeout 0 which seems to fix the issue.
      window.setTimeout(function() {
        div.innerHTML = html;
      }, 0);
    } else {
      // This block works for all non IE browsers. But it's specifically
      // designed for FF where we need to set the src after inserting the
      // iframe node into the DOM to prevent cache issues.
      var node = document.createElement('iframe');
      node.onload = FB.Content._callbacks[guid];
      div.appendChild(node);

      // Now we'll be setting the real src.
      srcSet = true;

      node.src = url;
    }
  }
});
