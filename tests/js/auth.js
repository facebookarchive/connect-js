/**
 * Copyright Facebook Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
////////////////////////////////////////////////////////////////////////////////
module('auth');
////////////////////////////////////////////////////////////////////////////////
test(
  'should start with no session',

  function() {
    FB.getLoginStatus(function(response) {
      ok(!response.session, 'should not get a session');
      action.innerHTML = '';
      action.className = '';
      start();
    });

    expect(1);
    stop();
  }
);

test(
  'cancel login using cancel button',

  function() {
    action.onclick = function() {
      FB.login(function(response) {
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
      FB.login(function(response) {
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
      FB.login(function(response) {
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
    FB.getLoginStatus(function(response) {
      ok(response.session, 'should get a session');
      ok(response.status == 'connected', 'should be connected');
      start();
    });

    expect(2);
    stop();
  }
);

test(
  'FB.login should return the session right away and log a message',

  function() {
    expect(3);
    stop();

    // expected log call
    var cb = function(msg) {
      ok(msg == 'FB.login() called when user is already connected.',
         'got expected log message');
      FB.Event.unsubscribe('fb.log', cb);
    };
    FB.Event.subscribe('fb.log', cb);

    FB.login(function(response) {
      ok(response.session, 'should get a session');
      ok(response.status == 'connected', 'should be connected');
      start();
    });
  }
);

test(
  'logout',

  function() {
    FB.logout(function(response) {
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
      FB.login(function(response) {
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
      FB.login(function(response) {
        ok(response.session, 'should still have the session');
        ok(response.perms == '', 'should get no perms');
        ok(response.session.expires != 0, 'session.expires should not be 0');
        ok(response.status == 'connected', 'should be connected');
        action.innerHTML = '';
        action.className = '';
        start();
      }, {perms: 'offline_access'});
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
      FB.login(function(response) {
        ok(response.session, 'should get a session');
        ok(response.perms == 'offline_access',
           'should get offline_access perms');
        ok(response.session.expires == 0, 'session.expires should be 0');
        action.innerHTML = '';
        action.className = '';
        start();
      }, {perms: 'offline_access'});
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
  FB.api({method: 'Auth.revokeAuthorization'}, function(response) {
    ok(!FB.getSession(), 'should not get a session');
    ok(FB._userStatus == 'notConnected', 'should be notConnected');
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
      FB.login(function(response) {
        ok(response.session, 'should get a session');
        ok(response.perms == '', 'should not get offline_access perms');
        ok(response.session.expires != 0, 'session.expires should not be 0');
        action.innerHTML = '';
        action.className = '';
        start();
      }, {perms: 'offline_access'});
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
  FB.api({method: 'Auth.revokeAuthorization'}, function(response) {
    ok(!FB.getSession(), 'should not get a session');
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
      FB.login(function(response) {
        ok(response.session, 'should get a session');
        ok(response.perms == 'offline_access',
           'should get offline_access perms');
        ok(response.session.expires == 0, 'session.expires should be 0');
        action.innerHTML = '';
        action.className = '';
        start();
      }, {perms: 'offline_access'});
    };
    action.innerHTML = 'Click on "Connect" and then "Allow"';
    action.className = 'connect-and-allow';

    expect(3);
    stop();
  }
);
