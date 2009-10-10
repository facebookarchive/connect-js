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
      Mu.publish(post, function(published_post) {
        ok(published_post, 'expect a post object back');
        ok(published_post.post_id, 'expect a post_id in object');
        ok(published_post.message == post.message, 'expect the message in object');
        action.innerHTML = '';
        action.className = '';
        start();
      });
    };
    action.innerHTML = 'Publish a Post';
    action.className = 'publish-post';

    expect(3);
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
      Mu.publish(post, function(result) {
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
      Mu.publish(post);
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
      Mu.publish(post, function(result) {
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
