/**
 * Copyright Facebook Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @provides fb.tests.cookie
 * @requires fb.tests.qunit
 *           fb.auth
 */
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
      expires: (1000000 + (+new Date())) / 1000,
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
//TODO: Expand this test when there are unit tests running/mocking secure connections
//This test is a bit weak, but since the prior tests demonstrate that Cookie.set adds
//non-secure cookies, it at least demonstrates that the code runs and specify the
//secure option changes the behavior.
test(
  'set a secure cookie and verify not present on non-secure page',

  function() {
	var origApiKey = FB._apiKey;
	var docCookie;
	expect(2);
	FB._apiKey = cookieApiKey;

	FB.Cookie.set({
	  expires: (1000000 + (+new Date())) / 1000,
	  base_domain: document.domain,
	  secure: true
	});
	docCookie = document.cookie.match('fbs_' + cookieApiKey);
	ok(!(document.location.protocol == 'https:'), "test running on non-secure page");
	ok(!(docCookie), 'secure cookie not applied to non-secure document');
	FB.Cookie.clear();
	FB._apiKey = origApiKey;
  }
);
