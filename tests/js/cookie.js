////////////////////////////////////////////////////////////////////////////////
module('cookie');
////////////////////////////////////////////////////////////////////////////////

var cookieApiKey = 'fakeapikey';

test(
  'clear existing cookie if necessary',

  function() {
    var origApiKey = FB._apiKey;
    FB._apiKey = cookieApiKey;
    FB.Cookie.clear();
    ok(true, 'cookie cleared without errors');
    FB._apiKey = origApiKey;
  }
);

test(
  'load cookie that doesnt exist',

  function() {
    var origApiKey = FB._apiKey;
    FB._apiKey = cookieApiKey;

    ok(!FB.Cookie.load(), 'should not get a cookie');

    FB._apiKey = origApiKey;
  }
);

test(
  'set a cookie, load and delete it',

  function() {
    var origApiKey = FB._apiKey;
    FB._apiKey = cookieApiKey;

    FB.Cookie.set({
      expires: (10000 + (+new Date())) / 1000,
      base_domain: document.domain,
      answer: 42
    });
    ok(document.cookie.match('fbs_' + cookieApiKey),
       'found in document.cookie');
    ok(FB.Cookie.load().answer == 42, 'found the answer');
    FB.Cookie.clear();
    ok(!document.cookie.match('fbs_' + cookieApiKey),
       'not found in document.cookie');
    ok(!FB.Cookie.load(), 'no cookie loaded');

    FB._apiKey = origApiKey;
  }
);

test(
  'set an expired cookie and load it',

  function() {
    var origApiKey = FB._apiKey;
    FB._apiKey = cookieApiKey;

    FB.Cookie.set({
      expires: ((+new Date()) - 10000) / 1000,
      base_domain: document.domain,
      answer: 42
    });
    ok(!document.cookie.match('fbs_' + cookieApiKey),
       'not found in document.cookie');
    ok(!FB.Cookie.load(), 'no cookie loaded');

    FB._apiKey = origApiKey;
  }
);
