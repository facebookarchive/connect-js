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
