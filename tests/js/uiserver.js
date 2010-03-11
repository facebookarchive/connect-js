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
 * @provides fb.tests.uiserver
 * @requires fb.tests.qunit
 *           fb.ui
 */
////////////////////////////////////////////////////////////////////////////////
module('uiserver');
////////////////////////////////////////////////////////////////////////////////
test(
  'open a popup',

  function() {
    // doesnt actually matter what the url is
    var id = 'testframe1';
    FB.UIServer.popup({
      id: id,
      url: 'http://static.ak.fbcdn.net/connect/xd_proxy.php',
      size: {
        height: 300,
        width: 300
      }
    });
    ok(FB.UIServer._active[id], 'found active popup');
    FB.UIServer._active[id].close();
    delete FB.UIServer._active[id];
  }
);

test(
  'open a popup with default callback and close popup',

  function() {
    expect(3);
    stop();

    // doesnt actually matter what the url is
    var id = 'testframe1';
    var unusedDefaultCbUrl = FB.UIServer._xdNextHandler(function(response) {
      ok(true, 'default callback was invoked');
      start();
    }, id, 'parent', true);
    ok(FB.UIServer._defaultCb[id], 'found default callback');

    FB.UIServer.popup({
      id: id,
      url: 'http://static.ak.fbcdn.net/connect/xd_proxy.php',
      size: {
        height: 300,
        width: 300
      }
    });
    ok(FB.UIServer._active[id], 'found active popup');

    // wait 300ms before closing the window
    window.setTimeout(function() {
      FB.UIServer._active[id].close();
    }, 300);
  }
);

test(
  'xxRESULTTOKENxx handler',

  function() {
    expect(1);
    stop();

    var id = 'testframe2';
    var xdResultHandler = FB.UIServer._xdResult(function(result) {
      ok(result.answer == 42, 'found the answer');
      FB.UIServer._triggerDefault(id);
      start();
    }, id, 'parent', false);

    // replace the "xxRESULTTOKENxx"
    xdResultHandler = xdResultHandler.replace(
      encodeURIComponent('"xxRESULTTOKENxx"'),
      encodeURIComponent('{"answer":42}')
    );

    FB.UIServer.hidden({
      id: id,
      size: {},
      url: xdResultHandler
    });
  }
);

test(
  'prepareCall invalid method',

  function() {
    expect(2);
    stop();

    var cb = function(s) {
      equals(s, '"abc" is an unknown method.', 'expect exception');
      FB.Event.unsubscribe('fb.log', cb);
      start();
    };
    FB.Event.subscribe('fb.log', cb);
    var call = FB.UIServer.prepareCall({ method: 'abc' });
    ok(!call, 'no call object returned');
  }
);

test(
  'prepareCall display cannot be dialog for session less users',

  function() {
    expect(1);
    stop();

    var oldSession = FB._session;
    var oldStatus = FB._userStatus;
    var cb = function(s) {
      equals(s, '"dialog" mode can only be used when the user is connected.',
             'expect an logged message');
      FB._session = oldSession;
      FB._userStatus = oldStatus;
      FB.Event.unsubscribe('fb.log', cb);
      start();
    };
    FB.Event.subscribe('fb.log', cb);
    var call = FB.UIServer.prepareCall({
      method: 'stream.publish',
      display: 'dialog'
    });
  }
);

test(
  'prepareCall stock params',

  function() {
    var call = FB.UIServer.prepareCall({ method: 'stream.publish' });
    equals(call.params.api_key, FB._apiKey, 'expect api key as its set');
    equals(call.params.sdk, 'joey', 'expect sdk param');
    ok(call.params.display, 'expect display');
  }
);

test(
  'prepareCall expect post for >2k data',

  function() {
    var a = [];
    for (var i=1000; i>0; i--) {
      a.push('42 ');
    }
    var call = FB.UIServer.prepareCall({
      method: 'stream.publish',
      dummy: a.join('')
    });
    ok(call.post, 'expect post to be true');
  }
);

test(
  'open a popup using POST',

  function() {
    var a = [];
    for (var i=1000; i>0; i--) {
      a.push('42 ');
    }

    // doesnt actually matter what the url is
    var id = 'testframe1';
    FB.UIServer.popup({
      id: id,
      url: 'http://static.ak.fbcdn.net/connect/xd_proxy.php',
      size: {
        height: 300,
        width: 300
      },
      params: {
        a: a.join('')
      }
    });
    ok(FB.UIServer._active[id], 'found active popup');
    FB.UIServer._active[id].close();
    delete FB.UIServer._active[id];
    //FIXME a better test
  }
);

test(
  'FB.ui missing method',

  function() {
    expect(1);
    stop();
    var cb = function(s) {
      equals(s, '"method" is a required parameter for FB.ui().',
             'expect an logged message');
      FB.Event.unsubscribe('fb.log', cb);
      start();
    };
    FB.Event.subscribe('fb.log', cb);
    FB.ui({});
  }
);

test(
  'FB.ui invalid display',

  function() {
    expect(1);
    stop();
    var cb = function(s) {
      equals(s, '"display" must be one of "popup", "iframe" or "hidden".',
             'expect an logged message');
      FB.Event.unsubscribe('fb.log', cb);
      start();
    };
    FB.Event.subscribe('fb.log', cb);
    FB.ui({ method: 'stream.publish', display: '42' });
  }
);

test(
  'FB.ui invalid method',

  function() {
    expect(1);
    stop();
    var cb = function(s) {
      equals(s, '"42" is an unknown method.', 'expect an logged message');
      FB.Event.unsubscribe('fb.log', cb);
      start();
    };
    FB.Event.subscribe('fb.log', cb);
    FB.ui({ method: '42' });
  }
);

test(
  'FB.ui close using loader loaded using POST',

  function() {
    expect(1);
    stop();

    var a = [];
    for (var i=1000; i>0; i--) {
      a.push("42 43 \n");
    }

    FB.ui(
      {
        method: 'fbml.dialog',
        display: 'dialog',
        fbml: a.join('')
      },
      function() {
        ok(true, 'callback was invoked');
        start();
      }
    );
    window.setTimeout(function() {
      FB.$('fb_dialog_loader_close').onclick();
    }, 100); // 100ms to load the initial about:blank before the POST is done
  }
);
