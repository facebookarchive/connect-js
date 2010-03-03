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
 * @provides fb.tests.xd
 * @requires fb.tests.qunit
 *           fb.xd
 *           fb.ui
 */
////////////////////////////////////////////////////////////////////////////////
module('xd');
////////////////////////////////////////////////////////////////////////////////

test(
  'test default message flow',

  function() {
    FB.XD.init();

    var url = FB.XD.handler(function(response) {
      ok(response.answer == 42, 'expect the answer');
      FB.UIServer._xdRecv({frame: 'a'}, function() {});
      start();
    }, 'parent') + '&answer=42';
    FB.UIServer.hidden({
      id: 'a',
      size: {},
      url: url
    });

    expect(1);
    stop();
  }
);

test(
  'test flash message flow',

  function() {
    FB.XD.Flash.init();
    var oldTransport = FB.XD._transport;
    FB.XD._transport = 'flash';

    var url = FB.XD.handler(function(response) {
      ok(response.answer == 42, 'expect the answer');
      FB.UIServer._xdRecv({frame: 'a'}, function() {});
      start();
    }, 'parent') + '&answer=42';

    FB.XD._transport = oldTransport;

    FB.UIServer.hidden({
      id: 'a',
      size: {},
      url: url
    });

    expect(1);
    stop();
  }
);

test(
  'test fragment message flow',

  function() {
    // Mu itself makes some functions no-ops, but here testing the guts, so we
    // make it a no-op ourselves.
    if (window.location.toString().indexOf(FB.XD.Fragment._magic) > 0) {
      return;
    }

    var oldTransport = FB.XD._transport;
    FB.XD._transport = 'fragment';

    var url = FB.XD.handler(function(response) {
      ok(response.answer == 42, 'expect the answer');
      FB.UIServer._xdRecv({frame: 'a'}, function() {});
      start();
    }, 'parent') + '&answer=42';

    FB.XD._transport = oldTransport;

    FB.UIServer.hidden({
      id: 'a',
      size: {},
      url: url
    });

    expect(1);
    stop();
  }
);

/*FIXME
test(
  'test flash message flow with custom document.domain',

  function() {
    var
      newDomain = /\.([^.]*.[^.]*)$/.exec(window.location.hostname)[1],
      oldDomain = document.domain,
      oldOrigin = FB.XD._origin,
      oldTransport = FB.XD._transport;

    document.domain = newDomain;
    FB.XD._origin = (window.location.protocol + '//' + document.domain +
                     '/' + FB.guid());
    FB.XD._transport = 'flash';
    FB.XD.Flash.init();

    var url = FB.XD.handler(function(response) {
      ok(response.answer == 42, 'expect the answer');
      FB.UIServer._xdRecv({frame: 'a'}, function() {});

      // if old transport was flash, then we dont restore it. this is because
      // we're already in a good state.
      if (oldTransport != 'flash') {
        FB.XD._transport = oldTransport;
        FB.XD._origin = oldOrigin;

        //FIXME this fails, but i'm pretty sure it shouldn't. it affects test
        //runs if jscoverage is being used :(
        try {
          document.domain = oldDomain;
        } catch(e) {
          FB.log('document.domain could not be restored');
        }
      }

      start();
    }, 'parent') + '&answer=42';

    FB.UIServer.hidden({
      id: 'a',
      size: {},
      url: url
    });

    expect(1);
    stop();
  }
);
*/
