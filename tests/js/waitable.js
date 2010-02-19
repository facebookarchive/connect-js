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
 * @provides fb.tests.waitable
 * @requires fb.tests.qunit
 *           fb.waitable
 */
////////////////////////////////////////////////////////////////////////////////
module('waitable');
////////////////////////////////////////////////////////////////////////////////

test(
  'FB.Waitable',

  function() {
    var w = new FB.Waitable();
    w.wait(function(x) {
             equals(x, 42);
           });

    expect(1);
    w.set(42);

    // this should not fire callback, value already set
    w.set(64);
  });
