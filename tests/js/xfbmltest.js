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
 * @provides fb.tests.xfbmltest
 * @requires fb.tests.qunit
 *           fb.xfbml
 *           fb.content
 */

/**
 * Bag for testing XFBML.
 *
 * @param {String} xfbml  takes an xfbml string
 * @param {Function} cb   callback, takes the html as a param
 */
XTest = {
  /**
   * Define how many XFBML comparisons will be executed
   * in this test.
   *
   * The base QUnit expect() doesn't work here because
   * we want to call start() after all tags have finished,
   * but no later. We can't do them sequentially because
   * it would take too long.
   */
  expect : function(count) {
    XTest.remaining = count;
    expect(count);

    if (XTest.interval) {
      ok(false, "previous interval was not cleared");
      clearInterval(XTest.interval);
    }

    XTest.interval =
      setInterval(function() {
                  if (XTest.remaining <= 0) {
                    if (XTest.remaining < 0) {
                      ok(false, "more tags than expected");
                    }
                    start();
                    clearInterval(XTest.interval);
                    XTest.interval = null;
                  }
                }, 200);
    stop();
  },

  /**
   * Compare the output of an XFBML string with a regular
   * expression.
   *
   * Because different browsers have different capitalizations of
   * their HTML output, by default the comparison is case
   * insensitive.
   */
  regex : function(xfbml, html_regex, case_sensitive, callback) {
    var container = FB.Content.append(xfbml);
    FB.XFBML.parse(container, function() {
      var html = container.childNodes[0].innerHTML;
      if (!case_sensitive) {
        html = html.toLowerCase();
        html_regex = html_regex.toLowerCase();
      }
      var regex = RegExp(html_regex);
      ok(regex.test(html), "match regex " + html_regex + " with " + html);

      container.parentNode.removeChild(container); // clean up
      --XTest.remaining;
      if (XTest.remaining <= 0 && callback) {
        callback();
      }
    });
  },

  remaining : 0,
  interval  : null
};
