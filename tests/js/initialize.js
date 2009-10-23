var API_KEY = '48f06bc570aaf9ed454699ec4fe416df';
var addFriendId = 5526183;


////////////////////////////////////////////////////////////////////////////////
module('initialize');
////////////////////////////////////////////////////////////////////////////////

test(
  'api key',

  function() {
    FB.init({ apiKey: API_KEY, cookie: false });
    ok(FB._apiKey == API_KEY, 'should have the api key');
  }
);

test(
  'get some status',

  function() {
    FB.loginStatus(function(response) {
      ok(true, 'status callback got invoked');
      start();
    });

    expect(1);
    stop();
  }
);

////////////////////////////////////////////////////////////////////////////////
module('clear');
////////////////////////////////////////////////////////////////////////////////
test(
  'clear session if exists',

  function() {
    action.onclick = function() {
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
          ok(true, 'no session found');
          action.innerHTML = '';
          action.className = '';
          start();
        }
      });
    };
    action.innerHTML = 'Clear session if necessary';
    action.className = 'clear-session-if-exists';

    expect(1);
    stop();
  }
);
