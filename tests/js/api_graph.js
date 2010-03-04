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
 * @provides fb.tests.api_graph
 * @requires fb.tests.qunit
 *           fb.api_graph
 */


function bigVal() {
  var a = '';
  while (a.length < 2000) {
    a += ' ';
  }
  return a;
}

////////////////////////////////////////////////////////////////////////////////
module('API');
////////////////////////////////////////////////////////////////////////////////
test(
  'check for zuck\'s name using api',

  function() {
    expect(1);
    stop();

    FB.api(
      {
        method: 'fql.query',
        query: 'SELECT name FROM user WHERE uid=4'
      },
      function(r) {
        ok(r[0].name == 'Mark Zuckerberg', 'should get zuck\'s name');
        start();
      }
    );
  }
);

test(
  'check for id given a vanity name using graph',

  function() {
    expect(1);
    stop();

    FB.api('/naitik', function(response) {
      equals(response.naitik.id, '5526183', 'should get expected id');
      start();
    });
  }
);

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

test(
  'check for id given a vanity name using graph with POST over flash',

  function() {
    expect(1);
    stop();

    FB.api('/naitik', { a: bigVal() }, function(response) {
      equals(response.naitik.id, '5526183', 'should get expected id');
      start();
    });
  }
);

test(
  'check for zuck\'s name using api and trigger POST over flash',

  function() {
    expect(1);
    stop();

    FB.api(
      {
        method: 'fql.query',
        query: 'SELECT name FROM user WHERE uid=4',
        a: bigVal()
      },
      function(r) {
        ok(r[0].name == 'Mark Zuckerberg', 'should get zuck\'s name');
        start();
      }
    );
  }
);

test(
  'test method override using jsonp',

  function() {
    expect(1);
    stop();

    // this is weird in that we rely on an error to test some functionality.
    FB.api('/1234567890', 'delete', function(response) {
      equals(response.error.message, 'Unsupported type: ProfileDelete',
             'should get expected error message');
      start();
    });
  }
);

test(
  'test method override using flash',

  function() {
    expect(1);
    stop();

    // this is weird in that we rely on an error to test some functionality.
    FB.api('/1234567890', { a: bigVal() }, 'delete', function(response) {
      equals(response.error.message, 'Unsupported type: ProfileDelete',
             'should get expected error message');
      start();
    });
  }
);
