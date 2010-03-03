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
 * @provides fb.tests.json
 * @requires fb.tests.qunit
 *           fb.json
 */
////////////////////////////////////////////////////////////////////////////////
module('json');
////////////////////////////////////////////////////////////////////////////////

test(
  'json flatten',

  function() {
    same(
      FB.JSON.flatten({ a: 1, b: 'two', c: [1,2,3], d: {e:1,f:2} }),
      { a: '1', b: 'two', c: '[1,2,3]', d: '{"e":1,"f":2}' },
      'expect encoded bits'
    );
  }
);
