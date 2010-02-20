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
 * @provides fb.tests.string
 * @requires fb.tests.qunit
 *           fb.string
 */
////////////////////////////////////////////////////////////////////////////////
module('string');
////////////////////////////////////////////////////////////////////////////////

test(
  'FB.String.trim',

  function() {
    equals('abc', FB.String.trim(' abc'), 'removes prefix whitespace');
    equals('abc', FB.String.trim('abc '), 'removes suffix whitespace');
    equals('abc', FB.String.trim(' abc '), 'removes prefix & suffix whitespace');
    equals('abc', FB.String.trim('  abc  '), 'removes multiple whitespace');
  }
);

test(
  'FB.String.format',

  function() {
    equals('hello world', FB.String.format('{0} {1}', 'hello', 'world'),
           'expect formatted string');
  }
);

test(
  'FB.String.quote',

  function() {
    equals('"\\""', FB.String.quote('"'), 'expect quoted string');
    equals('"\\u009f"', FB.String.quote('\x9f'), 'expect quoted string');
  }
);
