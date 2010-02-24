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
 * @provides fb.tests.dom
 * @requires fb.tests.qunit
 *           fb.dom
 */
////////////////////////////////////////////////////////////////////////////////
module('dom');
////////////////////////////////////////////////////////////////////////////////

test(
  'containsCss',

  function() {
    var el = document.createElement('div');
    el.className = 'test1';
    ok(FB.Dom.containsCss(el, 'test1'), 'should have "test1" class');
    ok(!FB.Dom.containsCss(el, 'test2'), 'should not have "test2" class');
  }
);

test(
  'addCss',

  function() {
    var el = document.createElement('div');
    ok(!FB.Dom.containsCss(el, 'test1'), 'should not have "test1" class');
    FB.Dom.addCss(el, 'test1');
    ok(FB.Dom.containsCss(el, 'test1'), 'should have "test1" class');
  }
);

test(
  'removeCss',

  function() {
    var el = document.createElement('div');
    ok(!FB.Dom.containsCss(el, 'test1'), 'should not have "test1" class');
    FB.Dom.addCss(el, 'test1');
    ok(FB.Dom.containsCss(el, 'test1'), 'should have "test1" class');
    FB.Dom.removeCss(el, 'test1');
    ok(!FB.Dom.containsCss(el, 'test1'), 'should not have "test1" class');
  }
);

test(
  'addCssRules',

  function() {
    var id = 'my-css';
    FB.Dom.addCssRules('#id { color: #fff; }', [id]);
    ok(FB.Dom._cssRules[id], 'expect it to be set');
    FB.Dom.addCssRules('#id { color: #fff; }', [id]);
    ok(FB.Dom._cssRules[id], 'expect it to be set');
  }
);
