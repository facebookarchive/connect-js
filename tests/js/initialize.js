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
 * @provides fb.tests.initialize
 * @requires fb.tests.qunit
 *           fb.init
 */
var API_KEY = '48f06bc570aaf9ed454699ec4fe416df';
var EXPIRED_SESSION = {
  session_key : "5070653ddbe6a2efbfb23388-499433185",
  uid         : 499433185,
  expires     : 0,
  secret      : "dc2cd73a596518766ae5f001705a4ce6",
  base_domain : "daaku.org",
  sig         : "c38eede3e5a0244d7190f725ad64a81e"
};
var addFriendId = 5526183;


////////////////////////////////////////////////////////////////////////////////
module('initialize');
////////////////////////////////////////////////////////////////////////////////

test(
  'apiKey: , logging: false, cookie: true, status: true',

  function() {
    FB.init({ apiKey: API_KEY, logging: false, cookie: true, status: true });
    ok(FB._apiKey == API_KEY, 'should have the api key');
    ok(!FB._logging, 'logging is disabled');
    ok(FB.Cookie._enabled, 'cookie was enabled');

    FB._logging = true; // we actually do want logging
  }
);

////////////////////////////////////////////////////////////////////////////////
module('clear');
////////////////////////////////////////////////////////////////////////////////
test(
  'clear session if exists',

  function() {
    FB.getLoginStatus(function(response) {
      if (response.session) {
        FB.api(
          { method: 'Auth.revokeAuthorization' },
          function(response) {
            ok(!FB.getSession(), 'notConnected user');
            action.innerHTML = '';
            action.className = '';
            start();
          }
        );
      } else {
        ok(!FB.getSession(), 'notConnected user');
        action.innerHTML = '';
        action.className = '';
        start();
      }
    });

    expect(1);
    stop();
  }
);

////////////////////////////////////////////////////////////////////////////////
module('cached getLoginStatus');
////////////////////////////////////////////////////////////////////////////////
test(
  'get cached getLoginStatus result',

  function() {
    expect(1);

    // this is kind of a fake test. its not possible to tell if the result was
    // a cached result. well, there's a hack - a cached result means the
    // callback is invoked serially meaning the test should work without stop()
    // or start(). yes, ugly hack - but exposing the fact that a result is a
    // cached result seems like unnecessary developer complexity for testing
    // purposes.
    FB.getLoginStatus(function(response) {
      ok(true, 'got a response');
    });
  }
);
