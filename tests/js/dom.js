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

test(
  'getStyle',

  function() {
    var el = document.createElement('div');
    el.id = 'chocolateTacosForeverMan';
    FB.Dom.addCssRules(
      '#chocolateTacosForeverMan { color: white; min-width: 100px; opacity: 50; -moz-opacity: 0.5; filters: alpha(50); margin: 10px; }',
      ['chocolateTacosForeverMan']
    );
    document.body.appendChild(el);
    var minWidth = FB.Dom.getStyle(el, 'minWidth');
    var min_width = FB.Dom.getStyle(el, 'min-width');
    var color = FB.Dom.getStyle(el, 'color');
    var margin = FB.Dom.getStyle(el, 'marginTop');
    ok(minWidth, 'expect a value to be returned');
    ok(minWidth == '100px', 'expect min-width to be 100px: ' + minWidth);
    ok(minWidth == min_width,
       'expect both method camelCase and dash-case to work');
    ok(color == 'rgb(255, 255, 255)' || color == '#fff' || color == 'white',
       'expect color to be white: ' + color);
    ok(margin == '10px', 'expect top-margin to be 10px: ' + margin);
    // TODO(alpjor) readd once getStyle supports opacity
    //ok(FB.Dom.getStyle(el, 'opacity') == '50', 'expect value to be 50');
    el.parentNode.removeChild(el);
  }
);
