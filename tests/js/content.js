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
 * @provides fb.tests.content
 * @requires fb.tests.qunit
 *           fb.content
 */
////////////////////////////////////////////////////////////////////////////////
module('content');
////////////////////////////////////////////////////////////////////////////////

test(
  'error if fb-root is missing',

  function() {
    expect(3);

    var fbRoot = document.getElementById('fb-root');
    fbRoot.id = 'not-fb-root';
    var logCb = function(msg) {
      ok(msg == 'The "fb-root" div has not been created.',
         'got a log message that the root was not found.');
    };
    FB.Event.subscribe('fb.log', logCb);
    var html = '<div id="test-div">test div</div>';
    var div = FB.Content.append(html);
    ok(!div, 'div was not inserted');
    ok(!document.getElementById('test-div'), 'expect it to not be in the DOM');
    FB.Event.unsubscribe('fb.log', logCb);
    // put it back
    fbRoot.id = 'fb-root';
  }
);

test(
  'append some HTML markup',

  function() {
    var html = '<div id="test-div">test div</div>';
    var div = FB.Content.append(html);
    ok(div.firstChild.id == 'test-div',
       'expect the correct id back in the first child');
    ok(document.getElementById('test-div'), 'expect it to be in the DOM');
    ok(document.getElementById('test-div').innerHTML == 'test div',
       'expect the correct inner html');
    div.parentNode.removeChild(div);
  }
);

test(
  'append a node',

  function() {
    var div = document.createElement('div');
    div.id = 'test-div';
    div.innerHTML = 'test div';
    var returnedDiv = FB.Content.append(div);
    ok(returnedDiv.id == 'test-div', 'expect the correct id back');
    ok(document.getElementById('test-div'), 'expect it to be in the DOM');
    ok(document.getElementById('test-div').innerHTML == 'test div',
       'expect the correct inner html');
    returnedDiv.parentNode.removeChild(returnedDiv);
  }
);

test(
  'append a node with custom root',

  function() {
    var root = document.createElement('div');
    var div = document.createElement('div');
    div.id = 'test-div';
    div.innerHTML = 'test div';
    var returnedDiv = FB.Content.append(div, root);
    ok(returnedDiv.id == 'test-div', 'expect the correct id back');
    ok(root.firstChild.id == 'test-div',
       'expect the correct id back in the firstChild');
  }
);

test(
  'append some hidden HTML markup',

  function() {
    var html = '<div id="test-div">test div</div>';
    var div = FB.Content.appendHidden(html);
    ok(div.firstChild.id == 'test-div',
       'expect the correct id back in the first child');
    ok(document.getElementById('test-div'), 'expect it to be in the DOM');
    ok(document.getElementById('test-div').innerHTML == 'test div',
       'expect the correct inner html');
    div.parentNode.removeChild(div);
  }
);

test(
  'iframe onload handler',

  function() {
    expect(1);
    stop();

    // url doesnt really matter as long as the host will respond
    FB.Content.insertIframe({
      url: 'http://static.ak.fbcdn.net/connect/xd_proxy.php',
      root: FB.Content.appendHidden(''),
      onload: function(node) {
        ok(true, 'onload callback was invoked');
        node.parentNode.removeChild(node);
        start();
      }
    });
  }
);

test(
  'iframe options',

  function() {
    expect(5);
    stop();

    // url doesnt really matter as long as the host will respond
    var opts = {
      url: 'http://static.ak.fbcdn.net/connect/xd_proxy.php',
      height: 100,
      width: 100,
      id: 'my-id',
      name: 'my-name',
      className: 'my-class',
      root: FB.Content.appendHidden(''),
      onload: function(node) {
        equals(node.style.height, opts.height + 'px', 'got expected height');
        equals(node.style.width, opts.width + 'px', 'got expected width');
        equals(node.id, opts.id, 'got expected id');
        equals(node.name, opts.name, 'got expected name');
        equals(node.className, opts.className, 'got expected className');
        node.parentNode.removeChild(node);
        start();
      }
    };
    FB.Content.insertIframe(opts);
  }
);
