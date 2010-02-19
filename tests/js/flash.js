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
 * @provides fb.tests.flash
 * @requires fb.tests.qunit
 *           fb.flash
 */
////////////////////////////////////////////////////////////////////////////////
module('flash');
////////////////////////////////////////////////////////////////////////////////

test(
  'flash has minimum version',

  function() {
    ok(FB.Flash.hasMinVersion(), 'should have minimum flash version');
  }
);

test(
  'flash ready callback',

  function() {
    ok(!document.XdComm, 'should not have already initialized flash');

    FB.Flash.onReady(function() {
      ok(true, 'got the first onReady callback');
      FB.Flash.onReady(function() {
        ok(true, 'got the second onReady callback');
        start();
      });
    });

    expect(3);
    stop();
  }
);
