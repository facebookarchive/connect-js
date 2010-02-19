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
 * @provides fb.tests.type
 * @requires fb.tests.qunit
 *           fb.type
 */
////////////////////////////////////////////////////////////////////////////////
module('type');
////////////////////////////////////////////////////////////////////////////////

test(
  'FB.bind',

  function() {
    var x = {context: 'value'};
    expect(2);
    FB.bind(function() {
              equals(this.context, "value");
            }, x)();
    FB.bind(function(arg) {
              equals(arg, 42);
            }, x, 42)();
  });

test(
  'type: classes, subclasses, type',

  function() {
    expect(13);

    var classDef =
      FB.Class("Test",
             function(x) {
               equals(x, "constructor");
             }, {
               test: function(x) {
                 equals(x, 42, "FB.Test.test ran");
               }
             });

    equals(FB.CLASSES.Test, classDef);
    var c = new FB.Test("constructor");
    c.test(42);

    var subClassDef =
      FB.subclass("SubclassTest", "Test",
                function(x) {
                  equals(x, "subconstructor");
                  this._base("constructor");
                },
                {
                  test: function(x) {
                    equals(x, 39, "subclass is 39 not 42");
                    this._callBase("test", 42);
                  }
                  });

    var s = new FB.SubclassTest("subconstructor");
    s.test(39);

    ok(FB.Type.isType(c, FB.Test),          "class is its own type");
    ok(FB.Type.isType(s, FB.SubclassTest),  "subclass is its own type");
    ok(FB.Type.isType(s, FB.Test),          "child is one of parent type");
    ok(!FB.Type.isType(c, FB.SubclassTest), "not the parent though" );

    equals(FB.Class("Test"), classDef);
    equals(FB.subclass("SubclassTest", "Test"), subClassDef);
  });
