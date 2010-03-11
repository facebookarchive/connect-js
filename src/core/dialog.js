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
 * @provides fb.dialog
 * @requires fb.prelude
 *           fb.intl
 *           fb.array
 *           fb.content
 *           fb.dom
 *           fb.css.dialog
 */

/**
 * Dialog creation and management.
 *
 * @class FB.Dialog
 * @static
 * @private
 */
FB.provide('Dialog', {
  /**
   * The loader element.
   *
   * @access private
   * @type DOMElement
   */
  _loaderEl: null,

  /**
   * The stack of active dialogs.
   *
   * @access private
   * @type Array
   */
  _stack: [],

  /**
   * The currently visible dialog.
   *
   * @access private
   * @type DOMElement
   */
  _active: null,

  /**
   * Find the root dialog node for a given element. This will walk up the DOM
   * tree and while a node exists it will check to see if has the fb_dialog
   * class and if it does returns it.
   *
   * @access private
   * @param node {DOMElement} a child node of the dialog
   * @return {DOMElement} the root dialog element if found
   */
  _findRoot: function(node) {
    while (node) {
      if (FB.Dom.containsCss(node, 'fb_dialog')) {
        return node;
      }
      node = node.parentNode;
    }
  },

  /**
   * Show the "Loading..." dialog. This is a special dialog which does not
   * follow the standard stacking semantics. If a callback is provided, a
   * cancel action is provided using the "X" icon.
   *
   * @access private
   * @param cb {Function} optional callback for the "X" action
   */
  _showLoader: function(cb) {
    if (!FB.Dialog._loaderEl) {
      FB.Dialog._loaderEl = FB.Dialog._findRoot(FB.Dialog.create({
        content: (
          '<div class="fb_dialog_loader">' +
            FB.Intl.tx('sh:loading') +
            '<a id="fb_dialog_loader_close"></a>' +
          '</div>'
        )
      }));
    }

    // this needs to be done for each invocation of _showLoader. since we don't
    // stack loaders and instead simply hold on to the last one, it is possible
    // that we are showing nothing when we can potentially be showing the
    // loading dialog for a previously activated but not yet loaded dialog.
    var loaderClose = FB.$('fb_dialog_loader_close');
    if (cb) {
      FB.Dom.removeCss(loaderClose, 'fb_hidden');
      loaderClose.onclick = function() {
        FB.Dialog._hideLoader();
        cb();
      };
    } else {
      FB.Dom.addCss(loaderClose, 'fb_hidden');
      loaderClose.onclick = null;
    }

    FB.Dialog._makeActive(FB.Dialog._loaderEl);
  },

  /**
   * Hide the loading dialog if one is being shown.
   *
   * @access private
   */
  _hideLoader: function() {
    if (FB.Dialog._loaderEl && FB.Dialog._loaderEl == FB.Dialog._active) {
      FB.Dialog._loaderEl.style.top = '-10000px';
    }
  },

  /**
   * Center a dialog based on its current dimensions and place it in the
   * visible viewport area.
   *
   * @access private
   * @param el {DOMElement} the dialog node
   */
  _makeActive: function(el) {
    FB.Dialog._lowerActive();
    var
      dialog = {
        width  : parseInt(el.offsetWidth, 10),
        height : parseInt(el.offsetHeight, 10)
      },
      view   = FB.Dom.getViewportInfo(),
      left   = (view.scrollLeft + (view.width - dialog.width) / 2),
      top    = (view.scrollTop + (view.height - dialog.height) / 2.5);
    el.style.left = (left > 0 ? left : 0) + 'px';
    el.style.top = (top > 0 ? top : 0) + 'px';
    FB.Dialog._active = el;
  },

  /**
   * Lower the current active dialog if there is one.
   *
   * @access private
   * @param node {DOMElement} the dialog node
   */
  _lowerActive: function() {
    if (!FB.Dialog._active) {
      return;
    }
    FB.Dialog._active.style.top = '-10000px';
    FB.Dialog._active = null;
  },

  /**
   * Remove the dialog from the stack.
   *
   * @access private
   * @param node {DOMElement} the dialog node
   */
  _removeStacked: function(dialog) {
    FB.Dialog._stack = FB.Array.filter(FB.Dialog._stack, function(node) {
      return node != dialog;
    });
  },

  /**
   * Create a dialog. Returns the node of the dialog within which the caller
   * can inject markup. Optional HTML string or a DOMElement can be passed in
   * to be set as the content. Note, the dialog is hidden by default.
   *
   * @access protected
   * @param opts {Object} Options:
   * Property  | Type              | Description                       | Default
   * --------- | ----------------- | --------------------------------- | -------
   * content   | String|DOMElement | HTML String or DOMElement         |
   * loader    | Boolean           | `true` to show the loader dialog  | `false`
   * onClose   | Boolean           | callback if closed                |
   * closeIcon | Boolean           | `true` to show close icon         | `false`
   * visible   | Boolean           | `true` to make visible            | `false`
   *
   * @return {DOMElement} the dialog content root
   */
  create: function(opts) {
    opts = opts || {};
    if (opts.loader) {
      FB.Dialog._showLoader(opts.onClose);
    }

    var
      dialog      = document.createElement('div'),
      contentRoot = document.createElement('div'),
      className   = 'fb_dialog';

    // optional close icon
    if (opts.closeIcon && opts.onClose) {
      var closeIcon = document.createElement('a');
      closeIcon.className = 'fb_dialog_close_icon';
      closeIcon.onclick = opts.onClose;
      dialog.appendChild(closeIcon);
    }

    // handle rounded corners j0nx
//#JSCOVERAGE_IF
    if (FB.Dom.getBrowserType() == 'ie') {
      className += ' fb_dialog_legacy';
      FB.Array.forEach(
        [
          'vert_left',
          'vert_right',
          'horiz_top',
          'horiz_bottom',
          'top_left',
          'top_right',
          'bottom_left',
          'bottom_right'
        ],
        function(name) {
          var span = document.createElement('span');
          span.className = 'fb_dialog_' + name;
          dialog.appendChild(span);
        }
      );
    } else {
      className += ' fb_dialog_advanced';
    }

    if (opts.content) {
      FB.Content.append(opts.content, contentRoot);
    }

    dialog.className = className;
    contentRoot.className = 'fb_dialog_content';

    dialog.appendChild(contentRoot);
    FB.Content.append(dialog);

    if (opts.visible) {
      FB.Dialog.show(dialog);
    }

    return contentRoot;
  },

  /**
   * Raises the given dialog. Any active dialogs are automatically lowered. An
   * active loading indicator is suppressed. An already-lowered dialog will be
   * raised and it will be put at the top of the stack. A dialog never shown
   * before will be added to the top of the stack.
   *
   * @access protected
   * @param dialog {DOMElement} a child element of the dialog
   */
  show: function(dialog) {
    dialog = FB.Dialog._findRoot(dialog);
    if (dialog) {
      FB.Dialog._removeStacked(dialog);
      FB.Dialog._hideLoader();
      FB.Dialog._makeActive(dialog);
      FB.Dialog._stack.push(dialog);
    }
  },

  /**
   * Remove the dialog, show any stacked dialogs.
   *
   * @access protected
   * @param dialog {DOMElement} a child element of the dialog
   */
  remove: function(dialog) {
    dialog = FB.Dialog._findRoot(dialog);
    if (dialog) {
      var is_active = FB.Dialog._active == dialog;
      FB.Dialog._removeStacked(dialog);
      if (is_active) {
        if (FB.Dialog._stack.length > 0) {
          FB.Dialog.show(FB.Dialog._stack.pop());
        } else {
          FB.Dialog._lowerActive();
        }
      }

      // wait before the actual removal because of race conditions with async
      // flash crap. seriously, dont ever ask me about it.
      // if we remove this without deferring, then in IE only, we'll get an
      // uncatchable error with no line numbers, function names, or stack
      // traces. the 3 second delay isn't a problem because the <div> is
      // already hidden, it's just not removed from the DOM yet.
      window.setTimeout(function() {
        dialog.parentNode.removeChild(dialog);
      }, 3000);
    }
  }
});
