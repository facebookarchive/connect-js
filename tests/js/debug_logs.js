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
 * @provides fb.tests.debuglogs
 * @requires fb.tests.qunit
 *           fb.init
 */
// sets up a one time expected log call
var expectLog = function(expectMsg) {
  var cb = function(gotMsg) {
    ok(gotMsg == expectMsg, 'got expected log message');
    FB.Event.unsubscribe('fb.log', cb);
    start();
  };
  FB.Event.subscribe('fb.log', cb);
};

////////////////////////////////////////////////////////////////////////////////
module('debug logging');
////////////////////////////////////////////////////////////////////////////////
test(
  'FB.getLoginStatus without api key',

  function() {
    expect(1);
    stop();
    expectLog('FB.getLoginStatus() called before calling FB.init().');
    FB.getLoginStatus();
  }
);

test(
  'FB.login without api key',

  function() {
    expect(1);
    stop();
    expectLog('FB.login() called before calling FB.init().');
    FB.login();
  }
);

test(
  'FB.logout without api key',

  function() {
    expect(1);
    stop();
    expectLog('FB.logout() called before calling FB.init().');
    FB.logout();
  }
);

test(
  'FB.logout with api key but without session',

  function() {
    expect(1);
    stop();
    var oldApiKey = FB._apiKey;
    var oldSession = FB._session;
    FB._apiKey = 'dummy';
    FB._session = null;
    expectLog('FB.logout() called without a session.');
    FB.logout();
    FB._apiKey = oldApiKey;
    FB._session = oldSession;
  }
);
