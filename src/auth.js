/**
 * @module FB
 * @provides mu.auth
 * @requires mu.prelude
 *           mu.qs
 *           mu.frames
 */

/**
 * Authentication, Authorization & Sessions.
 *
 * @class FB
 * @static
 * @access private
 */
FB.copy('', {
  /**
   * Find out the current status from the server, and get a session if the user
   * is connected.
   *
   * The User's Status or the question of "who is the current user" is
   * the first thing you will typically start with. For the answer, we
   * ask facebook.com. Facebook will answer this question in one of
   * two ways:
   *
   *     #. Someone you don't know.
   *     #. Someone you know and have interacted with. Here's a
   *        session for them.
   *
   * Here's how you find out::
   *
   *     FB.loginStatus(function(response) {
   *       if (response.session) {
   *         // logged in and connected user, someone you know
   *       } else {
   *         // no user session available, someone you dont know
   *       }
   *     });
   *
   * The example above will result in the callback being invoked once
   * on load based on the session from www.facebook.com. For more
   * advanced use, you may with to monitor for various events.
   *
   * Events:
   *  - auth.login
   *  - auth.logout
   *  - auth.sessionChange
   *  - auth.statusChange
   *
   * FIXME interlink documentation to events.
   *
   * @access public
   * @param cb     {Function} the callback function
   * @param force  {Boolean}  force reloading the login status (default false)
   */
  loginStatus: function(cb, force) {
    if (!FB._apiKey) {
      FB.log('FB.loginStatus() called before calling FB.init().');
      return;
    }

    // we either invoke the callback right away if the status has already been
    // loaded, or queue it up for when the load is done.
    if (cb) {
      if (!force && FB.Auth._loadState == 'loaded') {
        cb({ status: FB._userStatus, session: FB._session });
        return;
      } else {
        FB.Auth._callbacks.push(cb);
      }
    }

    FB.Auth._loadState = 'loading';

    // invoke the queued sessionLoad callbacks
    var lsCb = function(response) {
      // done
      FB.Auth._loadState = 'loaded';

      // consume the current load queue and reset
      var waitingCb = FB.Auth._callbacks;
      FB.Auth._callbacks = [];

      for (var i=0, l=waitingCb.length; i<l; i++) {
        waitingCb[i](response);
      }
    };

    // finally make the call to login status
    var
      xdHandler = FB.Auth.xdHandler,
      g = FB.guid(),
      url = FB._domain.www + 'extern/login_status.php?' + FB.QS.encode({
        api_key    : FB._apiKey,
        no_session : xdHandler(lsCb, g, 'parent', false, 'notConnected'),
        no_user    : xdHandler(lsCb, g, 'parent', false, 'unknown'),
        ok_session : xdHandler(lsCb, g, 'parent', false, 'connected')
      });

    FB.Frames.hidden(url, g);
  },

  /**
   * Accessor for the current Session.
   *
   * @access public
   * @returns {Object}  the current Session if available, null otherwise
   */
  getSession: function() {
    return FB._session;
  },

  /**
   * Login/Authorize/Permissions.
   *
   * Once you have determined the user's status, you may need to
   * prompt the user to login. It is best to delay this action to
   * reduce user friction when they first arrive at your site. You can
   * then prompt and show them the "Connect with Facebook" button
   * bound to an event handler which does the following::
   *
   *    FB.login(function(response) {
   *      if (response.session) {
   *        // user successfully logged in
   *      } else {
   *        // user cancelled login
   *      }
   *    });
   *
   * You should **only** call this on a user event as it opens a
   * popup. Most browsers block popups, *unless* they were initiated
   * from a user event, such as a click on a button or a link.
   *
   *
   * Depending on your application's needs, you may need additional
   * permissions from the user. A large number of calls do not require
   * any additional permissions, so you should first make sure you
   * need a permission. This is a good idea because this step
   * potentially adds friction to the user's process. Another point to
   * remember is that this call can be made even *after* the user has
   * first connected. So you may want to delay asking for permissions
   * until as late as possible::
   *
   *     FB.login(function(response) {
   *       if (response.session) {
   *         if (response.perms) {
   *           // user is logged in and granted some permissions.
   *           // perms is a comma separated list of granted permissions
   *         } else {
   *           // user is logged in, but did not grant any permissions
   *         }
   *       } else {
   *         // user is not logged in
   *       }
   *     }, 'read_stream,publish_stream,offline_access');
   *
   * @access public
   * @param cb    {Function} the callback function
   * @param perms {String}   (optional) comma separated list of permissions
   */
  login: function(cb, perms) {
    if (!FB._apiKey) {
      FB.log('FB.login() called before calling FB.init().');
      return;
    }

    // if we already have a session and permissions are not being requested, we
    // just fire the callback
    if (FB._session && !perms) {
      FB.log('FB.login() called when user is already connected.');
      cb && cb({ status: FB._userStatus, session: FB._session });
      return;
    }

    var
      xdHandler = FB.Auth.xdHandler,
      g = FB.guid(),
      cancel = xdHandler(cb, g, 'opener', true,  FB._userStatus, FB._session),
      next = xdHandler(cb, g, 'opener', false, 'connected', FB._session),
      url = FB._domain.www + 'login.php?' + FB.QS.encode({
        api_key        : FB._apiKey,
        cancel_url     : cancel,
        channel_url    : window.location.toString(),
        display        : 'popup',
        fbconnect      : 1,
        next           : next,
        req_perms      : perms,
        return_session : 1,
        v              : '1.0'
      });

    FB.Frames.popup(url, 450, 415, g);
  },

  /**
   * Logout the user in the background.
   *
   * Just like logging in is tied to facebook.com, so is logging out.
   * The status shared between your site and Facebook, and logging out
   * affects both sites. This is a simple call::
   *
   *     FB.logout(function(response) {
   *       // user is now logged out
   *     });
   *
   * @access public
   * @param cb    {Function} the callback function
   */
  logout: function(cb) {
    if (!FB._apiKey) {
      FB.log('FB.logout() called before calling FB.init().');
      return;
    }

    if (!FB._session) {
      FB.log('FB.logout() called without a session.');
      return;
    }

    var
      g   = FB.guid(),
      url = FB._domain.www + 'logout.php?' + FB.QS.encode({
        api_key     : FB._apiKey,
        next        : FB.Auth.xdHandler(cb, g, 'parent', false, 'unknown'),
        session_key : FB._session.session_key
      });

    FB.Frames.hidden(url, g);
  }
});

