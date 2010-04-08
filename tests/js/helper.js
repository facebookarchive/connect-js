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
 * @provides fb.tests.helper
 * @requires fb.tests.qunit
 *           fb.helper
 */
////////////////////////////////////////////////////////////////////////////////
module('helper');
////////////////////////////////////////////////////////////////////////////////

test(
  'invokeHandler string eval',

  function() {
    expect(1);
    stop();

    window.testInvokeHandler = function() {
      ok(true, 'handler invoked');
      start();
    };
    FB.Helper.invokeHandler('testInvokeHandler()');
  }
);

test(
  'invokeHandler function value',

  function() {
    expect(1);
    stop();

    var f = function() {
      ok(true, 'handler invoked');
      start();
    };
    FB.Helper.invokeHandler(f);
  }
);

test(
  'invokeHandler number/object ignored',

  function() {
    FB.Helper.invokeHandler(6);
    FB.Helper.invokeHandler({});
    ok(true, 'no failures');
  }
);
