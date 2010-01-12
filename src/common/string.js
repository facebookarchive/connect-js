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
 * @provides fb.string
 * @layer basic
 * @requires fb.prelude
 *
 */

/**
 * Utility function related to Strings.
 *
 * @class FB.String
 * @static
 * @private
 */
FB.provide('String', {
  /**
   * Strip leading and trailing whitespace.
   *
   * @param s {String} the string to trim
   * @returns {String} the trimmed string
   */
  trim: function(s) {
    return s.replace(/^\s*|\s*$/g, '');
  },

  /**
   * Format a string.
   *
   * Example:
   *     FB.String.format('{0}.facebook.com/{1}', 'www', 'login.php')
   * Returns:
   *     'www.facebook.com/login.php'
   *
   * Example:
   *     FB.String.format('foo {0}, {1}, {0}', 'x', 'y')
   * Returns:
   *     'foo x, y, x'
   *
   * @static
   * @param format {String} the format specifier
   * @param arguments {...} placeholder arguments
   * @returns {String} the formatted string
   */
  format: function(format) {
    if (!FB.String.format._formatRE) {
      FB.String.format._formatRE = /(\{[^\}^\{]+\})/g;
    }

    var values = arguments;

    return format.replace(
      FB.String.format._formatRE,
      function(str, m) {
        var
          index = parseInt(m.substr(1), 10),
          value = values[index + 1];
        if (value === null || value === undefined) {
          return '';
        }
        return value.toString();
      }
    );
  },

  /**
   * Escape an string so that it can be embedded inside another string
   * as quoted string.
   *
   * @param value {String} string to quote
   * @return {String} an quoted string
   */
  quote: function(value) {
    var
      quotes = /["\\\x00-\x1f\x7f-\x9f]/g,
      subst = {    // table of character substitutions
        '\b': '\\b',
        '\t': '\\t',
        '\n': '\\n',
        '\f': '\\f',
        '\r': '\\r',
        '"' : '\\"',
        '\\': '\\\\'
      };

    return quotes.test(value) ?
      '"' + value.replace(quotes, function (a) {
        var c = subst[a];
        if (c) {
          return c;
        }
        c = a.charCodeAt();
        return '\\u00' + Math.floor(c/16).toString(16) + (c % 16).toString(16);
      }) + '"' :
      '"' + value + '"';
  }
});
