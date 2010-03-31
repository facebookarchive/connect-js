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
 * @provides fb.tests.xfbmltagswithsession
 * @requires fb.tests.qunit
 *           fb.xfbml
 *           fb.tests.xfbmltest
 */
////////////////////////////////////////////////////////////////////////////////
module('xfbmltagswithsession');
////////////////////////////////////////////////////////////////////////////////

test(
  'fb:connectbar',

  function() {
    XTest.expect(1);
    FB.login(function(response) {
      XTest.regex(
        '<fb:connect-bar></fb:connect-bar>',
        'fb_connect_bar_container'
      );
    });
  }
);
