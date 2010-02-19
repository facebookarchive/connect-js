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
 * @provides fb.console
 */
$ = function(i) { return document.getElementById(i); };


// publish something
function publishExample() {
  var post = {
    message: 'This is some text',
    action_links: [
      { text:'custom action link', href:'http://github.com/facebook/connect-js'}
    ],
    user_message_prompt: 'Tell the world about Popups?'
  };
  FB.publish(post, function(published_post) {
    statusUpdate(
      'sans-session-info',
      'post was ' + (published_post ? '' : 'not ') + 'published.',
      published_post
    );
  });
}

function showUserInfo() {
  var userInfo = $('user-info');
  if (!FB.getSession()) {
    userInfo.style.visibility = 'hidden';
  } else {
    var params = {
      method: 'Fql.query',
      query: (
        'SELECT ' +
          'name,' +
          'pic_square,' +
          'profile_url ' +
        'FROM ' +
          'user ' +
        'WHERE ' +
          'uid=' + FB.getSession().uid
      )
    };

    FB.api(params, function(info) {
      if (info.error_code) {
        // bail
        return;
      }

      info = info[0];

      $('user-name').innerHTML = info.name;
      $('user-pic').src = info.pic_square;
      userInfo.href = info.profile_url;
      userInfo.style.visibility = 'visible';
    });
  }
}

function showSessionInfo() {
  var
    session     = FB.getSession(),
    sessionInfo = $('info');

  if (!session) {
    sessionInfo.style.visibility = 'hidden';
  } else {
    var rows = [];
    for (var key in session) {
      rows.push('<th>' + key + '</th>' + '<td>' + session[key] + '</td>');
    }
    sessionInfo.style.visibility = 'visible';
    sessionInfo.innerHTML = (
      '<table>' +
      '<tr>' + rows.join('</tr><tr>') + '</tr>' +
      '</table>'
    );
  }
}

// handles a session (or lack thereof)
function gotStatus(response) {
  showSessionInfo();
  showUserInfo();

  $('status').innerHTML = response.status;
  $('status').className = response.status;

  var input = $('integration').getElementsByTagName('input');
  for (var i=0, l=input.length; i<l; i++) {
    input[i].disabled = !response.session;
  }

  if (response.session) {
    $('bt-disconnect').disabled = $('bt-logout').disabled = false;
    $('bt-login').disabled = true;
  } else {
    $('bt-login').disabled = false;
    $('bt-disconnect').disabled = $('bt-logout').disabled = true;
  }
}

function gotPerms(response) {
  gotStatus(response);
  statusUpdate(
    'perms-info',
    'were ' + (response.perms ? '' : 'not ') + 'granted.',
    response.perms
  );
}

function statusUpdate(infoID, msg, yes) {
  var info = $(infoID);
  info.innerHTML = msg;
  info.className = 'info ' + (yes ? 'yes' : 'no');
  info.style.visibility = 'visible';
  window.setTimeout(function() { info.style.visibility = 'hidden'; }, 3000);
}

function friendAdded(added) {
  statusUpdate(
    'integration-info',
    'friend was ' + (added ? '' : 'not ') + 'added.',
    added
  );
}
