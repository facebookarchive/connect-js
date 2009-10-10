////////////////////////////////////////////////////////////////////////////////
module('revoke');
////////////////////////////////////////////////////////////////////////////////
test(
  'revoke authorization',

  function() {
    Mu.api(
      { method: 'Auth.revokeAuthorization' },
      function(response) {
        ok(!Mu.getSession(), 'should not get a session');
        start();
      }
    );

    expect(1);
    stop();
  }
);
