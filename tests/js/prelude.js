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
 * @provides fb.tests.prelude
 * @requires fb.tests.qunit
 *           fb.prelude
 */
////////////////////////////////////////////////////////////////////////////////
module('prelude');
////////////////////////////////////////////////////////////////////////////////

test(
  'copy to object',

  function() {
    var target = {};
    FB.copy(target, {
      answer: 42
    });
    ok(target.answer == 42, 'expect the answer');
  }
);

test(
  'copy to object ignore prototype',

  function() {
    var target = {};
    var source = function() {};
    source.prototype.wrongAnswer = 0;
    var sourceInstance = new source();
    sourceInstance.answer = 42;
    FB.copy(target, sourceInstance);
    ok(target.answer == 42, 'expect the answer');
    ok(!target.wrongAnswer, 'expect no wrong answer');
  }
);

test(
  'copy to object overwrite',

  function() {
    var target = { the: 42 };
    FB.copy(target, {
      answer: 42,
      the: 0
    });
    ok(target.answer == 42, 'expect 42');
    ok(target.the == 42, 'expect old value 42');

    FB.copy(target, { the: 0 }, true);
    ok(target.the == 0, 'expect new value 0');
  }
);

test(
  'copy for modules',

  function() {
    ok(!FB.TestModule, 'module must not exist');
    FB.provide('TestModule', { answer: 42 });
    ok(FB.TestModule.answer == 42, 'expect the new named value');
    delete FB.TestModule;
  }
);

test(
  'guids are not equal',

  function() {
    ok(FB.guid() != FB.guid(), 'wonder what the odds of this failing are');
  }
);

test(
  'getElementById FB.$',
  function() {
    var element = FB.$('qunit-header-wrong-id');
    equals(element, null, 'expect null');
    element = FB.$('qunit-header');
    ok (element != null, 'element should not be null anymore');
  }
);

