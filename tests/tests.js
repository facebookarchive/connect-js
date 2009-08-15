////////////////////////////////////////////////////////////////////////////////
Mu.init('48f06bc570aaf9ed454699ec4fe416df', '../xd.html');


var action = document.getElementById('action');

////////////////////////////////////////////////////////////////////////////////
module('auth');
////////////////////////////////////////////////////////////////////////////////
test(
  'should start with no session',

  function() {
    Mu.status(function(session) {
                ok(!session, 'should not get a session');
                start();
              });

    expect(1);
    stop();
  }
);

test(
  'cancel login using cancel button',

  function() {
    action.innerHTML = 'Click the Cancel Button on the Login Popup';
    action.onclick = function() {
      Mu.login(function(session) {
                 ok(!session, 'should not get a session');
                 action.innerHTML = '';
                 start();
               });
    };

    expect(1);
    stop();
  }
);

test(
  'cancel login using OS chrome',

  function() {
    action.innerHTML = 'Close the Login Popup Window using the OS Chrome';
    action.onclick = function() {
      Mu.login(function(session) {
                 ok(!session, 'should not get a session');
                 action.innerHTML = '';
                 start();
               });
    };

    expect(1);
    stop();
  }
);

test(
  'login with username and password',

  function() {
    action.innerHTML = 'Login with your username and password';
    action.onclick = function() {
      Mu.login(function(session) {
                 ok(session, 'should get a session');
                 action.innerHTML = '';
                 start();
               });
    };

    expect(1);
    stop();
  }
);

test(
  'status should now return a session',

  function() {
    Mu.status(function(session) {
                ok(session, 'should get a session');
                start();
              });

    expect(1);
    stop();
  }
);

test(
  'revoke authorization',

  function() {
    Mu.disconnect(function(session) {
                    ok(!session, 'should not get a session');
                    start();
                  });

    expect(1);
    stop();
  }
);

test(
  'login with the "Connect" button',

  function() {
    action.innerHTML = 'Login with the "Connect" button';
    action.onclick = function() {
      Mu.login(function(session) {
                 ok(session, 'should get a session');
                 action.innerHTML = '';
                 start();
               });
    };

    expect(1);
    stop();
  }
);

test(
  'dont allow for offline_access extended permission',

  function() {
    action.innerHTML = 'Click on "Don\'t Allow"';
    action.onclick = function() {
      Mu.login(function(session, perms) {
                 ok(session, 'should still have the session');
                 ok(perms == '', 'should get no perms');
                 ok(session.expires != 0, 'session.expires should not be 0');
                 action.innerHTML = '';
                 start();
               }, 'offline_access');
    };

    expect(3);
    stop();
  }
);

test(
  'allow for offline_access extended permission',

  function() {
    action.innerHTML = 'Click on "Allow"';
    action.onclick = function() {
      Mu.login(function(session, perms) {
                 ok(session, 'should get a session');
                 ok(perms == 'offline_access', 'should get offline_access perms');
                 ok(session.expires == 0, 'session.expires should be 0');
                 action.innerHTML = '';
                 start();
               }, 'offline_access');
    };

    expect(3);
    stop();
  }
);

test(
  'revoke authorization',

  function() {
    Mu.disconnect(function(session) {
                    ok(!session, 'should not get a session');
                    start();
                  });

    expect(1);
    stop();
  }
);

test(
  'connect and dont allow for offline_access extended permission',

  function() {
    action.innerHTML = 'Click on "Connect" and then "Dont Allow"';
    action.onclick = function() {
      Mu.login(function(session, perms) {
                 ok(session, 'should get a session');
                 ok(perms == '', 'should not get offline_access perms');
                 ok(session.expires != 0, 'session.expires should not be 0');
                 action.innerHTML = '';
                 start();
               }, 'offline_access');
    };

    expect(3);
    stop();
  }
);

test(
  'revoke authorization',

  function() {
    Mu.disconnect(function(session) {
                    ok(!session, 'should not get a session');
                    start();
                  });

    expect(1);
    stop();
  }
);

test(
  'connect and allow for offline_access extended permission',

  function() {
    action.innerHTML = 'Click on "Connect" and then "Allow"';
    action.onclick = function() {
      Mu.login(function(session, perms) {
                 ok(session, 'should get a session');
                 ok(perms == 'offline_access', 'should get offline_access perms');
                 ok(session.expires == 0, 'session.expires should be 0');
                 action.innerHTML = '';
                 start();
               }, 'offline_access');
    };

    expect(3);
    stop();
  }
);

test(
  'revoke authorization',

  function() {
    Mu.disconnect(function(session) {
                    ok(!session, 'should not get a session');
                    start();
                  });

    expect(1);
    stop();
  }
);
