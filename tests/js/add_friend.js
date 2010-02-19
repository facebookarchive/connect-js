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
 *
 * @provides fb.tests.addfriend
 * @requires fb.tests.qunit
 *           fb.ui
 */
////////////////////////////////////////////////////////////////////////////////
module('add friend');
////////////////////////////////////////////////////////////////////////////////

test(
  'cancel add friend',

  function() {
    action.onclick = function() {
      FB.addFriend(addFriendId, function(result) {
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
