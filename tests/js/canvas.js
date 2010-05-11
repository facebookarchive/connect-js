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
 * @provides fb.tests.canvas
 * @requires fb.tests.qunit
 *           fb.canvas
 */
////////////////////////////////////////////////////////////////////////////////
module('canvas', {
  setup: function() {
    this.oldCanvas = FB.Canvas;
    FB.Canvas = FB.copy(this.oldCanvas);
  },
  teardown: function() {
    FB.Canvas = this.oldCanvas;
  }
});
////////////////////////////////////////////////////////////////////////////////

/*FIXME
test(
  'Arbiter is called',

  function() {
    expect(3);
    stop(500);

    var oldDomain = document.domain;
    document.domain =
      window.location.hostname.replace(/^.*(facebook\..*)$/i, '$1');

    window.Arbiter = {
      inform: function(type, message) {
        equals('Connect.Unsafe.setSize', type, 'method is correct');
        equals(typeof message.width, 'number', 'message has a width');
        equals(typeof message.height, 'number', 'message has a height');
        delete window.Arbiter;
        //FIXME This doesn't work :(
        document.domain = oldDomain;
        start();
      }
    };

    FB.Canvas.setSize();
  }
);
*/

test(
  '_sendMessageToFacebook is called',

  function() {
    size = {width: 5, height: 5};
    FB.Canvas._sendMessageToFacebook = function(message) {
      same({ 'method':'setSize', params:size }, message);
    };
    FB.Canvas.setSize(size);
  }
);

test(
  'starting the timer',

  function() {
    expect(1);
    stop(100);

    FB.Canvas.setSize = function() {
      ok(true, 'setSize was called. stopping now');
      FB.Canvas.setAutoResize(false);
      start();
    };
    FB.Canvas.setAutoResize();
  }
);

test(
  'running the timer',

  function() {
    expect(4);
    stop(500);

    var count = 0;
    FB.Canvas.setSize = function() {
      if (count++ < 3) {
        ok(true, 'setSize was called');
      } else {
        ok(true, 'all done!');
        FB.Canvas.setAutoResize(false);
        start();
      }
    };
    FB.Canvas.setAutoResize();
  }
);

test(
  'stopping the timer',

  function() {
    expect(3);
    stop(500);

    var count = 0;
    FB.Canvas.setSize = function() {
      if (count === 0) {
        ok(true, 'setSize was called at the begining');
      } else if (count === 1) {
        FB.Canvas.setAutoResize(false);
        ok(true, 'setSize was called a by the timer');
      } else {
        ok(false, 'setSize was called too much');
      }
      count++;
    };
    FB.Canvas.setAutoResize();
    setTimeout(function() {
      ok(true, 'good, setSize wasn\'t called');
      start();
    }, 400);
  }
);

test(
  'stopping the timer right away',

  function() {
    expect(2);
    stop(400);

    var count = 0;
    FB.Canvas.setSize = function() {
      if (count === 0) {
        ok(true, 'setSize was called at the begining');
        FB.Canvas.setAutoResize(false);
      } else {
        ok(false, 'setSize was called too much');
      }
      count++;
    };
    FB.Canvas.setAutoResize();
    setTimeout(function() {
      ok(true, 'good, setSize wasn\'t called');
      start();
    }, 300);
  }
);

test(
  'custom interval',

  function() {
    expect(2);
    stop(300);

    var count = 0;
    FB.Canvas.setSize = function() {
      if (count++ === 0) {
        ok(true, 'setSize was called once (at the begining)');
      } else {
        ok(false, 'setSize was called more than once (in set test)');
        start();
      }
    };
    FB.Canvas.setAutoResize(true, 300);
    setTimeout(function() {
      FB.Canvas.setAutoResize(false);
      ok(true, 'good, setSize wasn\'t called');
      start();
    }, 200);
  }
);
