var API_KEY = '48f06bc570aaf9ed454699ec4fe416df';
var XD_URL = '../xd.html';
var action = document.getElementById('action');
var addFriendId = 5526183;


////////////////////////////////////////////////////////////////////////////////
module('share');
////////////////////////////////////////////////////////////////////////////////

test(
  'share without calling Mu.init',

  function() {
    action.onclick = function() {
      ok(true, 'clicked on button');
      Mu.share('http://www.friendfeed.com/');
      action.innerHTML = '';
      action.className = '';
      start();
    };
    action.innerHTML = 'Click "Share" to publish the post';
    action.className = 'share-without-init';

    expect(1);
    stop();
  }
);

////////////////////////////////////////////////////////////////////////////////
module('publish sans app');
////////////////////////////////////////////////////////////////////////////////

var PublishData = {
  should: {
  }
};

////////////////////////////////////////////////////////////////////////////////
module('initialize');
////////////////////////////////////////////////////////////////////////////////

test(
  'api key and xd url',

  function() {
    Mu.init(API_KEY, XD_URL);
    ok(Mu._apiKey == API_KEY, 'should have the api key');
    ok(Mu._xdUrl.indexOf('http') === 0, 'xd url should be absolute');
  }
);

////////////////////////////////////////////////////////////////////////////////
module('auth');
////////////////////////////////////////////////////////////////////////////////
test(
  'clear session if exists',

  function() {
    action.onclick = function() {
      Mu.status(function(session) {
                  if (session) {
                    Mu.disconnect(function(session) {
                                    ok(!session, 'disconnected user');
                                    action.innerHTML = '';
                                    action.className = '';
                                    start();
                                  });
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

test(
  'should start with no session',

  function() {
    action.onclick = function() {
      Mu.status(function(session) {
                  ok(!session, 'should not get a session');
                  action.innerHTML = '';
                  action.className = '';
                  start();
                });
    };
    action.innerHTML = 'Click here to get the Status';
    action.className = 'get-status';

    expect(1);
    stop();
  }
);

test(
  'cancel login using cancel button',

  function() {
    action.onclick = function() {
      Mu.login(function(session) {
                 ok(!session, 'should not get a session');
                 action.innerHTML = '';
                 action.className = '';
                 start();
               });
    };
    action.innerHTML = 'Click the Cancel Button on the Login Popup';
    action.className = 'login-cancel-button';

    expect(1);
    stop();
  }
);

test(
  'cancel login using OS chrome',

  function() {
    action.onclick = function() {
      Mu.login(function(session) {
                 ok(!session, 'should not get a session');
                 action.innerHTML = '';
                 action.className = '';
                 start();
               });
    };
    action.innerHTML = 'Close the Login Popup Window using the OS Chrome';
    action.className = 'login-close-window';

    expect(1);
    stop();
  }
);

test(
  'login with the "Connect" button',

  function() {
    action.onclick = function() {
      Mu.login(function(session) {
                 ok(session, 'should get a session');
                 action.innerHTML = '';
                 action.className = '';
                 start();
               });
    };
    action.innerHTML = 'Login with the "Connect" button';
    action.className = 'login-with-connect-button';

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
  'logout',

  function() {
    Mu.logout(function(session) {
                ok(!session, 'should not get a session');
                start();
              });

    expect(1);
    stop();
  }
);

test(
  'login with email and password',

  function() {
    action.onclick = function() {
      Mu.login(function(session) {
                 ok(session, 'should get a session');
                 action.innerHTML = '';
                 action.className = '';
                 start();
               });
    };
    action.innerHTML = 'Login with your email and password';
    action.className = 'login-with-email-pass';

    expect(1);
    stop();
  }
);

test(
  'dont allow for offline_access extended permission',

  function() {
    action.onclick = function() {
      Mu.login(function(session, perms) {
                 ok(session, 'should still have the session');
                 ok(perms == '', 'should get no perms');
                 ok(session.expires != 0, 'session.expires should not be 0');
                 action.innerHTML = '';
                 action.className = '';
                 start();
               }, 'offline_access');
    };
    action.innerHTML = 'Click on "Don\'t Allow"';
    action.className = 'dont-allow-perms';

    expect(3);
    stop();
  }
);

test(
  'allow for offline_access extended permission',

  function() {
    action.onclick = function() {
      Mu.login(function(session, perms) {
                 ok(session, 'should get a session');
                 ok(perms == 'offline_access', 'should get offline_access perms');
                 ok(session.expires == 0, 'session.expires should be 0');
                 action.innerHTML = '';
                 action.className = '';
                 start();
               }, 'offline_access');
    };
    action.innerHTML = 'Click on "Allow"';
    action.className = 'allow-perms';

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
    action.onclick = function() {
      Mu.login(function(session, perms) {
                 ok(session, 'should get a session');
                 ok(perms == '', 'should not get offline_access perms');
                 ok(session.expires != 0, 'session.expires should not be 0');
                 action.innerHTML = '';
                 action.className = '';
                 start();
               }, 'offline_access');
    };
    action.innerHTML = 'Click on "Connect" and then "Dont Allow"';
    action.className = 'connect-and-dont-allow';

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
    action.onclick = function() {
      Mu.login(function(session, perms) {
                 ok(session, 'should get a session');
                 ok(perms == 'offline_access', 'should get offline_access perms');
                 ok(session.expires == 0, 'session.expires should be 0');
                 action.innerHTML = '';
                 action.className = '';
                 start();
               }, 'offline_access');
    };
    action.innerHTML = 'Click on "Connect" and then "Allow"';
    action.className = 'connect-and-allow';

    expect(3);
    stop();
  }
);

////////////////////////////////////////////////////////////////////////////////
module('add friend');
////////////////////////////////////////////////////////////////////////////////

test(
  'cancel add friend',

  function() {
    action.onclick = function() {
      Mu.addFriend(addFriendId, function(result) {
                     ok(!result, 'should not get result');
                     action.innerHTML = '';
                     action.className = '';
                     start();
                   });
    };
    action.innerHTML = 'Close the Add Friend window using the OS Chrome';
    action.className = 'cancel-add-friend';

    expect(1);
    stop();
  }
);

////////////////////////////////////////////////////////////////////////////////
module('share');
////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////
module('publish');
////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////
module('cleanup');
////////////////////////////////////////////////////////////////////////////////
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
