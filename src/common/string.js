/**
 * @provides fb.String
 * @layer Basic
 * @requires fb.prelude
 *
 */

/**
 * Utility function related to string
 * @class FB.String
 * @private
 */
FB.provide('String', {
    trim: function(s) {
    return s.replace(/^\s*|\s*$/g, '');
  },

  /**
   * Format a string
   * Example:
   *
   * FB.String.format('{0}.facebook.com/{1}', 'www', 'login.php') returns
   * 'www.facebook.com/login.php'
   *
   * FB.String.format('foo {0}, {1}, {0}', 'x', 'y') returns
   * 'foo x, y, x'
   *
   * @static
   */
  format: function (format) {
    if (!FB.String.format._formatRE) {
      FB.String.format._formatRE = /(\{[^\}^\{]+\})/g;
    }

    var values = arguments;

    return format.replace(FB.String.format._formatRE,
                        function(str, m) {
                            var index = parseInt(m.substr(1));
                            var value = values[index + 1];
                            if (value === null || value === undefined) {
                                return '';
                            }
                            return value.toString();
                        });
  },

  /**
   * Escape an string so that it can be embedded inside another string
   * as quoted string
   * @param {string} string to quote
   * @return {string} an quoted string
   */
  quote: function(value) {
    var m = {    // table of character substitutions
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"' : '\\"',
            '\\': '\\\\'
        };

        var a,          // The array holding the partial texts.
                i,          // The loop counter.
                k,          // The member key.
                l,          // Length.
                r = /["\\\x00-\x1f\x7f-\x9f]/g,
                v;          // The member value.


        return r.test(value) ?
                    '"' + value.replace(r, function (a) {
                        var c = m[a];
                        if (c) {
                            return c;
                        }
                        c = a.charCodeAt();
                        return '\\u00' + Math.floor(c / 16).toString(16) +
                                                   (c % 16).toString(16);
                    }) + '"' :
                    '"' + value + '"';


  }
});
