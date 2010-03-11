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
 * @provides fb.tests.dialog
 * @requires fb.tests.qunit
 *           fb.dialog
 */
////////////////////////////////////////////////////////////////////////////////
module('dialog');
////////////////////////////////////////////////////////////////////////////////

test(
  'show and hide loader',

  function() {
    ok(!FB.Dialog._loaderEl, 'no loader element');
    FB.Dialog._showLoader();
    equals(FB.Dialog._loaderEl, FB.Dialog._active, 'loader showing');
    var el = FB.Dialog._loaderEl;
    ok(FB.Dialog._loaderEl, 'loader element');
    FB.Dialog._showLoader();
    equals(FB.Dialog._loaderEl, FB.Dialog._active, 'loader still showing');
    ok(FB.Dialog._loaderEl == el, 'loader element still the same');
    FB.Dialog._hideLoader();
    ok(FB.Dialog._loaderEl.style.top == '-10000px', 'loader top is -10000px');
  }
);

test(
  'find dialog root',

  function() {
    expect(1);
    var node = FB.Dialog.create();
    var root = FB.Dialog._findRoot(node);
    while (node) {
      if (node == root) {
        ok(true, 'found parent root node');
        FB.Dialog.remove(root);
      }
      node = node.parentNode;
    }
  }
);

test(
  'create hidden dialog',

  function() {
    var node = FB.Dialog.create();
    var root = FB.Dialog._findRoot(node);
    equals(root.style.top, '', 'expect no element level top value');
    FB.Dialog.remove(root);
  }
);

test(
  'create visible dialog',

  function() {
    var node = FB.Dialog.create({ visible: true });
    var root = FB.Dialog._findRoot(node);
    ok(root.style.top != '-10000px', 'dialog should be visible');
    FB.Dialog.remove(root);
  }
);

test(
  'create hidden dialog with loader',

  function() {
    var node = FB.Dialog.create({ loader: true });
    var root = FB.Dialog._findRoot(node);
    equals(FB.Dialog._loaderEl, FB.Dialog._active, 'loader showing');
    equals(root.style.top, '', 'dialog should be hidden');
    FB.Dialog.remove(root);
    FB.Dialog._hideLoader();
  }
);

test(
  'dialog onClose with loader',

  function() {
    expect(1);
    stop();

    var node = FB.Dialog.create({
      loader: true,
      onClose: function() {
        ok(true, 'onClose called');
        FB.Dialog.remove(node);
        start();
      }
    });
    var loaderClose = FB.$('fb_dialog_loader_close');
    loaderClose.onclick();
  }
);

test(
  'dialog onClose with close icon',

  function() {
    expect(2);
    stop();

    var node = FB.Dialog.create({
      closeIcon: true,
      onClose: function() {
        ok(true, 'onClose called');
        FB.Dialog.remove(node);
        start();
      }
    });
    var root = FB.Dialog._findRoot(node);
    equals(root.firstChild.className, 'fb_dialog_close_icon',
           'expect close icon');
    root.firstChild.onclick();
  }
);

test(
  'stacked dialogs',

  function() {
    var d1 = FB.Dialog.create({ visible: true });
    var r1 = FB.Dialog._findRoot(d1);
    equals(FB.Dialog._active, r1, 'expect first dialog to be active');
    equals(FB.Dialog._stack.length, 1, 'expect one dialog in stack');

    var d2 = FB.Dialog.create({ visible: true });
    var r2 = FB.Dialog._findRoot(d2);
    equals(FB.Dialog._active, r2, 'expect second dialog to be active');
    equals(FB.Dialog._stack.length, 2, 'expect two dialogs in stack');

    FB.Dialog.remove(r2);
    equals(FB.Dialog._active, r1, 'expect first dialog to be active');
    equals(FB.Dialog._stack.length, 1, 'expect one dialog in stack');

    FB.Dialog.remove(r1);
    equals(FB.Dialog._active, null, 'expect no dialog to be active');
    equals(FB.Dialog._stack.length, 0, 'expect no dialogs in stack');
  }
);

test(
  'remove inactive stacked dialog',

  function() {
    var d1 = FB.Dialog.create({ visible: true });
    var r1 = FB.Dialog._findRoot(d1);
    equals(FB.Dialog._active, r1, 'expect first dialog to be active');
    equals(FB.Dialog._stack.length, 1, 'expect one dialog in stack');

    var d2 = FB.Dialog.create({ visible: true });
    var r2 = FB.Dialog._findRoot(d2);
    equals(FB.Dialog._active, r2, 'expect second dialog to be active');
    equals(FB.Dialog._stack.length, 2, 'expect two dialogs in stack');

    FB.Dialog.remove(r1);
    equals(FB.Dialog._active, r2, 'expect second dialog to be active');
    equals(FB.Dialog._stack.length, 1, 'expect one dialog in stack');

    FB.Dialog.remove(r2);
    equals(FB.Dialog._active, null, 'expect no dialog to be active');
    equals(FB.Dialog._stack.length, 0, 'expect no dialogs in stack');
  }
);
