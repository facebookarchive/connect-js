////////////////////////////////////////////////////////////////////////////////
module('revoke');
////////////////////////////////////////////////////////////////////////////////
test(
  'revoke authorization',

  function() {
    FB.api(
      { method: 'Auth.revokeAuthorization' },
      function(response) {
        ok(!FB.getSession(), 'should not get a session');
        start();
      }
    );

    expect(1);
    stop();
  }
);
