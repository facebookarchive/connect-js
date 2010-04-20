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
 * @requires fb.prelude fb.array
 */

/**
 * "Content" is a very flexible term. Helpers for things like hidden
 * DOM content, iframes and popups.
 *
 * @class FB.Content
 * @static
 * @access private
 */
FB.provide('Content', {
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
        FB.Content._root = root = FB.$('fb-root');
        if (!root) {
          FB.log('The "fb-root" div has not been created.');
          return;
        } else {
          root.className += ' fb_reset';
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
   * NOTE: These iframes have no border, overflow hidden and no scrollbars.
   *
   * The opts can contain:
   *   root       DOMElement  required root node (must be empty)
   *   url        String      required iframe src attribute
   *   className  String      optional class attribute
   *   height     Integer     optional height in px
   *   id         String      optional id attribute
   *   name       String      optional name attribute
   *   onload     Function    optional onload handler
   *   width      Integer     optional width in px
   *
   * @access private
   * @param opts {Object} the options described above
   */
  insertIframe: function(opts) {
    //
    // Browsers evolved. Evolution is messy.
    //
    opts.id = opts.id || FB.guid();
    opts.name = opts.name || FB.guid();

    // Dear IE, screw you. Only works with the magical incantations.
    // Dear FF, screw you too. Needs src _after_ DOM insertion.
    // Dear Webkit, you're okay. Works either way.
    var
      guid = FB.guid(),

      // Since we set the src _after_ inserting the iframe node into the DOM,
      // some browsers will fire two onload events, once for the first empty
      // iframe insertion and then again when we set the src. Here some
      // browsers are Webkit browsers which seem to be trying to do the
      // "right thing". So we toggle this boolean right before we expect the
      // correct onload handler to get fired.
      srcSet = false,
      onloadDone = false;
    FB.Content._callbacks[guid] = function() {
      if (srcSet && !onloadDone) {
        onloadDone = true;
        opts.onload && opts.onload(opts.root.firstChild);
      }
    };

//#JSCOVERAGE_IF
    if (document.attachEvent) {
      var html = (
        '<iframe' +
          ' id="' + opts.id + '"' +
          ' name="' + opts.name + '"' +
          (opts.className ? ' class="' + opts.className + '"' : '') +
          ' style="border:none;' +
                  (opts.width ? 'width:' + opts.width + 'px;' : '') +
                  (opts.height ? 'height:' + opts.height + 'px;' : '') +
                  '"' +
          ' src="' + opts.url + '"' +
          ' frameborder="0"' +
          ' scrolling="no"' +
          ' allowtransparency="true"' +
          ' onload="FB.Content._callbacks.' + guid + '()"' +
        '></iframe>'
      );

      // There is an IE bug with iframe caching that we have to work around. We
      // need to load a dummy iframe to consume the initial cache stream. The
      // setTimeout actually sets the content to the HTML we created above, and
      // because its the second load, we no longer suffer from cache sickness.
      // It must be javascript:false instead of about:blank, otherwise IE6 will
      // complain in https.
      // Since javascript:false actually result in an iframe containing the
      // string 'false', we set the iframe height to 1px so that it gets loaded
      // but stays invisible.
      opts.root.innerHTML = '<iframe src="javascript:false"'+
                            ' frameborder="0"'+
                            ' scrolling="no"'+
                            ' style="height:1px"></iframe>';

      // Now we'll be setting the real src.
      srcSet = true;

      // You may wonder why this is a setTimeout. Read the IE source if you can
      // somehow get your hands on it, and tell me if you figure it out. This
      // is a continuation of the above trick which apparently does not work if
      // the innerHTML is changed right away. We need to break apart the two
      // with this setTimeout 0 which seems to fix the issue.
      window.setTimeout(function() {
        opts.root.innerHTML = html;
      }, 0);
    } else {
      // This block works for all non IE browsers. But it's specifically
      // designed for FF where we need to set the src after inserting the
      // iframe node into the DOM to prevent cache issues.
      var node = document.createElement('iframe');
      node.id = opts.id;
      node.name = opts.name;
      node.onload = FB.Content._callbacks[guid];
      node.style.border = 'none';
      node.style.overflow = 'hidden';
      if (opts.className) {
        node.className = opts.className;
      }
      if (opts.height) {
        node.style.height = opts.height + 'px';
      }
      if (opts.width) {
        node.style.width = opts.width + 'px';
      }
      opts.root.appendChild(node);

      // Now we'll be setting the real src.
      srcSet = true;

      node.src = opts.url;
    }
  },

  /**
   * Dynamically generate a <form> and POST it to the given target.
   *
   * The opts MUST contain:
   *   url     String  action URL for the form
   *   target  String  the target for the form
   *   params  Object  the key/values to be used as POST input
   *
   * @access protected
   * @param opts {Object} the options
   */
  postTarget: function(opts) {
    var form = document.createElement('form');
    form.action = opts.url;
    form.target = opts.target;
    form.method = 'POST';
    FB.Content.appendHidden(form);

    FB.Array.forEach(opts.params, function(val, key) {
      if (val !== null && val !== undefined) {
        var input = document.createElement('input');
        input.name = key;
        input.value = val;
        form.appendChild(input);
      }
    });

    form.submit();
    form.parentNode.removeChild(form);
  }
});
