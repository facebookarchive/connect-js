/**
 * @module Mu
 * @provides mu.auth
 * @requires mu.prelude
 *           mu.qs
 *           mu.frames
 */

/**
 * Authentication, Authorization & Sessions.
 *
 * @class Mu
 * @static
 * @access private
 */
Mu.copy('', {
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
   *     Mu.loginStatus(function(response) {
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
   * @for Mu
   */
  loginStatus: function(cb, force) {
    if (!Mu._apiKey) {
      Mu.log('Mu.loginStatus() called before calling Mu.init()');
      return;
    }

    // we either invoke the callback right away if the status has already been
    // loaded, or queue it up for when the load is done.
    if (cb) {
      if (!force && Mu.Auth._loadState == 'loaded') {
        cb({ status: Mu._userStatus, session: Mu._session });
        return;
      } else {
        Mu.Auth._callbacks.load.push(cb);
      }
    }

    Mu.Auth._loadState = 'loading';

    // invoke the queued sessionLoad callbacks
    var lsCb = function(response) {
      // done
      Mu.Auth._loadState = 'loaded';

      // consume the current load queue and reset
      var waitingCb = Mu.Auth._callbacks.load;
      Mu.Auth._callbacks.load = [];

      for (var i=0, l=waitingCb.length; i<l; i++) {
        waitingCb[i](response);
      }
    };

    // finally make the call to login status
    var
      xdHandler = Mu.Auth.xdHandler,
      g = Mu.guid(),
      url = Mu._domain.www + 'extern/login_status.php?' + Mu.QS.encode({
        api_key    : Mu._apiKey,
        no_session : xdHandler(lsCb, g, 'parent', false, 'notConnected'),
        no_user    : xdHandler(lsCb, g, 'parent', false, 'unknown'),
        ok_session : xdHandler(lsCb, g, 'parent', false, 'connected')
      });

    Mu.Frames.hidden(url, g);
  },

  /**
   * Accessor for the current Session.
   *
   * @access public
   * @returns {Object}  the current Session if available, null otherwise
   */
  getSession: function() {
    return Mu._session;
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
   *    Mu.login(function(response) {
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
   *     Mu.login(function(response) {
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
    if (!Mu._apiKey) {
      Mu.log('Mu.login() called before calling Mu.init()');
      return;
    }

    var
      xdHandler = Mu.Auth.xdHandler,
      g = Mu.guid(),
      cancel = xdHandler(cb, g, 'opener', true,  Mu._userStatus, Mu._session),
      next = xdHandler(cb, g, 'opener', false, 'connected', Mu._session),
      url = Mu._domain.www + 'login.php?' + Mu.QS.encode({
        api_key        : Mu._apiKey,
        cancel_url     : cancel,
        channel_url    : window.location.toString(),
        display        : 'popup',
        fbconnect      : 1,
        next           : next,
        req_perms      : perms,
        return_session : 1,
        v              : '1.0'
      });

    Mu.Frames.popup(url, 450, 415, g);
  },

  /**
   * Logout the user in the background.
   *
   * Just like logging in is tied to facebook.com, so is logging out.
   * The status shared between your site and Facebook, and logging out
   * affects both sites. This is a simple call::
   *
   *     Mu.logout(function(response) {
   *       // user is now logged out
   *     });
   *
   * @access public
   * @param cb    {Function} the callback function
   */
  logout: function(cb) {
    if (!Mu._apiKey) {
      Mu.log('Mu.logout() called before calling Mu.init()');
      return;
    }

    var
      g   = Mu.guid(),
      url = Mu._domain.www + 'logout.php?' + Mu.QS.encode({
        api_key     : Mu._apiKey,
        next        : Mu.Auth.xdHandler(cb, g, 'parent', false, 'unknown'),
        session_key : Mu._session.session_key
      });

    Mu.Frames.hidden(url, g);
  }
});

/**
 * Internal Authentication implementation.
 *
 * @class Mu.Auth
 * @static
 * @access private
 */
Mu.copy('Auth', {
  // status callbacks
  _callbacks: {
    change: [],
    load: []
  },

  /**
   * Set a new session value. Invokes all the registered subscribers
   * if needed.
   *
   * @access private
   * @param session {Object}  the new Session
   * @param status  {String}  the new status
   * @param skipCb  {Boolean} skip invoke the callbacks
   */
  setSession: function(session, status, skipCb) {
    // detect special changes before changing the internal session
    var
      login         = !Mu._session && session,
      logout        = Mu._session && !session,
      both          = Mu._session && session && Mu._session.uid != session.uid,
      sessionChange = (Mu._session && session &&
                         Mu._session.session_key != session.session_key),
      statusChange  = status != Mu._status;

    var response = {
      session : session,
      status  : status
    };

    Mu._session = session;
    Mu._userStatus = status;

    // events
    if (statusChange) {
      /**
       * Fired when the status changes.
       *
       * @event auth.statusChange
       */
      Mu.Event.fire('auth.statusChange', response);
    }
    if (logout || both) {
      /**
       * Fired when a logout action is performed.
       *
       * @event auth.logout
       */
      Mu.Event.fire('auth.logout', response);
    }
    if (login || both) {
      /**
       * Fired when a login action is performed.
       *
       * @event auth.login
       */
      Mu.Event.fire('auth.login', response);
    }
    if (login || logout || sessionChange) {
      /**
       * Fired when the session changes. This includes a session being
       * refreshed, or a login or logout action.
       *
       * @event auth.sessionChange
       */
      Mu.Event.fire('auth.sessionChange', response);
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
    return Mu.Frames.xdHandler(function(params) {
      // try to extract a session
      var response;
      try {
        response = Mu.Auth.setSession(JSON.parse(params.session), status);
      } catch(x) {
        response = Mu.Auth.setSession(session || null, status);
      }

      // incase we were granted some new permissions
      response.perms = (
        params.result != 'xxRESULTTOKENxx' && params.result || '');

      // user defined callback
      cb && cb(response);
    }, frame, target, isDefault) + '&result=xxRESULTTOKENxx';
  }
});