/**
 * Internal Authentication implementation.
 *
 * @class FB.Auth
 * @static
 * @access private
 */
FB.copy('Auth', {
  // pending callbacks for FB.loginStatus() calls
  _callbacks: [],

  /**
   * Set a new session value. Invokes all the registered subscribers
   * if needed.
   *
   * @access private
   * @param session {Object}  the new Session
   * @param status  {String}  the new status
   * @returns       {Object}  the "response" object
   */
  setSession: function(session, status) {
    // detect special changes before changing the internal session
    var
      login         = !FB._session && session,
      logout        = FB._session && !session,
      both          = FB._session && session && FB._session.uid != session.uid,
      sessionChange = (FB._session && session &&
                         FB._session.session_key != session.session_key),
      statusChange  = status != FB._status;

    var response = {
      session : session,
      status  : status
    };

    FB._session = session;
    FB._userStatus = status;

    // events
    if (statusChange) {
      /**
       * Fired when the status changes.
       *
       * @event auth.statusChange
       */
      FB.Event.fire('auth.statusChange', response);
    }
    if (logout || both) {
      /**
       * Fired when a logout action is performed.
       *
       * @event auth.logout
       */
      FB.Event.fire('auth.logout', response);
    }
    if (login || both) {
      /**
       * Fired when a login action is performed.
       *
       * @event auth.login
       */
      FB.Event.fire('auth.login', response);
    }
    if (login || logout || sessionChange) {
      /**
       * Fired when the session changes. This includes a session being
       * refreshed, or a login or logout action.
       *
       * @event auth.sessionChange
       */
      FB.Event.fire('auth.sessionChange', response);
    }

    return response;
  },

  /**
   * This handles receiving a session from:
   *  - login_status.php
   *  - login.php
   *  - tos.php
   *
   * It also (optionally) handles the ``xxRESULTTOKENxx`` response from:
   *  - prompt_permissions.php
   *
   * And calls the given callback with::
   *
   *   {
   *     session: session or null,
   *     status: 'unknown' or 'notConnected' or 'connected',
   *     perms: comma separated string of perm names
   *   }
   *
   * @access private
   * @param cb        {Function} the callback function
   * @param frame     {String}   the frame id for the callback is tied to
   * @param target    {String}   parent or opener to indicate window relation
   * @param isDefault {Boolean}  is this the default callback for the frame
   * @param status    {String}   the connect status this handler will trigger
   * @param session   {Object}   backup session, if none is found in response
   * @returns         {String}   the xd url bound to the callback
   */
  xdHandler: function(cb, frame, target, isDefault, status, session) {
    return FB.Frames.xdHandler(function(params) {
      // try to extract a session
      var response;
      try {
        response = FB.Auth.setSession(JSON.parse(params.session), status);
      } catch(x) {
        response = FB.Auth.setSession(session || null, status);
      }

      // incase we were granted some new permissions
      response.perms = (
        params.result != 'xxRESULTTOKENxx' && params.result || '');

      // user defined callback
      cb && cb(response);
    }, frame, target, isDefault) + '&result=xxRESULTTOKENxx';
  }
});
