////////////////////////////////////////////////////////////////////////////////
module('content');
////////////////////////////////////////////////////////////////////////////////

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
