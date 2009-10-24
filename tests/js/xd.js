////////////////////////////////////////////////////////////////////////////////
module('xd');
////////////////////////////////////////////////////////////////////////////////

test(
  'test default message flow',

  function() {
    FB.XD.init();

    var url = FB.XD.handler(function(response) {
      ok(response.answer == 42, 'expect the answer');
      FB.Frames.xdRecv({frame: 'a'}, function() {});
      start();
    }, 'parent') + '&answer=42';
    FB.Frames.hidden(url, 'a');

    expect(1);
    stop();
  }
);

test(
  'test flash message flow',

  function() {
    FB.XD.Flash.init();
    var oldTransport = FB.XD._transport;
    FB.XD._transport = 'flash';

    var url = FB.XD.handler(function(response) {
      ok(response.answer == 42, 'expect the answer');
      FB.Frames.xdRecv({frame: 'a'}, function() {});
      start();
    }, 'parent') + '&answer=42';

    FB.XD._transport = oldTransport;

    FB.Frames.hidden(url, 'a');

    expect(1);
    stop();
  }
);

test(
  'test fragment message flow',

  function() {
    // Mu itself makes some functions no-ops, but here testing the guts, so we
    // make it a no-op ourselves.
    if (window.location.toString().indexOf(FB.XD.Fragment._magic) > 0) {
      return;
    }

    var oldTransport = FB.XD._transport;
    FB.XD._transport = 'fragment';

    var url = FB.XD.handler(function(response) {
      ok(response.answer == 42, 'expect the answer');
      FB.Frames.xdRecv({frame: 'a'}, function() {});
      start();
    }, 'parent') + '&answer=42';

    FB.XD._transport = oldTransport;

    FB.Frames.hidden(url, 'a');

    expect(1);
    stop();
  }
);
