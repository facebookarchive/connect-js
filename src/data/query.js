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
 * @provides fb.data.query
 * @layer data
 * @requires fb.waitable
 */

/**
 * Object that represents the results of an asynchronous FQL query, typically
 * constructed by a call [FB.Data.query](FB.Data.query)().
 *
 * These objects can be used in one of two ways:
 *
 * * Call [wait](FB.Waitable.wait)() to handle the value when it's ready:
 *
 *         var query = FB.Data.query(
 *           'select name from page where username = 'barackobama');
 *         query.wait(function(result) {
 *           document.getElementById('page').innerHTML = result[0].name
 *         });
 *
 * * Pass it as an argument to a function that takes a Waitable. For example,
 *   in this case you can construct the second query without waiting for the
 *   results from the first, and it will combine them into one request:
 *
 *         var query = FB.Data.query(
 *           'select username from page where page_id = 6815841748');
 *         var dependentQuery = FB.Data.query(
 *           'select name from page where username in ' +
 *           '(select username from {0})', query);
 *
 *         // now wait for the results from the dependent query
 *         dependentQuery.wait(function(data) {
 *           document.getElementById('page').innerHTML = result[0].name
 *         });
 *
 * * Wait for multiple waitables at once with [FB.Data.waitOn](FB.Data.waitOn).
 *
 * Check out the [tests][tests] for more usage examples.
 * [tests]: http://github.com/facebook/connect-js/blob/master/tests/js/data.js
 *
 * @class FB.Data.Query
 * @access public
 * @extends FB.Waitable
 */
FB.subclass('Data.Query', 'Waitable',
  function() {
    if (!FB.Data.Query._c) {
      FB.Data.Query._c = 1;
    }
    this.name = 'v_' + FB.Data.Query._c++;
  },
  {
  /**
   * Use the array of arguments using the FB.String.format syntax to build a
   * query, parse it and populate this Query instance.
   *
   * @params args
   */
  parse: function(args) {
    var
      fql = FB.String.format.apply(null, args),
      re = (/^select (.*?) from (\w+)\s+where (.*)$/i).exec(fql); // Parse it
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
    switch (this.where.type) {
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

  /**
   * Encode a given value for use in a query string.
   *
   * @param value {Object} the value to encode
   * @returns {String} the encoded value
   */
  _encode: function(value) {
    return typeof(value) == 'string' ? FB.String.quote(value) : value;
  },

  /**
   * Return the name for this query.
   *
   * TODO should this be renamed?
   *
   * @returns {String} the name
   */
  toString: function() {
    return '#' + this.name;
  },

  /**
   * Return an Array of field names extracted from a given string. The string
   * here is a comma separated list of fields from a FQL query.
   *
   * Example:
   *     query._toFields('abc, def,  ghi ,klm')
   * Returns:
   *     ['abc', 'def', 'ghi', 'klm']
   *
   * @param s {String} the field selection string
   * @returns {Array} the fields
   */
  _toFields: function(s) {
    return FB.Array.map(s.split(','), FB.String.trim);
  },

  /**
   * Parse the where clause from a FQL query.
   *
   * @param s {String} the where clause
   * @returns {Object} parsed where clause
   */
  _parseWhere: function(s) {
    // First check if the where is of pattern
    // key = XYZ
    var
      re = (/^\s*(\w+)\s*=\s*(.*)\s*$/i).exec(s),
      result,
      value,
      type = 'unknown';
    if (re) {
      // Now check if XYZ is either an number or string.
      value = re[2];
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
      result = { type: 'index', key: re[1], value: value };
    } else {
      // Not a simple <key>=<value> clause
      result = { type: 'unknown', value: s };
    }
    return result;
  }
});
