////////////////////////////////////////////////////////////////////////////////
module('content');
////////////////////////////////////////////////////////////////////////////////

test(
  'error if fb-root is missing',

  function() {
    expect(3);

    var fbRoot = document.getElementById('fb-root');
    fbRoot.id = 'not-fb-root';
    var logCb = function(msg) {
      ok(msg == 'The "fb-root" div has not been created.',
         'got a log message that the root was not found.');
    };
    FB.Event.on('fb.log', logCb);
    var html = '<div id="test-div">test div</div>';
    var div = FB.Content.append(html);
    ok(!div, 'div was not inserted');
    ok(!document.getElementById('test-div'), 'expect it to not be in the DOM');
    FB.Event.unsubscribe('fb.log', logCb);
    // put it back
    fbRoot.id = 'fb-root';
  }
);

test(
  'append some HTML markup',

  function() {
    var html = '<div id="test-div">test div</div>';
    var div = FB.Content.append(html);
    ok(div.firstChild.id == 'test-div', 'expect the correct id back in the first child');
    ok(document.getElementById('test-div'), 'expect it to be in the DOM');
    ok(document.getElementById('test-div').innerHTML == 'test div',
       'expect the correct inner html');
    div.parentNode.removeChild(div);
  }
);

test(
  'append a node',

  function() {
    var div = document.createElement('div');
    div.id = 'test-div';
    div.innerHTML = 'test div';
    var returnedDiv = FB.Content.append(div);
    ok(returnedDiv.id == 'test-div', 'expect the correct id back');
    ok(document.getElementById('test-div'), 'expect it to be in the DOM');
    ok(document.getElementById('test-div').innerHTML == 'test div',
       'expect the correct inner html');
    returnedDiv.parentNode.removeChild(returnedDiv);
  }
);

test(
  'append a node with custom root',

  function() {
    var root = document.createElement('div');
    var div = document.createElement('div');
    div.id = 'test-div';
    div.innerHTML = 'test div';
    var returnedDiv = FB.Content.append(div, root);
    ok(returnedDiv.id == 'test-div', 'expect the correct id back');
    ok(root.firstChild.id == 'test-div', 'expect the correct id back in the firstChild');
  }
);

test(
  'append some hidden HTML markup',

  function() {
    var html = '<div id="test-div">test div</div>';
    var div = FB.Content.hidden(html);
    ok(div.firstChild.id == 'test-div', 'expect the correct id back in the first child');
    ok(document.getElementById('test-div'), 'expect it to be in the DOM');
    ok(document.getElementById('test-div').innerHTML == 'test div',
       'expect the correct inner html');
    div.parentNode.removeChild(div);
  }
);

test(
  'iframe onload handler',

  function() {
    expect(1);
    stop();

    // doesnt really matter as long as the host will respond
    var
      url = 'http://static.ak.fbcdn.net/connect/xd_proxy.php',
      root = document.getElementById('fb-root'),
      onload = function() {
        ok(true, 'onload callback was invoked');
        iframe.parentNode.removeChild(iframe);
        start();
      },
      iframe = FB.Content.iframe(url, root, onload);
  }
);
