////////////////////////////////////////////////////////////////////////////////
module('watchStatus');
////////////////////////////////////////////////////////////////////////////////
test(
  'verify subscriber gets notified on disconnect',

  function() {
    var expected = 5;

    Mu.watchStatus(function(response) {
      ok(true, 'subscriber got called');
      expected -= 1;
    }, { change: true, load: false });

    action.onclick = function() {
      // 1
      Mu.login(function() {
        // 2
        Mu.api({method: 'Auth.revokeAuthorization'}, function(response) {
          // 3
          Mu.login(function() {
            // 4
            Mu.logout(function() {
              // 5
              Mu.login(function() {
                // should not trigger subscriber
                Mu.login(function() {
                  // reset the callbacks once we're done with the test.
                  // otherwise, future tests will also trigger the subscriber
                  // causing tests to fail.
                  // 6
                  ok(expected == 0, 'got all expected callbacks');
                  Mu.Auth._callbacks.change = [];
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
