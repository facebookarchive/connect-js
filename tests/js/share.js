////////////////////////////////////////////////////////////////////////////////
module('share');
////////////////////////////////////////////////////////////////////////////////

test(
  'share without calling FB.init',

  function() {
    action.onclick = function() {
      ok(true, 'clicked on button');
      FB.share('http://www.friendfeed.com/');
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
