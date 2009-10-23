////////////////////////////////////////////////////////////////////////////////
module('event');
////////////////////////////////////////////////////////////////////////////////

test(
  'subscribe and fire',

  function() {
    expect(4);

    var cb1 = function(arg1, arg2) {
      ok(arg1 == 41, 'got expected arg1');
      ok(arg2 == 42, 'got expected arg2');
    };
    var cb2 = function(arg1, arg2) {
      ok(arg1 == 41, 'got expected arg1');
      ok(arg2 == 42, 'got expected arg2');
    };
    FB.Event.on('fake.event1', cb1);
    FB.Event.on('fake.event1', cb2);
    FB.Event.fire('fake.event1', 41, 42);
    FB.Event.unsubscribe('fake.event1', cb1);
    FB.Event.unsubscribe('fake.event1', cb2);
  }
);

test(
  'subscribe and unsubscribe',

  function() {
    expect(2);

    var cb = function(arg1, arg2) {
      ok(arg1 == 41, 'got expected arg1');
      ok(arg2 == 42, 'got expected arg2');
    };
    FB.Event.on('fake.event2', cb);
    FB.Event.fire('fake.event2', 41, 42);
    FB.Event.unsubscribe('fake.event2', cb);
    FB.Event.fire('fake.event2', 41, 42);
  }
);

test(
  'no subscribers',

  function() {
    FB.Event.fire('fake.event3', 41, 42);
    ok(true, 'no errors in firing an event with no subscribers');
  }
);

test(
  'return false unsubscribe',

  function() {
    expect(2);

    var cb = function(arg1, arg2) {
      ok(arg1 == 41, 'got expected arg1');
      ok(arg2 == 42, 'got expected arg2');
      return false;
    };
    FB.Event.on('fake.event2', cb);
    FB.Event.fire('fake.event2', 41, 42);
    FB.Event.fire('fake.event2', 41, 42);
  }
);

