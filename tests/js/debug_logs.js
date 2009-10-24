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
    expectLog('FB.loginStatus() called before calling FB.init()');
    FB.loginStatus();
  }
);

test(
  'FB.login without api key',

  function() {
    expect(1);
    stop();
    expectLog('FB.login() called before calling FB.init()');
    FB.login();
  }
);

test(
  'FB.logout without api key',

  function() {
    expect(1);
    stop();
    expectLog('FB.logout() called before calling FB.init()');
    FB.logout();
  }
);
