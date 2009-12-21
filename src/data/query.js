/**
 * @provides fb.Data.Query
 * @layer Data
 * @requires fb.Waitable
 */

/**
 * Object that represents the results of an asynchronous FQL query, typically constructed
 * by a call [[joey:FB.Data.query]]().
 *
 * These objects can be used in one of two ways:
 *
 * * Call [wait][[joey:FB.Waitable.wait]]() to handle the value when it's ready:
 *
 *         var query = FB.Data.query('select name from page where username = 'barackobama');
 *         query.wait(function(result) {
 *           document.getElementById('page').innerHTML = result[0].name
 *         });
 *
 * * Pass it as an argument to a function that takes a Waitable. For example, in this case
 *   you can construct the second query without waiting for the results from the first,
 *   and it will combine them into one request:
 *
 *         var query = FB.Data.query('select username from page where page_id = 6815841748');
 *         var dependentQuery = FB.Data.query('select name from page where username in '
 *                                            '(select username from {0})', query);
 *
 *         // now wait for the results from the dependent query
 *         dependentQuery.wait(function(data) {
 *           document.getElementById('page').innerHTML = result[0].name
 *         });
 *
 * * Wait for multiple waitables at once with [[joey:FB.Data.waitOn]].
 *
 * Check out the [tests][tests] for more usage examples.
 * [tests]: http://github.com/facebook/connect-js/blob/master/tests/js/data.js
 *
 * @class FB.Data.Query
 * @access public
 * @extends FB.Waitable
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

  /**
   * Renders the query in FQL format.
   *
   * @return {String} FQL statement for this query
   */
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

