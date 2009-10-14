////////////////////////////////////////////////////////////////////////////////
module('xfbml core');
////////////////////////////////////////////////////////////////////////////////

test(
  'processXFBML callback',

  function() {
    expect(1);
    stop();

    var xfbml = document.getElementById('xfbml');
    xfbml.innerHTML = '';
    Mu.processXFBML(xfbml, function() {
      ok(true, 'callback was invoked');
      start();
    });
  }
);

test(
  'processXFBML callback with single login-button',

  function() {
    expect(2);
    stop();

    var xfbml = document.getElementById('xfbml');
    xfbml.innerHTML = '<fb:login-button autologoutlink="true"></fb:login-button>';
    ok(!xfbml.firstChild.firstChild, 'no child to start with');
    Mu.processXFBML(xfbml, function() {
      ok(xfbml.firstChild.firstChild, 'callback was invoked, and a new child was found');
      xfbml.innerHTML = '';
      start();
    });
  }
);

test(
  'getElements for login-button',

  function() {
    var xfbml = document.getElementById('xfbml');
    xfbml.innerHTML = '<fb:login-button autologoutlink="true"></fb:login-button>';
    ok(Mu.XFBML.getElements(xfbml, 'login-button')[0], 'found element');
    ok(!xfbml.firstChild.firstChild, 'no child to start with');
    xfbml.innerHTML = '';
  }
);



////////////////////////////////////////////////////////////////////////////////
module('xfbml attr');
////////////////////////////////////////////////////////////////////////////////

test(
  'Attr.any validator',

  function() {
    var any = Mu.XFBML.Attr.any();
    ok(any('42') == '42', 'get back 42');
    ok(any(false) == false, 'get back boolean false');
    ok(any(true) == true, 'get back boolean true');
    ok(any(null) == null, 'get back null');
    ok(any(undefined) == undefined, 'get back undefined');

    var anyDef = Mu.XFBML.Attr.any('42');
    ok(anyDef('42') == '42', 'get back 42');
    ok(anyDef(false) == false, 'get back boolean false');
    ok(anyDef(true) == true, 'get back boolean true');
    ok(anyDef(null) == null, 'get back null');
    ok(anyDef(undefined) == '42', 'get back default 42');
    ok(anyDef() == '42', 'get back default 42');
  }
);

test(
  'Attr.bool validator',

  function() {
    var bool = Mu.XFBML.Attr.bool();
    ok(bool('42') == false, 'get back false');
    ok(bool(false) == false, 'get back boolean false');
    ok(bool(true) == true, 'get back boolean true');
    ok(bool(null) == undefined, 'get back default undefined for null');
    ok(bool(undefined) == undefined, 'get back undefined');

    var boolDef = Mu.XFBML.Attr.bool(true);
    ok(boolDef('42') == false, 'get back false');
    ok(boolDef(false) == false, 'get back boolean false');
    ok(boolDef(true) == true, 'get back boolean true');
    ok(boolDef(null) == true, 'get back default default boolean true for null');
    ok(boolDef(undefined) == true, 'get back default boolean true');
    ok(boolDef() == true, 'get back default boolean true');
  }
);

test(
  'Attr.integer validator',

  function() {
    var integer = Mu.XFBML.Attr.integer();
    ok(integer('42') == 42, 'get back 42');
    ok(integer(false) == undefined, 'get back default undefined');
    ok(integer(true) == undefined, 'get back default undefined');
    ok(integer(null) == undefined, 'get back default undefined');
    ok(integer(undefined) == undefined, 'get back default undefined');
    ok(integer('abc') == undefined, 'get back default undefined');
    ok(integer('1.1') == 1, 'get back default undefined');

    var integerDef = Mu.XFBML.Attr.integer(43);
    ok(integerDef('42') == 42, 'get back false');
    ok(integerDef(false) == 43, 'get back default 43');
    ok(integerDef(true) == 43, 'get back default 43');
    ok(integerDef(null) == 43, 'get back default 43');
    ok(integerDef(undefined) == 43, 'get back default 43');
    ok(integerDef() == 43, 'get back default 43');
  }
);

test(
  'Attr.size validator',

  function() {
    var size = Mu.XFBML.Attr.size();
    ok(size('42') == '42px', 'get back 42px');
    ok(size(42) == '42px', 'get back 42px');
    ok(size('42%') == '42%', 'get back 42%');
    ok(size('42em') == '42em', 'get back 42em');
    ok(size('42pt') == '42pt', 'get back 42pt');
    ok(size('42 blah') == '42px', 'get back 42px');
    ok(size('') == undefined, 'get back default undefined');

    var sizeDef = Mu.XFBML.Attr.size('42px');
    ok(sizeDef('43') == '43px', 'get back 43px');
    ok(sizeDef(false) == '42px', 'get back default 42px');
    ok(sizeDef(true) == '42px', 'get back default 42px');
    ok(sizeDef(null) == '42px', 'get back default 42px');
    ok(sizeDef(undefined) == '42px', 'get back default 42px');
    ok(sizeDef() == '42px', 'get back default 42px');
  }
);

test(
  'Attr.ienum validator',

  function() {
    var ienum = Mu.XFBML.Attr.ienum('42', ['40', '41', '42']);
    ok(ienum(false) == '42', 'get back default 42');
    ok(ienum(true) == '42', 'get back default 42');
    ok(ienum(null) == '42', 'get back default 42');
    ok(ienum(undefined) == '42', 'get back default 42');
    ok(ienum() == '42', 'get back default 42');
    ok(ienum('40') == '40', 'get back 40');
    ok(ienum('41') == '41', 'get back 41');
    ok(ienum('42') == '42', 'get back 42');
  }
);

test(
  'Attr.uid validator',

  function() {
    // muck with the internal session so we know what to expect
    var origSession = Mu._session;
    Mu._session = null;
    var uid = Mu.XFBML.Attr.uid();
    ok(uid(false) == null, 'get back null');
    ok(uid(true) == true, 'get back true');
    ok(uid(null) == null, 'get back null');
    ok(uid(undefined) == undefined, 'get back undefined');
    ok(uid('123') == '123', 'get back 123');
    ok(uid() == undefined, 'get back default undefined');

    Mu._session = { uid: '42' };
    ok(uid() == '42', 'get back default 42');
    Mu._session = origSession;
  }
);
