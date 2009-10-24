var API_KEY = '48f06bc570aaf9ed454699ec4fe416df';
var VALID_OFFLINE_SESSION = {
  session_key : "5070653ddbe6a2efbfb23388-499433185",
  uid         : 499433185,
  expires     : 0,
  secret      : "dc2cd73a596518766ae5f001705a4ce6",
  base_domain : "daaku.org",
  sig         : "c38eede3e5a0244d7190f725ad64a81e"
};
var addFriendId = 5526183;


////////////////////////////////////////////////////////////////////////////////
module('initialize');
////////////////////////////////////////////////////////////////////////////////

test(
  'sans api key',

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

test(
  'apiKey: , debug: true, cookie: true, status: true',

  function() {
    FB.init({ apiKey: API_KEY, debug: true, cookie: true, status: true });
    ok(FB._apiKey == API_KEY, 'should have the api key');
    ok(FB._debug, 'debug is enabled');
    ok(FB.Cookie._initDone, 'cookie init was done');
  }
);

////////////////////////////////////////////////////////////////////////////////
module('clear');
////////////////////////////////////////////////////////////////////////////////
test(
  'clear session if exists',

  function() {
    FB.loginStatus(function(response) {
      if (response.session) {
        FB.api(
          { method: 'Auth.revokeAuthorization' },
          function(response) {
            ok(!FB.getSession(), 'notConnected user');
            action.innerHTML = '';
            action.className = '';
            start();
          }
        );
      } else {
        ok(!FB.getSession(), 'notConnected user');
        action.innerHTML = '';
        action.className = '';
        start();
      }
    });

    expect(1);
    stop();
  }
);

////////////////////////////////////////////////////////////////////////////////
module('cached loginStatus');
////////////////////////////////////////////////////////////////////////////////
test(
  'get cached loginStatus result',

  function() {
    expect(1);

    // this is kind of a fake test. its not possible to tell if the result was
    // a cached result. well, there's a hack - a cached result means the
    // callback is invoked serially meaning the test should work without stop()
    // or start(). yes, ugly hack - but exposing the fact that a result is a
    // cached result seems like unnecessary developer complexity for testing
    // purposes.
    FB.loginStatus(function(response) {
      ok(true, 'got a response');
    });
  }
);
