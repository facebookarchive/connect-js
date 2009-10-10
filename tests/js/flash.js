////////////////////////////////////////////////////////////////////////////////
module('flash');
////////////////////////////////////////////////////////////////////////////////

test(
  'flash has minimum version',

  function() {
    ok(Mu.Flash.hasMinVersion(), 'should have minimum flash version');
  }
);

test(
  'flash ready callback',

  function() {
    ok(!document.XdComm, 'should not have already initialized flash');

    Mu.Flash.onReady(function() {
      ok(true, 'got the first onReady callback');
      Mu.Flash.onReady(function() {
        ok(true, 'got the second onReady callback');
        start();
      });
    });

    expect(3);
    stop();
  }
);
