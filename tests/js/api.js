// all the API functions share the signature, so we use the same test with all
// of them. it also ensures we have parity between them.
//
// pad: is used to "fake" a large request (>2k) to trigger the automatic
// failure of jsonp which is used by default
var runAPI = function(impl, pad) {
  var query = 'SELECT name FROM user WHERE uid=4';
  if (pad) {
    while (query.length < 2000) {
      query += ' ';
    }
  }

  impl(
    {
      method: 'fql.query',
      query: query
    },
    function(r) {
      ok(r[0].name == 'Mark Zuckerberg', 'should get zuck\'s name');
      start();
    }
  );
};

////////////////////////////////////////////////////////////////////////////////
module('API');
////////////////////////////////////////////////////////////////////////////////
test(
  'check for zuck\'s name using api',

  function() {
    runAPI(FB.api);
    expect(1);
    stop();
  }
);

////////////////////////////////////////////////////////////////////////////////
module('jsonp API');
////////////////////////////////////////////////////////////////////////////////
test(
  'check for zuck\'s name using jsonp',

  function() {
    runAPI(FB.RestServer.jsonp);
    expect(1);
    stop();
  }
);

////////////////////////////////////////////////////////////////////////////////
module('flash API');
////////////////////////////////////////////////////////////////////////////////
test(
  'check for zuck\'s name using flash',

  function() {
    runAPI(FB.RestServer.flash);
    expect(1);
    stop();
  }
);

////////////////////////////////////////////////////////////////////////////////
module('padded call to trigger >2k request flow');
////////////////////////////////////////////////////////////////////////////////
test(
  'check for zuck\'s name using POST api call',

  function() {
    runAPI(FB.api, true);
    expect(1);
    stop();
  }
);

////////////////////////////////////////////////////////////////////////////////
module('signature flow using pre-baked session');
////////////////////////////////////////////////////////////////////////////////
test(
  'check for zuck\'s name using signed api request',

  function() {
    var oldStatus = FB._userStatus;
    var oldSession = FB._session;
    FB.Auth.setSession(VALID_OFFLINE_SESSION, 'connected');
    runAPI(FB.api);
    expect(1);
    stop();
    FB.Auth.setSession(oldSession, oldStatus);
  }
);
