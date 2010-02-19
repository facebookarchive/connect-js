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
 * @provides fb.tests.data
 * @requires fb.tests.qunit
 *           fb.data
 */
////////////////////////////////////////////////////////////////////////////////
module('data');
////////////////////////////////////////////////////////////////////////////////

/**
 * Return a callback function suitable for passing to an FQLResult.wait()
 * statement. Pass an array of rows with the data expected.
 *
 * Should expect expected_rows.length + 1 ok()s.
 */
function assertFQLResponse (data, expected_rows) {
  equals(data.length, expected_rows.length);

  if (data.length != expected_rows.length) {
    return;
  }

  for (var i = 0; i < expected_rows.length; ++i) {
    for (var key in expected_rows[i]) {
      equals(data[i][key],
             expected_rows[i][key],
         "verified data[" + i + "]");
    }
  }
}

test(
  'FB.Data.query: simple fql query',

  function() {
    var pagename = FB.Data.query(
      "select name from page where username='barackobama'");

    pagename.wait(function(data) {
                    assertFQLResponse(data, [{name: 'Barack Obama'}]);
                    start();
      });
    expect(2);
    stop();
  }
);

test(
  'FB.Data.query: parameterized fql query',

  function() {
    var pagename = FB.Data.query(
      "select name from page where username='{0}'",
      "barackobama"
    );
    // note the flipped quotes
    equals(pagename.toFql(),
           'select name from page where username="barackobama"');
    equals(pagename.toString().substr(0,3), "#v_");
    pagename.wait(function(data) {
                    assertFQLResponse(data, [{name: 'Barack Obama'}]);
                    start();
      });
    expect(4);
    stop();
  }
);

test(
  'FB.Data.query non-index',

  function() {
    var query = FB.Data.query(
      'SELECT name FROM page WHERE username IN ("barackobama", "platform")');
    equals(query.where.type, 'unknown');

    query.wait(function(data) {
                   assertFQLResponse(data, [{name: 'Barack Obama'},
                                            {name: 'Facebook Platform'}]);
                   start();
               });
    expect(4);
    stop();
  }
);

test(
  'FB.Data.waitOn single query',

  function() {
    var pagename = FB.Data.query(
      "select name from page where username='barackobama'");

    FB.Data.waitOn([ pagename ], function(data) {
      assertFQLResponse(pagename.value, [{name : 'Barack Obama'}]);
      assertFQLResponse(data[0], [{name : 'Barack Obama'}]);
      start();
    });
    expect(4);
    stop();
  }
);

test(
  'FB.Data.waitOn multiple queries',

  function() {
    var obama = FB.Data.query(
      "select name from page where username='barackobama'");
    var platform = FB.Data.query(
      "select name from page where username='platform'");

    FB.Data.waitOn([ obama, platform ], function(data) {
      assertFQLResponse(obama.value,     [{name : 'Barack Obama'}]);
      assertFQLResponse(data[0],         [{name : 'Barack Obama'}]);

      assertFQLResponse(platform.value,  [{name : 'Facebook Platform'}]);
      assertFQLResponse(data[1],         [{name : 'Facebook Platform'}]);

      start();
    });
    expect(8);
    stop();
  }
);

test(
  'FB.Data.waitOn with string callback',

  function() {
    var obama = FB.Data.query(
      "select username from page where username='barackobama'");
    FB.Data.waitOn([obama],
                   "same(args[0], [{username: 'barackobama'}]); start();");
    expect(1);
    stop();
  }
);

test(
  'FB.Data._selectByIndex',

  function() {
    var obama = FB.Data._selectByIndex(
      ['name'], 'page', 'username', 'barackobama');
    equals(obama.toFql(),
           'select name from page where username="barackobama"');

    obama.wait(function(data) {
                 assertFQLResponse(data, [{name: 'Barack Obama'}]);
                 start();
               });

    expect(3);
    stop();
  }
);

test(
  'FB.Data.query with dependency',

  function() {
    var query = FB.Data.query(
      'select username from page where page_id = 6815841748');
    var dependentQuery = FB.Data.query(
      'select name from page where username in (select username from {0})',
      query
    );

    dependentQuery.wait(function(data) {
                          assertFQLResponse(data, [{name: 'Barack Obama'}]);
                          start();
                        },
                        function(ex) {
                          ok(false, "exception thrown: " + ex.toString());
                          start();
                        });
    expect(2);
    stop();
  }
);


test(
  'FB.Data.Query._parseWhere',

  /**
   * The "where" parser is one of the trickier bits
   * of the data layer. It classifies the query as
   * either an "index" query (meaning it can be combined
   * with other queries) or not, and it handles
   * encoding/quoting correctly.
   */
  function() {
    var query = new FB.Data.Query();

    same(query._parseWhere("key = 'value'"),
        {type: 'index', key: 'key', value: 'value'});

    same(query._parseWhere('key = "a=b"'),
         {type: 'index', key: 'key', value: 'a=b'});

    same(query._parseWhere('answer = 42'),
        {type: 'index', key: 'answer', value: '42'});

    same(query._parseWhere("key = unquoted_value"),
         {type: 'unknown', value: 'key = unquoted_value'});

    same(query._parseWhere('something else'),
         {type: 'unknown', value: 'something else'});
  }
);

/*
test(
  'FB.Data.query non-index',

  function() {

  }
);
*/
