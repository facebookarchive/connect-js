/**
 * @module Mu
 * @provides Mu.Auth
 *
 * @requires Mu.Prelude
 *           Mu.QS
 *           Mu.Frames
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
   *     Mu.watchStatus(function(response) {
   *       if (response.session) {
   *         // logged in and connected user, someone you know
   *       } else {
   *         // no user session available, someone you dont know
   *       }
   *     });
   *
   * The example above will result in the callback being invoked once
   * on load based on the session from www.facebook.com. For more
   * advanced use, you may with to monitor the status on
   * change. Potentially just get notified of a change across page
   * loads. The status call will also also optimize away the request
   * to www.facebook.com when possible (by doing it only once per page
   * load), but you may need to force a refresh of the session.
   *
   * Options:
   *
   * =========  =============================================  =========
   * Property   Description                                    Default
   * =========  =============================================  =========
   * change     Invoke the callback on every change.           ``false``
   * cookie     Allow using the Cookie session. **Advanced!**  ``false``
   * force      Force fetching the status from the server.     ``false``
   * load       Invoke the callback once on load.              ``true``
   * =========  =============================================  =========
   *
   * Note, ``change`` and ``load`` can be specified at the same time,
   * which will ensure that your callback is invoked at least once on
   * load, and then again for every change in session. For example::
   *
   *   Mu.watchStatus(
   *     function(response) {
   *       // will get invoked at least once on load, and then again
   *       // on every change in session.
   *     },
   *     {
   *       change: true,
   *       load: true
   *     }
   *   );
   *
   * @access public
   * @param cb   {Function} the callback function
   * @param opts {Object}   options as described above
   * @for Mu
   */
  watchStatus: function(cb, opts) {
    // copy options supplying defaults as necessary
    opts = Mu.copy(opts || {}, {
      change : false,
      cookie : false,
      force  : false,
      load   : true
    });

    // notify on change?
    if (opts.change) {
      Mu.Auth._callbacks.change.push(cb);
    }

    // invoking on load means we either setup a timeout to invoke the callback
    // if the status has already been loaded, or queuing up the callback for
    // when the load is done
    if (cb && opts.load) {
      if (!opts.force &&
          (Mu.watchStatus._loadState ||
           (opts.cookie && Mu._session))) {
        window.setTimeout(function() {
          cb({ status: Mu._userStatus, session: Mu._session });
        }, 0);
      } else {
        // this is complex. its because we dont want the callback to get
        // invoked twice on load, if the state changes on load as well.
        //
        // basically, we only invoke it here if we know it wont already get
        // invoked as part of sessionChange.
        Mu.Auth._callbacks.load.push(function(response) {
          if (!opts.change || !response.change) {
            cb(response);
          }
        });
      }
    }

    // if we've already loaded or are loading the status, and a force refresh
    // was not requested, we're done at this point
    if (typeof Mu.watchStatus._loadState != 'undefined' && !opts.force) {
      return;
    }

    // if we get here, we need to fetch the status from the server
    Mu.watchStatus._loadState = false;

    // invoke the queued sessionLoad callbacks
    var lsCb = function(response) {
      Mu.watchStatus._loadState = true;
      for (var i=0, l=Mu.Auth._callbacks.load.length; i<l; i++) {
        Mu.Auth._callbacks.load[i](response);
      }
      Mu.Auth._callbacks.load = [];
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
    var response = {
      changed : (!skipCb &&                    // force callbacks
                 ((session && !Mu._session) || // new session
                  (!session && Mu._session) || // lost session
                  (session && Mu._session &&   // updated session
                   (session.session_key != Mu._session.session_key)))),
      session : session,
      status  : status
    };

    Mu._session = session;
    Mu._userStatus = status;
    if (response.changed) {
      for (var i=0, l=Mu.Auth._callbacks.change.length; i<l; i++) {
        Mu.Auth._callbacks.change[i](response);
      }
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
