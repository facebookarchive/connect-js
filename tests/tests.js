var API_KEY = '48f06bc570aaf9ed454699ec4fe416df';
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
    Mu.status(function(response) {
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
      Mu.status(function(response) {
                  if (response.session) {
                    Mu.api({method: 'Auth.revokeAuthorization'}, function(response) {
                                    ok(!Mu.session(), 'disconnected user');
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

////////////////////////////////////////////////////////////////////////////////
module('auth');
////////////////////////////////////////////////////////////////////////////////
test(
  'should start with no session',

  function() {
    action.onclick = function() {
      Mu.status(function(response) {
                  ok(!response.session, 'should not get a session');
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
      Mu.login(function(response) {
                 ok(!response.session, 'should not get a session');
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
      Mu.login(function(response) {
                 ok(!response.session, 'should not get a session');
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
      Mu.login(function(response) {
                 ok(response.session, 'should get a session');
                 ok(response.status == 'connected', 'should be connected');
                 action.innerHTML = '';
                 action.className = '';
                 start();
               });
    };
    action.innerHTML = 'Login with the "Connect" button';
    action.className = 'login-with-connect-button';

    expect(2);
    stop();
  }
);

test(
  'status should now return a session',

  function() {
    Mu.status(function(response) {
                ok(response.session, 'should get a session');
                ok(response.status == 'connected', 'should be connected');
                start();
              });

    expect(2);
    stop();
  }
);

test(
  'logout',

  function() {
    Mu.logout(function(response) {
                ok(!response.session, 'should not get a session');
                ok(response.status == 'unknown', 'should be unknown');
                start();
              });

    expect(2);
    stop();
  }
);

test(
  'login with email and password',

  function() {
    action.onclick = function() {
      Mu.login(function(response) {
                 ok(response.session, 'should get a session');
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
      Mu.login(function(response) {
                 ok(response.session, 'should still have the session');
                 ok(response.perms == '', 'should get no perms');
                 ok(response.session.expires != 0, 'session.expires should not be 0');
                 ok(response.status == 'connected', 'should be connected');
                 action.innerHTML = '';
                 action.className = '';
                 start();
               }, 'offline_access');
    };
    action.innerHTML = 'Click on "Don\'t Allow"';
    action.className = 'dont-allow-perms';

    expect(4);
    stop();
  }
);

test(
  'allow for offline_access extended permission',

  function() {
    action.onclick = function() {
      Mu.login(function(response) {
                 ok(response.session, 'should get a session');
                 ok(response.perms == 'offline_access', 'should get offline_access perms');
                 ok(response.session.expires == 0, 'session.expires should be 0');
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
    Mu.api({method: 'Auth.revokeAuthorization'}, function(response) {
                    ok(!Mu.session(), 'should not get a session');
                    ok(Mu._userStatus == 'disconnected', 'should be disconnected');
                    start();
                  });

    expect(2);
    stop();
  }
);

test(
  'connect and dont allow for offline_access extended permission',

  function() {
    action.onclick = function() {
      Mu.login(function(response) {
                 ok(response.session, 'should get a session');
                 ok(response.perms == '', 'should not get offline_access perms');
                 ok(response.session.expires != 0, 'session.expires should not be 0');
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
    Mu.api({method: 'Auth.revokeAuthorization'}, function(response) {
                    ok(!Mu.session(), 'should not get a session');
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
      Mu.login(function(response) {
                 ok(response.session, 'should get a session');
                 ok(response.perms == 'offline_access', 'should get offline_access perms');
                 ok(response.session.expires == 0, 'session.expires should be 0');
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
module('publish');
////////////////////////////////////////////////////////////////////////////////
test(
  'publish a post',

  function() {
    action.onclick = function() {
      var post = {
        message: 'I am Test'
      };
      Mu.publish(post, function(published_post) {
                   ok(published_post, 'expect a post object back');
                   ok(published_post.post_id, 'expect a post_id in object');
                   ok(published_post.message == post.message,
                      'expect the message in object');
                   action.innerHTML = '';
                   action.className = '';
                   start();
                 });
    };
    action.innerHTML = 'Publish a Post';
    action.className = 'publish-post';

    expect(3);
    stop();
  }
);

test(
  'skip publishing a post',

  function() {
    action.onclick = function() {
      var post = {
        message: 'I am Test'
      };
      Mu.publish(post, function(result) {
                   ok(!result, 'expect falsy back');
                   action.innerHTML = '';
                   action.className = '';
                   start();
                 });
    };
    action.innerHTML = 'Skip publishing a Post';
    action.className = 'skip-publish-post';

    expect(1);
    stop();
  }
);

test(
  'close publish a window with no callback',

  function() {
    action.onclick = function() {
      var post = {
        message: 'I am Test'
      };
      Mu.publish(post);
      ok(true, 'should not get a error');
      action.innerHTML = '';
      action.className = '';
      start();
    };
    action.innerHTML = 'Close publish window';
    action.className = 'close-publish-post-no-cb';

    expect(1);
    stop();
  }
);

test(
  'close publish a window',

  function() {
    action.onclick = function() {
      var post = {
        message: 'I am Test'
      };
      Mu.publish(post, function(result) {
                   ok(!result, 'expect falsy back');
                   action.innerHTML = '';
                   action.className = '';
                   start();
                 });
    };
    action.innerHTML = 'Close publish window';
    action.className = 'close-publish-post';

    expect(1);
    stop();
  }
);

////////////////////////////////////////////////////////////////////////////////
module('silent revoke');
////////////////////////////////////////////////////////////////////////////////
test(
  'revoke authorization',

  function() {
    Mu.api({method: 'Auth.revokeAuthorization'}, function(response) {
                    ok(!Mu.session(), 'should not get a session');
                    start();
                  });

    expect(1);
    stop();
  }
);

////////////////////////////////////////////////////////////////////////////////
module('session subscribers');
////////////////////////////////////////////////////////////////////////////////
test(
  'verify subscriber gets notified on disconnect',

  function() {
    var expected = 5;

    Mu.status(function(response) {
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

////////////////////////////////////////////////////////////////////////////////
module('flash API');
////////////////////////////////////////////////////////////////////////////////
test(
  'check for zuck\'s name',

  function() {
    Mu.RestServer.flash(
      {
        method: 'fql.query',
        query: 'SELECT name FROM user WHERE uid=4'
      },
      function(r) {
        ok(r[0].name == 'Mark Zuckerberg', 'should get zuck\'s name');
        start();
      }
    );

    expect(1);
    stop();
  }
);

////////////////////////////////////////////////////////////////////////////////
module('cleanup');
////////////////////////////////////////////////////////////////////////////////
test(
  'revoke authorization',

  function() {
    Mu.api({method: 'Auth.revokeAuthorization'}, function(response) {
                    ok(!Mu.session(), 'should not get a session');
                    start();
                  });

    expect(1);
    stop();
  }
);
