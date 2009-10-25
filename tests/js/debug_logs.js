// sets up a one time expected log call
var expectLog = function(expectMsg) {
  var cb = function(gotMsg) {
    ok(gotMsg == expectMsg, 'got expected log message');
    FB.Event.unsubscribe('fb.log', cb);
    start();
  };
  FB.Event.subscribe('fb.log', cb);
};

////////////////////////////////////////////////////////////////////////////////
module('debug logging');
////////////////////////////////////////////////////////////////////////////////
test(
  'FB.loginStatus without api key',

  function() {
    expect(1);
    stop();
    expectLog('FB.loginStatus() called before calling FB.init().');
    FB.loginStatus();
  }
);

test(
  'FB.login without api key',

  function() {
    expect(1);
    stop();
    expectLog('FB.login() called before calling FB.init().');
    FB.login();
  }
);

test(
  'FB.logout without api key',

  function() {
    expect(1);
    stop();
    expectLog('FB.logout() called before calling FB.init().');
    FB.logout();
  }
);

test(
  'FB.logout with api key but without session',

  function() {
    expect(1);
    stop();
    var oldApiKey = FB._apiKey;
    var oldSession = FB._session;
    FB._apiKey = 'dummy';
    FB._session = null;
    expectLog('FB.logout() called without a session.');
    FB.logout();
    FB._apiKey = oldApiKey;
    FB._session = oldSession;
  }
);

test(
  'FB.init api key',

  function() {
    expect(1);

    var logCb = function(msg) {
      ok(msg == 'FB.init() called without an apiKey.',
         'got the expected log message that the apiKey was not found.');
    };
    FB.Event.subscribe('fb.log', logCb);
    FB.init();
    FB.Event.unsubscribe('fb.log', logCb);
  }
);
