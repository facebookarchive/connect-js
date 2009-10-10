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
