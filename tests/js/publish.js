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
 * @provides fb.tests.publish
 * @requires fb.tests.qunit
 *           fb.ui
 */
////////////////////////////////////////////////////////////////////////////////
module('publish');
////////////////////////////////////////////////////////////////////////////////
test(
  'publish a post',

  function() {
    action.onclick = function() {
      var post = {
        message: 'I am Test'
      };
      FB.publish(post, function(published_post) {
        ok(published_post, 'expect a post object back');
        ok(published_post.post_id, 'expect a post_id in object');
        action.innerHTML = '';
        action.className = '';
        start();
      });
    };
    action.innerHTML = 'Publish a Post';
    action.className = 'publish-post';

    expect(2);
    stop();
  }
);

test(
  'skip publishing a post',

  function() {
    action.onclick = function() {
      var post = {
        message: 'I am Test'
      };
      FB.publish(post, function(result) {
        ok(!result, 'expect falsy back');
        action.innerHTML = '';
        action.className = '';
        start();
      });
    };
    action.innerHTML = 'Skip publishing a Post';
    action.className = 'skip-publish-post';

    expect(1);
    stop();
  }
);

test(
  'close publish a window with no callback',

  function() {
    action.onclick = function() {
      var post = {
        message: 'I am Test'
      };
      FB.publish(post);
      ok(true, 'should not get a error');
      action.innerHTML = '';
      action.className = '';
      start();
    };
    action.innerHTML = 'Close publish window';
    action.className = 'close-publish-post-no-cb';

    expect(1);
    stop();
  }
);

test(
  'close publish a window',

  function() {
    action.onclick = function() {
      var post = {
        message: 'I am Test'
      };
      FB.publish(post, function(result) {
        ok(!result, 'expect falsy back');
        action.innerHTML = '';
        action.className = '';
        start();
      });
    };
    action.innerHTML = 'Close publish window';
    action.className = 'close-publish-post';

    expect(1);
    stop();
  }
);
