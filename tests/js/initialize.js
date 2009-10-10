var API_KEY = '48f06bc570aaf9ed454699ec4fe416df';
var addFriendId = 5526183;


////////////////////////////////////////////////////////////////////////////////
module('initialize');
////////////////////////////////////////////////////////////////////////////////

test(
  'api key',

  function() {
    Mu.init({ apiKey: API_KEY, cookie: false });
    ok(Mu._apiKey == API_KEY, 'should have the api key');
  }
);

test(
  'get some status',

  function() {
    Mu.watchStatus(function(response) {
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
      Mu.watchStatus(function(response) {
        if (response.session) {
          Mu.api(
            { method: 'Auth.revokeAuthorization' },
            function(response) {
              ok(!Mu.getSession(), 'notConnected user');
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
