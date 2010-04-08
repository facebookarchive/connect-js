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
 * TODO: add back fb.api to requires
 *
 * @provides fb.data
 * @layer data
 * @requires fb.prelude
 *           fb.type
 *           fb.array
 *           fb.string
 *           fb.obj
 *           fb.data.query
 *           fb.json
 */


/**
 * Data access class for accessing Facebook data efficiently.
 *
 * FB.Data is a data layer that offers the following advantages over
 * direct use of FB.Api:
 *
 * 1. Reduce number of individual HTTP requests through the following
 *    optimizations:
 *
 *   a. Automatically combine individual data requests into a single
 *      multi-query request.
 *
 *   b. Automatic query optimization.
 *
 *   c. Enable caching of data through browser local cache (not implemented yet)
 *
 * 2. Reduce complexity of asynchronous API programming, especially multiple
 *     asynchronous request, though FB.Waitable and FB.waitOn.
 *
 * @class FB.Data
 * @access public
 * @static
 */
FB.provide('Data', {
  /**
   * Performs a parameterized FQL query and returns a [[joey:FB.Data.Query]]
   * object which can be waited on for the asynchronously fetched data.
   *
   * Examples
   * --------
   *
   * Make a simple FQL call and handle the results.
   *
   *      var query = FB.Data.query('select name, uid from user where uid={0}',
   *                                user_id);
   *      query.wait(function(rows) {
   *        document.getElementById('name').innerHTML =
   *          'Your name is ' + rows[0].name;
   *      });
   *
   * Display the names and events of 10 random friends. This can't be done
   * using a simple FQL query because you need more than one field from more
   * than one table, so we use FB.Data.query to help construct the call to
   * [[api:fql.multiquery]].
   *
   *      // First, get ten of the logged-in user's friends and the events they
   *      // are attending. In this query, the argument is just an int value
   *      // (the logged-in user id). Note, we are not firing the query yet.
   *      var query = FB.Data.query(
   *            "select uid, eid from event_member "
   *          + "where uid in "
   *          + "(select uid2 from friend where uid1 = {0}"
   *          + " order by rand() limit 10)",
   *          user_id);
   *
   *      // Now, construct two dependent queries - one each to get the
   *      // names of the friends and the events referenced
   *      var friends = FB.Data.query(
   *            "select uid, name from user where uid in "
   *          + "(select uid from {0})", query);
   *      var events = FB.Data.query(
   *            "select eid, name from event where eid in "
   *          + " (select eid from {0})", query);
   *
   *      // Now, register a callback which will execute once all three
   *      // queries return with data
   *      FB.Data.waitOn([query, friends, events], function() {
   *        // build a map of eid, uid to name
   *        var eventNames = friendNames = {};
   *        FB.Array.forEach(events.value, function(row) {
   *          eventNames[row.eid] = row.name;
   *        });
   *        FB.Array.forEach(friends.value, function(row) {
   *          friendNames[row.uid] = row.name;
   *        });
   *
   *        // now display all the results
   *        var html = '';
   *        FB.Array.forEach(query.value, function(row) {
   *          html += '<p>'
   *            + friendNames[row.uid]
   *            + ' is attending '
   *            + eventNames[row.eid]
   *            + '</p>';
   *        });
   *        document.getElementById('display').innerHTML = html;
   *      });
   *
   * @param {String} template FQL query string template. It can contains
   * optional formatted parameters in the format of '{<argument-index>}'.
   * @param {Object} data optional 0-n arguments of data. The arguments can be
   * either real data (String or Integer) or an [[joey:FB.Data.Query]] object
   * from a previous [[joey:FB.Data.query]]().
   * @return {FB.Data.Query}
   * An async query object that contains query result.
   */
  query: function(template, data) {
    var query = new FB.Data.Query().parse(arguments);
    FB.Data.queue.push(query);
    FB.Data._waitToProcess();
    return query;
  },

  /**
   * Wait until the results of all queries are ready. See also
   * [[joey:FB.Data.query]] for more examples of usage.
   *
   * Examples
   * --------
   *
   * Wait for several queries to be ready, then perform some action:
   *
   *      var queryTemplate = 'select name from profile where id={0}';
   *      var u1 = FB.Data.query(queryTemplate, 4);
   *      var u2 = FB.Data.query(queryTemplate, 1160);
   *      FB.Data.waitOn([u1, u2], function(args) {
   *        log('u1 value = '+ args[0].value);
   *        log('u2 value = '+ args[1].value);
   *      });
   *
   * Same as above, except we take advantage of JavaScript closures to
   * avoid using args[0], args[1], etc:
   *
   *      var queryTemplate = 'select name from profile where id={0}';
   *      var u1 = FB.Data.query(queryTemplate, 4);
   *      var u2 = FB.Data.query(queryTemplate, 1160);
   *      FB.Data.waitOn([u1, u2], function(args) {
   *        log('u1 value = '+ u1.value);
   *        log('u2 value = '+ u2.value);
   *      });
   *
   * Create a new Waitable that computes its value based on other Waitables:
   *
   *      var friends = FB.Data.query('select uid2 from friend where uid1={0}',
   *                                  FB.getSession().uid);
   *      // ...
   *      // Create a Waitable that is the count of friends
   *      var count = FB.Data.waitOn([friends], 'args[0].length');
   *      displayFriendsCount(count);
   *      // ...
   *      function displayFriendsCount(count) {
   *        count.wait(function(result) {
   *          log('friends count = ' + result);
   *        });
   *      }
   *
   * You can mix Waitables and data in the list of dependencies
   * as well.
   *
   *      var queryTemplate = 'select name from profile where id={0}';
   *      var u1 = FB.Data.query(queryTemplate, 4);
   *      var u2 = FB.Data.query(queryTemplate, 1160);
   *
   *      // FB.getSession().uid is just an Integer
   *      FB.Data.waitOn([u1, u2, FB.getSession().uid], function(args) {
   *          log('u1 = '+ args[0]);
   *          log('u2 = '+ args[1]);
   *          log('uid = '+ args[2]);
   *       });
   *
   * @param dependencies {Array} an array of dependencies to wait on. Each item
   * could be a Waitable object or actual value.
   * @param callback {Function} A function callback that will be invoked
   * when all the data are ready. An array of ready data will be
   * passed to the callback. If a string is passed, it will
   * be evaluted as a JavaScript string.
   * @return {FB.Waitable} A Waitable object that will be set with the return
   * value of callback function.
   */
  waitOn: function(dependencies, callback) {
    var
      result = new FB.Waitable(),
      count = dependencies.length;

    // For developer convenience, we allow the callback
    // to be a string of javascript expression
    if (typeof(callback) == 'string') {
      var s = callback;
      callback = function(args) {
        return eval(s);
      };
    }

    FB.Array.forEach(dependencies, function(item) {
      item.monitor('value', function() {
        var done = false;
        if (FB.Data._getValue(item) !== undefined) {
          count--;
          done = true;
        }
        if (count === 0) {
          var value = callback(FB.Array.map(dependencies, FB.Data._getValue));
          result.set(value !== undefined ? value : true);
        }
        return done;
      });
    });
    return result;
  },

  /**
   * Helper method to get value from Waitable or return self.
   *
   * @param item {FB.Waitable|Object} potential Waitable object
   * @returns {Object} the value
   */
  _getValue: function(item) {
    return FB.Type.isType(item, FB.Waitable) ? item.value : item;
  },

  /**
   * Alternate method from query, this method is more specific but more
   * efficient. We use it internally.
   *
   * @access private
   * @param fields {Array} the array of fields to select
   * @param table {String} the table name
   * @param name {String} the key name
   * @param value {Object} the key value
   * @returns {FB.Data.Query} the query object
   */
  _selectByIndex: function(fields, table, name, value) {
    var query = new FB.Data.Query();
    query.fields = fields;
    query.table = table;
    query.where = { type: 'index', key: name, value: value };
    FB.Data.queue.push(query);
    FB.Data._waitToProcess();
    return query;
  },

  /**
   * Set up a short timer to ensure that we process all requests at once. If
   * the timer is already set then ignore.
   */
  _waitToProcess: function() {
    if (FB.Data.timer < 0) {
      FB.Data.timer = setTimeout(FB.Data._process, 10);
    }
  },

  /**
   * Process the current queue.
   */
  _process: function() {
    FB.Data.timer = -1;

    var
      mqueries = {},
      q = FB.Data.queue;
    FB.Data.queue = [];

    for (var i=0; i < q.length; i++) {
      var item = q[i];
      if (item.where.type == 'index' && !item.hasDependency) {
        FB.Data._mergeIndexQuery(item, mqueries);
      } else {
        mqueries[item.name] = item;
      }
    }

    // Now make a single multi-query API call
    var params = { method: 'fql.multiquery', queries: {} };
    FB.copy(params.queries, mqueries, true, function(query) {
      return query.toFql();
    });

    params.queries = FB.JSON.stringify(params.queries);

    FB.api(params, function(result) {
      if (result.error_msg) {
        FB.Array.forEach(mqueries, function(q) {
          q.error(Error(result.error_msg));
        });
      } else {
        FB.Array.forEach(result, function(o) {
          mqueries[o.name].set(o.fql_result_set);
        });
      }
    });
  },

  /**
   * Check if y can be merged into x
   * @private
   */
  _mergeIndexQuery: function(item, mqueries) {
    var key = item.where.key,
    value = item.where.value;

    var name = 'index_' +  item.table + '_' + key;
    var master = mqueries[name];
    if (!master) {
      master = mqueries[name] = new FB.Data.Query();
      master.fields = [key];
      master.table = item.table;
      master.where = {type: 'in', key: key, value: []};
    }

    // Merge fields
    FB.Array.merge(master.fields, item.fields);
    FB.Array.merge(master.where.value, [value]);

    // Link data from master to item
    master.wait(function(r) {
      item.set(FB.Array.filter(r, function(x) {
        return x[key] == value;
      }));
    });
  },

  timer: -1,
  queue: []
});
