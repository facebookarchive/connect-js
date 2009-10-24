////////////////////////////////////////////////////////////////////////////////
module('qs');
////////////////////////////////////////////////////////////////////////////////

test(
  'query string encoding',

  function() {
    ok(FB.QS.encode({}) == '', 'empty object should give back empty string');
    ok(FB.QS.encode({a: 1}) == 'a=1', 'single key value');
    ok(FB.QS.encode({a: 1, b: 2}) == 'a=1&b=2', 'multiple key value');
    ok(FB.QS.encode({b: 2, a: 1}) == 'a=1&b=2', 'sorted multiple key value');
  }
);

test(
  'query string encoding with custom separator',

  function() {
    ok(FB.QS.encode({}, ';') == '',
       'empty object should give back empty string');
    ok(FB.QS.encode({a: 1}, ';') == 'a=1', 'single key value');
    ok(FB.QS.encode({a: 1, b: 2}, ';') == 'a=1;b=2', 'multiple key value');
    ok(FB.QS.encode({b: 2, a: 1}, ';') == 'a=1;b=2',
       'sorted multiple key value');
  }
);

test(
  'query string explicit encoding control',

  function() {
    var params = {'a b c': 'd e f'};
    ok(FB.QS.encode(params) == 'a%20b%20c=d%20e%20f', 'encoded query string');
    ok(FB.QS.encode(params, '&', false) == 'a b c=d e f',
       'unencoded query string');
  }
);

test(
  'query string decoding',

  function() {
    var single = FB.QS.decode('a=1');
    ok(single.a == 1, 'single value decode');

    var multiple = FB.QS.decode('a=1&b=2');
    ok(multiple.a == 1, 'expect a == 1 in multiple');
    ok(multiple.b == 2, 'expect b == 2 in multiple');

    var encoded = FB.QS.decode('a%20b%20c=d%20e%20f');
    ok(encoded['a b c'] == 'd e f', 'expect decoded key and value');
  }
);
