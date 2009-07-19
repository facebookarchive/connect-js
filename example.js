Mu.init('48f06bc570aaf9ed454699ec4fe416df', 'xd.html');

$ = function(i) { return document.getElementById(i); };


// publish something
function publishExample() {
  Mu.publish(
    'This is some text',
    undefined,
    [{text:'custom action link', href:'http://www.yahoo.com/'}],
    undefined,
    'Tell the world about Popups?'
  );
}

// enable/disable connect mode buttons
function setConnected(isConnected) {
  var input = $('connected').getElementsByTagName('input');
  for (var i=0, l=input.length; i<l; i++) {
    input[i].disabled = !isConnected;
  }

  var userInfo = $('user-info');
  if (isConnected) {
    var params = {
      method: 'Fql.query',
      query: 'SELECT name, pic_square, profile_url FROM user where uid=' + Mu.Session.uid
    };

    Mu.api(params, function(info) {
      info = info[0];

      userInfo.href = info.profile_url;
      $('user-name').innerHTML = info.name;
      $('user-pic').src = info.pic_square;
      userInfo.style.visibility = 'visible';
    });
  } else {
    userInfo.style.visibility = 'hidden';
  }
}

// handles a session (or lack thereof)
function gotStatus(status, session) {
  $('status').innerHTML = status;
  $('status').className = status;

  if (status == 'connected') {
    $('bt-disconnect').disabled = $('bt-logout').disabled = false;
    $('bt-login').disabled = $('bt-connect').disabled = true;
    setConnected(true);
  } else if (status == 'disconnected') {
    $('bt-connect').disabled = false;
    $('bt-disconnect').disabled = $('bt-login').disabled = $('bt-logout').disabled = true;
    setConnected(false);
  } else {
    $('bt-login').disabled = false;
    $('bt-disconnect').disabled = $('bt-connect').disabled = $('bt-logout').disabled = true;
    setConnected(false);
  }

  if (!session) {
    $('info').innerHTML = '';
  } else {
    var rows = [];
    for (var key in session) {
      rows.push('<th>' + key + '</th>' + '<td>' + session[key] + '</td>');
    }
    $('info').innerHTML = (
      '<table>' +
      '<tr>' + rows.join('</tr><tr>') + '</tr>' +
      '</table>'
    );
  }
}

function statusUpdate(infoID, msg, yes) {
  var info = $(infoID);
  info.innerHTML = msg;
  info.className = 'info ' + (yes ? 'yes' : 'no');
  info.style.visibility = 'visible';
  window.setTimeout(function() { info.style.visibility = 'hidden'; }, 3000);
}

function gotPerms(granted) {
  statusUpdate(
    'perms-info',
    'were ' + (granted ? '' : 'not ') + 'granted.',
    granted
  );
}

function friendAdded(added) {
  statusUpdate(
    'integration-info',
    'friend was ' + (added ? '' : 'not ') + 'added.',
    added
  );
}
