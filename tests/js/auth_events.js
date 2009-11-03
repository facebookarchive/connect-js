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
    FB.Event.subscribe('auth.sessionChange', cb);

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
