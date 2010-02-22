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
 * @provides fb.tests.array
 * @requires fb.tests.qunit
 *           fb.array
 */
////////////////////////////////////////////////////////////////////////////////
module('array');
////////////////////////////////////////////////////////////////////////////////

test(
  'FB.Array.keys',

  function() {
    same(['a', 'b', 'c'],
         FB.Array.keys({a: 1, b: 2, c: 3}),
         "basic array");

    same([], FB.Array.keys({}), "empty array");
  });

test(
  'FB.Array.indexOf',

  function() {
    var a = [0, "b", null, "a", "b"];

    equals(FB.Array.indexOf(a, 0), 0, "find the 0");
    equals(FB.Array.indexOf(a, "b"), 1, "find the first b");
    equals(FB.Array.indexOf(a, null), 2, "null value found");
    equals(FB.Array.indexOf(a, "a"), 3, "single characer");
    equals(FB.Array.indexOf(a, "c"), -1, "char not found");

    // check that it works even when indexOf is not present
    Array.prototype.indexOf = undefined;
    equals(FB.Array.indexOf(a, "b"), 1, "find the first b");
  });

test(
  'FB.Array.merge',

  function() {
    var a = ['a', 'b', 'a'];
    same(FB.Array.merge(a, ['c']),
         ['a', 'b', 'a', 'c'],
         "tack a new char to the end");
    same(a, ['a', 'b', 'a', 'c'],
        "modified by reference");

    same(FB.Array.merge(a, ['b']), a,
        "already existing");
    same(FB.Array.merge(a, ['a']), a,
         "doubly existing");

  });

test(
  'FB.Array.map',

  function() {
    var a = ['apples', 'oranges'];

    same(FB.Array.map(a, function(x) {
                           return x.toUpperCase();
                         }),
         ["APPLES", "ORANGES"]);
  });

test(
  'FB.Array.filter',

  function() {
    var a = ['apples', 'oranges', 'carrots', 'cucumbers'];

    same(FB.Array.filter(a,
                         function(x) {
                           return (x.substr(0,1) == 'c');
                         }),
         ['carrots', 'cucumbers']);
  });

test(
  'FB.Array forEach array',
  function() {
    var a = [1,2,3];
    var c = 0;
    FB.Array.forEach(a, function(v) {
      c += v;
    });

    equals(c, 6, 'expect the answer');
  }
);

test(
  'FB.Array forEach dict',
  function() {
    var d = {a:1, b:2, c:3};
    var results=[];
    FB.Array.forEach(d, function(v, k) {
      results.push(k);
      results.push(v);
    });

    var s = results.join(',');
    equals(s, 'a,1,b,2,c,3', 'expect the answer');
  }
);

test(
  'FB.Array forEach DOM collection',
  function() {
    FB.Array.forEach(document.getElementsByTagName('title'), function(v) {
      equals(v.innerHTML, 'Mu Tests', 'expect the title back');
    });
  }
);
