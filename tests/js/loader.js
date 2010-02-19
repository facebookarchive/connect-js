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
 * @provides fb.tests.loader
 * @requires fb.tests.qunit
 *           fb.loader
 */
////////////////////////////////////////////////////////////////////////////////
module('loader');
////////////////////////////////////////////////////////////////////////////////

test(
  'Load a single component',

  function() {
    ok(!FB.Loader._check('FB.test-component'), '_check is false');

    FB.Loader.use('FB.test-component',
                  function() {
                    ok(true, "component loaded");
                  });

    // todo: assert that the <script> tag was inserted

    // this function will be called when the script file is included
    FB.Component.onScriptLoaded(['FB.test-component']);

    ok(FB.Loader._check('FB.test-component'), '_check is true');

    // test it again now that it's loaded
    FB.Loader.use('FB.test-component',
                  function() {
                    ok(true, "component loaded");
                  });

    }
  );

