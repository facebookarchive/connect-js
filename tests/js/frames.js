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
 */
////////////////////////////////////////////////////////////////////////////////
module('frames');
////////////////////////////////////////////////////////////////////////////////
test(
  'open a popup',

  function() {
    // doesnt actually matter what the url is
    var url = 'http://static.ak.fbcdn.net/connect/xd_proxy.php';
    var id = 'testframe1';
    FB.Frames.popup(url, 300, 300, id);
    ok(FB.Frames._active[id], 'found active popup');
    FB.Frames._active[id].close();
    delete FB.Frames._active[id];
  }
);

test(
  'open a popup with default callback and close popup',

  function() {
    expect(3);
    stop();

    // doesnt actually matter what the url is
    var url = 'http://static.ak.fbcdn.net/connect/xd_proxy.php';
    var id = 'testframe1';
    var unusedDefaultCbUrl = FB.Frames.xdHandler(function(response) {
      ok(true, 'default callback was invoked');
      start();
    }, id, 'parent', true);
    ok(FB.Frames._defaultCb[id], 'found default callback');

    FB.Frames.popup(url, 300, 300, id);
    ok(FB.Frames._active[id], 'found active popup');

    // wait 300ms before closing the window
    window.setTimeout(function() {
      FB.Frames._active[id].close();
    }, 300);
  }
);

test(
  'xxRESULTTOKENxx handler',

  function() {
    expect(1);
    stop();

    var id = 'testframe2';
    var xdResultHandler = FB.Frames.xdResult(function(result) {
      ok(result.answer == 42, 'found the answer');
      start();
    }, id, 'parent', false);

    // replace the "xxRESULTTOKENxx"
    xdResultHandler = xdResultHandler.replace(
      encodeURIComponent('"xxRESULTTOKENxx"'),
      encodeURIComponent('{"answer":42}')
    );

    FB.Frames.hidden(xdResultHandler, id);
  }
);
