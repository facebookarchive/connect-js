/**
 * @module Mu
 * @provides Mu.IndexedQuery
 * @requires Mu.Prelude
 *           Mu.Lang
 *           Mu.API
 */

/**
 * Indexed Queries.
 *
 * @class Mu.IndexedQuery
 * @static
 * @access private
 */
Mu.copy('IndexedQuery', {
  /**
   * Current queue of unfired requests.
   *
   * @access private
   * @type Array
   */
  _queue: [],

  /**
   * Queue up a set of Queries attached to the given callback.
   *
   * @access public
   * @param queries  {Array}    an array of query definitions
   * @param cb       {Function} a function to handle the response
   */
  make: function(queries, cb) {
    // if tryFromCache is unsuccessful, queue it up
    var req = { queries: queries, cb: cb };
    if (!Mu.IndexedQuery.tryFromCache(req)) {
      Mu.IndexedQuery._queue.push(req);
    }
  },

  /**
   * Fires the current queue.
   *
   * @access public
   */
  fire: function() {
    // we'll be consuming the current queue
    var queue = Mu.IndexedQuery._queue;
    Mu.IndexedQuery._queue = [];

    // nothing to do
    if (queue.length < 1) {
      return;
    }

    // we make the API call and populate the cache, and then redo each request
    Mu.IndexedQuery.populateCache(queue, function() {
      for (var i=0, l=queue.length; i<l; i++) {
        var req = queue[i];
        // try again from cache, this time if it fails, we're done
        if (!Mu.IndexedQuery.tryFromCache(req)) {
          //TODO is this the right way to handle a missing response?
          req.cb();
        }
      }
    });
  },

  populateCache: function(queue, cb) {
    // create a "query map" -- a data structure to represent the unified query
    // needs
    var queryMap = {};
    for (var i=0, l=queue.length; i<l; i++) {
      var req = queue[i];
      for (var j=0, k=req.queries.length; j<k; j++) {
        var
          query         = req.queries[j],
          queryMapKey   = query.table + ':' + query.keyName,
          queryMapEntry = queryMap[queryMapKey];

        if (queryMapEntry) {
          Mu.Lang.arrayMerge(queryMapEntry.fields, query.fields);
          queryMapEntry.keyValues.push(query.keyValue);
        } else {
          queryMap[queryMapKey] = {
            table     : query.table,
            fields    : query.fields,
            keyName   : query.keyName,
            keyValues : [query.keyValue]
          };

          // ensure the key is a selected field
          queryMap[queryMapKey].fields.push(query.keyName);
        }
      }
    }

    // convert the query map into a set of fql queries
    var fql = {};
    for (var queryMapKey in queryMap) {
      var queryMapEntry = queryMap[queryMapKey];
      fql[queryMapKey] = (
        'SELECT ' +
          Mu.Lang.arrayUnique(queryMapEntry.fields).join(',') + ' ' +
        'FROM ' +
          queryMapEntry.table + ' ' +
        'WHERE ' +
          queryMapEntry.keyName + ' IN (' +
          Mu.Lang.arrayUnique(queryMapEntry.keyValues).join(',') + ')'
      );
    }

    // API call
    Mu.api(
      { method: 'fql.multiquery', queries: JSON.stringify(fql) },
      function(response) {
        for (var i=0, l=response.length; i<l; i++) {
          var
            query = response[i],
            queryMapEntry = queryMap[query.name],
            keyName = queryMapEntry.keyName;

          for (var j=0, k=query.fql_result_set.length; j<k; j++) {
            var row = query.fql_result_set[j];
            Mu.Cache.put(query.name + ':' + row[keyName], row);
          }
        }

        // done, invoke the callback to notify the job was done
        cb();
      }
    );
  },

  /**
   * Tries to get cache hits for ALL the queries. Fires the callback and
   * returns true if successful. Returns false if any required data was
   * missing.
   *
   * @access private
   * @param queries  {Array}    an array of queries
   * @param callback {Function} a function to handle the response
   */
  tryFromCache: function(req) {
    var rows = [];
    for (var i=0, l=req.queries.length; i<l; i++) {
      var
        query    = req.queries[i],
        cacheKey = query.table + ':' + query.keyName + ':' + query.keyValue,
        row      = Mu.Cache.get(cacheKey);

      // no hit, bail
      if (!row) {
        return false;
      }

      // got a hit, make sure we have the fields we want
      for (var j=0, k=query.fields.length; j<k; j++) {
        // partial miss, bail
        if (!(query.fields[j] in row)) {
          return false;
        }
      }

      // cache hit!
      rows.push(row);
    }

    // delaying the callback, it may help in speeding up the queue process and
    // then firing off cache hits while we're wating for the real http request
    // to come back (if any).
    window.setTimeout(function() { req.cb(rows); }, 0);

    // successful cache hit
    return true;
  }
});
