////////////////////////////////////////////////////////////////////////////////
module('flash');
////////////////////////////////////////////////////////////////////////////////

test(
  'flash has minimum version',

  function() {
    ok(FB.Flash.hasMinVersion(), 'should have minimum flash version');
  }
);

test(
  'flash ready callback',

  function() {
    ok(!document.XdComm, 'should not have already initialized flash');

    FB.Flash.onReady(function() {
      ok(true, 'got the first onReady callback');
      FB.Flash.onReady(function() {
        ok(true, 'got the second onReady callback');
        start();
      });
    });

    expect(3);
    stop();
  }
);
