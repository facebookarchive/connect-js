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
 * @provides fb.tests.edgewidget
 * @requires fb.tests.qunit
 *           fb.xfbml.edgewidget
 *           fb.content
 */
////////////////////////////////////////////////////////////////////////////////
module('edge widget');
////////////////////////////////////////////////////////////////////////////////

test(
  'edge widget inline event handler',

  function() {
    expect(1);
    stop();
    action.innerHTML = 'First, click the like button (relike if necessary)';

    var
      href      = 'http://fbrell.com/',
      container = FB.Content.append(
        '<fb:like oncreate="testInvokeHandler()" ' +
        'id="edge-dynamic" href="' + href + '"></fb:like>');
    window.testInvokeHandler = function() {
      ok(true, 'handler invoked');
      container.parentNode.removeChild(container);
      delete window.testInvokeHandler;
      action.innerHTML = '';
      start();
    };
    FB.XFBML.parse(container);
  }
);

test(
  'edge widget dynamic event handler',

  function() {
    expect(1);
    stop();
    action.innerHTML = 'Second, click the like button (relike if necessary)';

    var
      href      = 'http://fbrell.com/examples',
      container = FB.Content.append(
        '<fb:like id="edge-dynamic" href="' + href + '"></fb:like>');
    FB.XFBML.parse(container);
    var widget = document.getElementById('edge-dynamic')._element;
    widget.subscribe('edge.create', function(hrefGiven) {
      equals(hrefGiven, href, 'got expected href');
      container.parentNode.removeChild(container);
      action.innerHTML = '';
      start();
    });
  }
);

test(
  'edge widget global event handler',

  function() {
    expect(1);
    stop();
    action.innerHTML = 'Third, click the like button (relike if necessary)';

    var
      href      = 'http://fbrell.com/examples',
      container = FB.Content.append('<fb:like href="' + href + '"></fb:like>');
    FB.XFBML.parse(container);
    FB.Event.subscribe('edge.create', function(hrefGiven) {
      equals(hrefGiven, href, 'got expected href');
      container.parentNode.removeChild(container);
      action.innerHTML = '';
      start();
    });
  }
);
