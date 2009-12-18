/**
 * @provides fb.Data
 * @layer Data
 * @requires fb.prelude fb.Type fb.Array fb.String  fb.api fb.Waitable fb.Obj
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
 * @class FB.Data
 * @static
 */
FB.provide('Data', {
  /**
   * Perform a FQL query
   * Example:
   *      // Get random 5 friends ids
   *      var friends = FB.Data.query(
   *        'select uid2 from friend where uid1={0} ORDER BY rand() limit 5',
   *        FB.App.session.uid);
   *      var friendInfos = FB.Data.query(
   *           'select name, pic from user where uid in (select uid2 from {0})',
   *           friends);
   *
   *      friendInfos.wait(function(data) {
   *        // Render info. For illustration of API, I am using any XFBML tags
   *        var html = '';
   *        FB.forEach(data, function(info) {
   *         html += '<p>' + info.name + '<img src="' + info.pic + '" /></p>';
   *        });
   *        FB.$('infos').innerHTML = html;
   *      });
   *
   * @param {String} template FQL query string template. It can contains
   *                optional
   *                 formated parameters in the format of '{<arg-indx>}'.
   *                 When these
   *                 parameters are used in the string, the actual data should
   *                 be passed as parameter following the template parameter.
   * @param {Object} data optional 0-n arguments of data. The arguments can be
   * either real data or results from previous FB.Data.query().
   * @return {FB.Waitable} An async query object that contains query result.
   *   You can pass the result as arguments to other functions that expect
   *  FB.Waitable immediately, such as FB.Data.query(), FB.Data.eval(),
   *  FB.Data.waitOn(). If you want wait for the data's value to be available,
   * you can call the wait() method on the result.
   */
  query: function(template, data) {
    var query = (new FB.Data.Query).parse(arguments);
    FB.Data.queue.push(query);
    FB.Data._waitToProcess();
    return query;
  },

  /**
   * Given a list of potential async data,
   * wait until they are all ready
   * Example 1
   * ------------
   *  Wait for several data then perform some action
   * var queryTemplate = 'select name from profile where id={0}';
   *      var u1 = FB.Data.query(queryTemplate, 4);
   *      var u2 = FB.Data.query(queryTemplate, 1160);
   *       FB.Data.waitOn([u1, u2], function(args) {
   *          log('u1 value = '+ u1.value); // You can also use args[0]
   *          log('u2 value = '+ u2.value); // You can also use args[1]
   *       });
   *
   * Examples 2: Create a new Waitable that compute its value
   * based on other Waitables
   *      var friends = FB.Data.query('select uid2 from friend where uid1={0}',
   *       FB._session.uid);
   *      // ...
   *      // Create a Waitable that is the count of friends
   *      var count = FB.Data.waitOn([friends], 'args[0].length');
   *      displayFriendsCount(count);
   *      // ...
   *      function displayFriendsCount(count) {
   *       count.wait(function(result) {
   *         log('friends count = ' + result);
   *       });
   *      }
   *
   * Example 3: Note waiOn can handle data that is direct value
   * as well.
   *      var queryTemplate = 'select name from profile where id={0}';
   *      var u1 = FB.Data.query(queryTemplate, 4);
   *      var u2 = FB.Data.query(queryTemplate, 1160);
   *       FB.Data.waitOn([u1, u2, FB._session.uid], function(args) {
   *          log('u1 = '+ args[0]);
   *          log('u2 = '+ args[1]);
   *          log('uid = '+ args[2]);
   *       });
   * @param {Array} an array of data to wait on. Each item
   *                could be a Waitable object or actual value
   * @param {Function | String} A function callback that will be invoked
   *        when all the data are ready. An array of ready data will be
   *        passed to the callback. If a string is passed, it will
   *        be evaluted as a JavaScript string
   * @return {FB.Waitable} A Waitable object that will be set with
   *        the return value of callback function.
   */
  waitOn: function(data, callback) {
    var result = new FB.Waitable();
    var c = data.length;

    // For developer convenience, we allow the callback
    // to be a string of javascript expression
    if (typeof(callback) == 'string') {
      var s = callback;
      callback = function(args) {
        return eval(s);
      };
    }

    FB.forEach(data, function(item) {
      item.monitor('value', function() {
        var done = false;;
        if (FB.Data._getValue(item) !== undefined) {
          c--;
          done = true;
        }
        if (c == 0) {
          var value = callback(FB.Array.map(data, FB.Data._getValue));
          result.set(value !== undefined ? value : true);
        }
        return done;
      });
    });
    return result;
  },

  _getValue: function(item) {
    return  FB.Type.isType(item, FB.Waitable) ? item.value : item;
  },

  /**
   * Alternate method from query, this method is more specific
   * but more efficient. We use it internally.
   * @private
   */
  _selectByIndex: function(fields, table, name, value) {
    var query = (new FB.Data.Query);
    query.fields = fields;
    query.table = table;
    query.where = {type: 'index', key: name, value: value};
    FB.Data.queue.push(query);
    FB.Data._waitToProcess();
    return query;
  },

  /**
   * Set up a short timer to ensure that we process all requests
   * at once. If the timer is already set then ignore.
   */
  _waitToProcess: function() {
    if (FB.Data.timer < 0) {
      FB.Data.timer = setTimeout(FB.Data._process, 10);
    }
  },

  _process: function() {
    FB.Data.timer = -1;

    var mergedQ = {};
    var q = FB.Data.queue;
    FB.Data.queue = [];
    var mqueries = {};

    for (var i=0; i < q.length; i++) {
      var item = q[i];
      if (item.where.type == 'index' && !item.hasDependency) {
        FB.Data._mergeIndexQuery(item, mqueries);
      } else {
        mqueries[item.name] = item;
      }
    }

    // Now make a single multi-query API call
    var params = {method: 'fql.multiquery', queries: {}};
    FB.copy(params.queries, mqueries, true, function(query) {
      return query.toFql();
    });

    params.queries = JSON.stringify(params.queries);

    FB.api(params, function(result) {
      if (result.error_msg) {
        FB.forEach(mqueries,
          function(q) {
            q.error(Error(result.error_msg));
          });
      } else {
        FB.forEach(result,
          function(o) {
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


/**
 * Query class that represent a FQL query
 * @class FB.Data.Query
 * @extends FB.Waitable
 * @private
 */
FB.subclass('Data.Query', 'Waitable',
  function () {
    if (!FB.Data.Query._c) {
      FB.Data.Query._c = 1;
    }
    this.name = 'v_' + FB.Data.Query._c++;
  },
  {
  parse: function(args) {
    var fql = FB.String.format.apply(null, args);
    // Parse it
    re = (/^select (.*?) from (\w+)\s+where (.*)$/i).exec(fql);
    this.fields = this._toFields(re[1]);
    this.table = re[2];
    this.where = this._parseWhere(re[3]);

    for (var i=1; i < args.length; i++) {
      if (FB.Type.isType(args[i], FB.Data.Query)) {
        // Indicate this query can not be merged because
        // others depend on it.
        args[i].hasDependency = true;
      }
    }

    return this;
  },

  toFql: function() {
    var s = 'select ' + this.fields.join(',') + ' from ' +
      this.table + ' where ';
    switch(this.where.type) {
      case 'unknown':
        s += this.where.value;
        break;
      case 'index':
        s += this.where.key + '=' + this._encode(this.where.value);
        break;
      case 'in':
        if (this.where.value.length == 1) {
          s += this.where.key + '=' +  this._encode(this.where.value[0]);
        } else {
          s += this.where.key + ' in (' +
            FB.Array.map(this.where.value, this._encode).join(',') + ')';
        }
        break;
    }
    return s;
  },

  _encode: function(value) {
    return typeof(value) == 'string' ?  FB.String.quote(value) : value;
  },

  toString: function() {
    return '#' + this.name;
  },

  _toFields: function(s) {
    return FB.Array.map(s.split(','), FB.String.trim);
  },

  _parseWhere: function(s) {
    // First check if the where is of pattern
    // key = XXX
    var re = (/^\s*(\w+)\s*=\s*(.*)\s*$/i).exec(s),
     result,
     type = 'unknown';
    if (re) {
      // Now check if XXX is either an number or string.
      var value = re[2];
      // The RegEx expression for checking quoted string
      // is from http://blog.stevenlevithan.com/archives/match-quoted-string
      if (/^(["'])(?:\\?.)*?\1$/.test(value)) {
        // Use eval to unquote the string
        // convert
        value = eval(value);
        type = 'index';
      } else if (/^\d+\.?\d*$/.test(value)) {
        type = 'index';
      }
   }

   if (type == 'index') {
     // a simple <key>=<value> clause
      result = {type:'index', key:re[1], value:value};
    } else {
      // Not a simple <key>=<value> clause
      result = {type:'unknown', value:s};
    }
    return result;
  }
});

