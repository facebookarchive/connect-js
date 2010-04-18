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
 * @provides fb.tests.xfbmltags
 * @requires fb.tests.qunit
 *           fb.xfbml
 *           fb.tests.xfbmltest
 */
////////////////////////////////////////////////////////////////////////////////
module('xfbmltags');
////////////////////////////////////////////////////////////////////////////////

test(
  'fb:profile-pic',

  function() {
    XTest.expect(6);
    XTest.regex('<fb:profile-pic uid="676075965"></fb:profile-pic>',
      'href="' + FB._domain.www + 'profile.php.id=676075965"'
      +'.*<img.*src="http://profile.ak.fbcdn.net/.*.jpg".*>');

    XTest.regex('<fb:profile-pic uid="676075965"></fb:profile-pic>',
      'href="' + FB._domain.www + 'profile.php.id=676075965"'
      +'.*<img.*alt="luke t shepard".*>');

    // note that we pass in 64 x 100, but the longer one is cropped since the
    // image is square
    XTest.regex(
      (
        '<fb:profile-pic uid="676075965" width="64" height="100">' +
        '</fb:profile-pic>'
      ),
      'style=.*width: ?64px;.*height: ?64px'
    );

    // add the logo
    XTest.regex(
      '<fb:profile-pic uid="676075965" facebook-logo="true"></fb:profile-pic>',
      '<img.*safe_image.php'
    );

    // default pic for a non-user
    XTest.regex('<fb:profile-pic uid="2"></fb:profile-pic>',
                't_silhouette.jpg');

    // this doesn't really work if the user's not logged in but at least we see
    // a default
    XTest.regex('<fb:profile-pic uid="loggedinuser"></fb:profile-pic>',
                't_silhouette.jpg');
  }
);

test(
  'fb:name',

  function() {
    XTest.expect(5);

    XTest.regex('<fb:name uid="676075965"></fb:name>',
        'href="' + FB._domain.www + 'profile.php.id=676075965"'
        +'.*Luke T Shepard');

    XTest.regex('<fb:name uid="676075965" firstnameonly="true"></fb:name>',
        '>Luke<');

    XTest.regex('<fb:name uid="676075965" lastnameonly="true"></fb:name>',
        '>Shepard<');

    XTest.regex('<fb:name uid="676075965" linked="false"></fb:name>',
                '^Luke T Shepard$');

    // need a better test for capitalization, is there any test acct without it
    // capped?
    XTest.regex('<fb:name uid="676075965" capitalize="true"></fb:name>',
                'Luke', true);

    // TODO: the whole pronoun rendering bit
  }
);

test(
  'fb:login-button',

  function() {
    XTest.expect(1);
    XTest.regex('<fb:login-button></fb:login-button>',
               'fb_button');
  }
);

test(
  'fb:login',

  function() {
    XTest.expect(1);
    XTest.regex(
      '<fb:login></fb:login>',
      'iframe.*plugins/login.php'
    );
  }
);

test(
  'fb:share-button',

  function() {
    XTest.expect(1);
    XTest.regex('<fb:share-button></fb:share-button>', 'share');
  }
);

test(
  'fb:fan',

  function() {
    XTest.expect(1);
    XTest.regex(
      '<fb:fan name="platform"></fb:fan>',
      'iframe.*plugins/fan.php'
    );
  }
);

test(
  'fb:like-box',

  function() {
    XTest.expect(1);
    XTest.regex(
      '<fb:fan name="platform"></fb:fan>',
      'iframe.*plugins/likebox.php'
    );
  }
);

test(
  'fb:activity',

  function() {
    XTest.expect(1);
    XTest.regex(
      '<fb:activity site="cnn.com"></fb:activity>',
      'iframe.*plugins/activity.php'
    );
  }
);

test(
  'fb:recommendations',

  function() {
    XTest.expect(1);
    XTest.regex(
      '<fb:recommendations site="cnn.com"></fb:recommendations>',
      'iframe.*plugins/recommendations.php'
    );
  }
);

test(
  'fb:live-stream',

  function() {
    XTest.expect(1);
    XTest.regex(
      '<fb:live-stream></fb:live-stream>',
      'iframe.*plugins/livefeed.php'
    );
  }
);

test(
  'fb:serverfbml',

  function() {
    XTest.expect(1);
    XTest.regex(
      '<fb:serverfbml fbml="hello world"></fb:serverfbml>',
      'iframe.*serverfbml.php'
    );
  }
);

test(
  'fb:serverfbml with >2k data',

  function() {
    XTest.expect(1);
    var a=[];
    for (var i=1000; i>0; i--) {
      a.push("42 \n");
    }
    a = a.join('');
    XTest.regex('<fb:serverfbml fbml="hello' + a + ' world"></fb:serverfbml>', 'iframe.*about:blank');
  }
);
