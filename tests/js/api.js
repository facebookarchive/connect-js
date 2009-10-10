////////////////////////////////////////////////////////////////////////////////
module('flash API');
////////////////////////////////////////////////////////////////////////////////
test(
  'check for zuck\'s name',

  function() {
    Mu.RestServer.flash(
      {
        method: 'fql.query',
        query: 'SELECT name FROM user WHERE uid=4'
      },
      function(r) {
        ok(r[0].name == 'Mark Zuckerberg', 'should get zuck\'s name');
        start();
      }
    );

    expect(1);
    stop();
  }
);
