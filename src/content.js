/**
 * @module FB
 * @provides mu.content
 * @requires mu.prelude
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
   * @returns {Node} the node that was just appended
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
   * @returns {Node} the node that was just appended
   */
  hidden: function(content) {
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
   * @param content {String|Node} a DOM Node or HTML string
   * @param root    {Node}        node to insert the iframe into
   * @param onload  {Function}    optional onload callback
   * @param extra   {String}      optional extra attributes string for the tag
   * @returns {Node} the node that was just appended
   */
  iframe: function(url, root, onload, extra) {
    var
      guid = FB.guid(),
      html = (
        '<iframe ' + (extra || '') +
          ' src="' + url + '"' +
          ' onload="FB.Content._callbacks.' + guid + '()"' +
        '></iframe>'
      ),
      div = FB.Content.append('', root);

    FB.Content._callbacks[guid] = function() {
      onload && onload(div.firstChild);
      delete FB.Content._callbacks[guid];
    };

    // There is an IE bug with iframe caching that we have to work around: We
    // need to load a dummy iframe to consume the initial cache stream.  The
    // setTimeout the actually sets the content to the HTML we created above,
    // and because its the second load, we no longer suffer from cache
    // sickness. It must be javascript:false instead of about:blank, otherwise
    // IE6 will complain in https.
    if (document.attachEvent) {
      div.innerHTML = '<iframe src="javascript:false"></iframe>';
    }

    // you may wonder why this is a setTimeout. read the IE source if you can
    // somehow get your hands on it, and tell me if you figure it out. this is
    // a continuation of the above trick which apparently does not work if the
    // innerHTML is changed right away. we need to break apart the two with
    // this setTimeout 0 which seems to fix the issue.
    window.setTimeout(function() {
      div.innerHTML = html;
    }, 0);
  }
});
