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
 * @provides fb.tests.api
 * @requires fb.tests.qunit
 *           fb.api
 */
// all the API functions share the signature, so we use the same test with all
// of them. it also ensures we have parity between them.
//
// pad: is used to "fake" a large request (>2k) to trigger the automatic
// failure of jsonp which is used by default
var runAPI = function(impl, pad) {
  var query = 'SELECT name FROM user WHERE uid=4';
  if (pad) {
    while (query.length < 2000) {
      query += ' ';
    }
  }

  impl(
    {
      method: 'fql.query',
      query: query
    },
    function(r) {
      ok(r[0].name == 'Mark Zuckerberg', 'should get zuck\'s name');
      start();
    }
  );
};

////////////////////////////////////////////////////////////////////////////////
module('API');
////////////////////////////////////////////////////////////////////////////////
test(
  'check for zuck\'s name using api',

  function() {
    runAPI(FB.api);
    expect(1);
    stop();
  }
);

////////////////////////////////////////////////////////////////////////////////
module('jsonp API');
////////////////////////////////////////////////////////////////////////////////
test(
  'check for zuck\'s name using jsonp',

  function() {
    runAPI(FB.RestServer.jsonp);
    expect(1);
    stop();
  }
);

////////////////////////////////////////////////////////////////////////////////
module('flash API');
////////////////////////////////////////////////////////////////////////////////
test(
  'check for zuck\'s name using flash',

  function() {
    runAPI(FB.RestServer.flash);
    expect(1);
    stop();
  }
);

////////////////////////////////////////////////////////////////////////////////
module('automatically json encoded values');
////////////////////////////////////////////////////////////////////////////////
test(
  'automatic json encoding',

  function() {
    FB.api(
      {
        method: 'fql.multiquery',
        queries: {
          'zuck': 'SELECT name FROM user WHERE uid=4'
        }
      },
      function(r) {
        ok(r[0].name == 'zuck', 'expect the query result back');
        ok(r[0].fql_result_set[0].name == 'Mark Zuckerberg',
           'should get zucks name back');
        start();
      }
    );

    expect(2);
    stop();
  }
);

////////////////////////////////////////////////////////////////////////////////
module('padded call to trigger >2k request flow');
////////////////////////////////////////////////////////////////////////////////
test(
  'check for zuck\'s name using POST api call',

  function() {
    runAPI(FB.api, true);
    expect(1);
    stop();
  }
);

////////////////////////////////////////////////////////////////////////////////
module('signature flow using pre-baked session');
////////////////////////////////////////////////////////////////////////////////
test(
  'check for invalid session message',

  function() {
    // this is strange, in that we use an error to assert something is working
    // correctly. basically, we expect a session invalid error as opposed to a
    // signature invalid error.
    var oldStatus = FB._userStatus;
    var oldSession = FB._session;
    FB.Auth.setSession(EXPIRED_SESSION, 'connected');
    FB.api(
      {
        method: 'fql.query',
        query: 'SELECT name FROM user WHERE uid=4'
      },
      function(r) {
        ok(r.error_code == 102, 'should get a session invalid error');
        start();
      }
    );

    expect(1);
    stop();
    FB.Auth.setSession(oldSession, oldStatus);
  }
);
