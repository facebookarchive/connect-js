////////////////////////////////////////////////////////////////////////////////
module('sessionChange');
////////////////////////////////////////////////////////////////////////////////
test(
  'verify subscriber gets notified on disconnect',

  function() {
    var expected = 5;

    var cb = function(response) {
      ok(true, 'subscriber got called');
      expected -= 1;
    };
    FB.Event.on('auth.sessionChange', cb);

    action.onclick = function() {
      // 1
      FB.login(function() {
        // 2
        FB.api({method: 'Auth.revokeAuthorization'}, function(response) {
          // 3
          FB.login(function() {
            // 4
            FB.logout(function() {
              // 5
              FB.login(function() {
                // should not trigger subscriber
                FB.login(function() {
                  // 6
                  ok(expected == 0, 'got all expected callbacks');

                  // unsubscribe once we're done
                  FB.Event.unsubscribe('auth.sessionChange', cb);
                  start();
                }, 'email');
              }, 'offline_access');
            });
          });
        });
      });
    };
    action.innerHTML = (
      '"Connect" thrice, "Allow", finally "Dont Allow"');
    action.className = 'session-subscribers';

    expect(expected + 1);
    stop();
  }
);
