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
 *
 *
 * @provides fb.auth
 * @requires fb.prelude
 *           fb.qs
 *           fb.event
 *           fb.json
 *           fb.ui
 */

/**
 * Authentication, Authorization & Sessions.
 *
 * @class FB
 * @static
 * @access private
 */
FB.provide('', {
  /**
   * Find out the current status from the server, and get a session if the user
   * is connected.
   *
   * The user's status or the question of *who is the current user* is
   * the first thing you will typically start with. For the answer, we
   * ask facebook.com. Facebook will answer this question in one of
   * two ways:
   *
   * 1. Someone you don't know.
   * 2. Someone you know and have interacted with. Here's a session for them.
   *
   * Here's how you find out:
   *
   *     FB.getLoginStatus(function(response) {
   *       if (response.session) {
   *         // logged in and connected user, someone you know
   *       } else {
   *         // no user session available, someone you dont know
   *       }
   *     });
   *
   * The example above will result in the callback being invoked **once**
   * on load based on the session from www.facebook.com. JavaScript applications
   * are typically written with heavy use of events, and the SDK **encourages**
   * this by exposing various events. These are fired by the various
   * interactions with authentication flows, such as [FB.login()][login] or
   * [[wiki:fb:login-button]]. Widgets such as [[wiki:fb:comments (XFBML)]]
   * may also trigger authentication.
   *
   * **Events**
   *
   * #### auth.login
   * This event is fired when your application first notices the user (in other
   * words, gets a session when it didn't already have a valid one).
   * #### auth.logout
   * This event is fired when your application notices that there is no longer
   * a valid user (in other words, it had a session but can no longer validate
   * the current user).
   * #### auth.sessionChange
   * This event is fired for **any** auth related change as they all affect the
   * session: login, logout, session refresh. Sessions are refreshed over time
   * as long as the user is active with your application.
   * #### auth.statusChange
   * Typically you will want to use the auth.sessionChange event. But in rare
   * cases, you want to distinguish between these three states:
   *
   * - Connected
   * - Logged into Facebook but not connected with your application
   * - Not logged into Facebook at all.
   *
   * The [FB.Event.subscribe][subscribe] and
   * [FB.Event.unsubscribe][unsubscribe] functions are used to subscribe to
   * these events. For example:
   *
   *     FB.Event.subscribe('auth.login', function(response) {
   *       // do something with response
   *     });
   *
   * The response object returned to all these events is the same as the
   * response from [FB.getLoginStatus][getLoginStatus], [FB.login][login] or
   * [FB.logout][logout]. This response object contains:
   *
   * status
   * : The status of the User. One of `connected`, `notConnected` or `unknown`.
   *
   * session
   * : The session object.
   *
   * perms
   * : The comma separated permissions string. This is specific to a
   *   permissions call. It is not persistent.
   *
   * [subscribe]: /docs/?u=facebook.joey.FB.Event.subscribe
   * [unsubscribe]: /docs/?u=facebook.joey.FB.Event.unsubscribe
   * [getLoginStatus]: /docs/?u=facebook.joey.FB.getLoginStatus
   * [login]: /docs/?u=facebook.joey.FB.login
   * [logout]: /docs/?u=facebook.joey.FB.logout
   *
   * @access public
   * @param cb {Function} The callback function.
   * @param force {Boolean} Force reloading the login status (default `false`).
   */
  getLoginStatus: function(cb, force) {
    if (!FB._apiKey) {
      FB.log('FB.getLoginStatus() called before calling FB.init().');
      return;
    }

    // we either invoke the callback right away if the status has already been
    // loaded, or queue it up for when the load is done.
    if (cb) {
      if (!force && FB.Auth._loadState == 'loaded') {
        cb({ status: FB._userStatus, session: FB._session });
        return;
      } else {
        FB.Event.subscribe('FB.loginStatus', cb);
      }
    }

    // if we're already loading, and this is not a force load, we're done
    if (!force && FB.Auth._loadState == 'loading') {
      return;
    }

    FB.Auth._loadState = 'loading';

    // invoke the queued sessionLoad callbacks
    var lsCb = function(response) {
      // done
      FB.Auth._loadState = 'loaded';

      // invoke callbacks
      FB.Event.fire('FB.loginStatus', response);
      FB.Event.clear('FB.loginStatus');
    };

    // finally make the call to login status
    FB.ui({ method: 'auth.status', display: 'hidden' }, lsCb);
  },

  /**
   * *Synchronous* accessor for the current Session. The **synchronous**
   * nature of this method is what sets it apart from the other login methods.
   * It is similar in nature to [FB.getLoginStatus()][FB.getLoginStatus], but
   * it just **returns** the session. Many parts of your application already
   * *assume* the user is connected with your application. In such cases, you
   * may want to avoid the overhead of making asynchronous calls.
   *
   * NOTE: You should never use this method at *page load* time. Generally, it
   * is safer to use [FB.getLoginStatus()][FB.getLoginStatus] if you are
   * unsure.
   *
   * [FB.getLoginStatus]: /docs/?u=facebook.joey.FB.getLoginStatus
   *
   * @access public
   * @return {Object} the current Session if available, `null` otherwise
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
   * bound to an event handler which does the following:
   *
   *     FB.login(function(response) {
   *       if (response.session) {
   *         // user successfully logged in
   *       } else {
   *         // user cancelled login
   *       }
   *     });
   *
   * You should **only** call this on a user event as it opens a
   * popup. Most browsers block popups, _unless_ they were initiated
   * from a user event, such as a click on a button or a link.
   *
   *
   * Depending on your application's needs, you may need additional
   * permissions from the user. A large number of calls do not require
   * any additional permissions, so you should first make sure you
   * need a permission. This is a good idea because this step
   * potentially adds friction to the user's process. Another point to
   * remember is that this call can be made even _after_ the user has
   * first connected. So you may want to delay asking for permissions
   * until as late as possible:
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
   *     }, {perms:'read_stream,publish_stream,offline_access'});
   *
   * @access public
   * @param cb {Function} The callback function.
   * @param opts {Object} (_optional_) Options to modify login behavior.
   *
   * Name   | Type   | Description
   * ------ | ------ | ------------------------------------------------------
   * perms  | String | Comma separated list of [[wiki:Extended permissions]].
   */
  login: function(cb, opts) {
    opts = FB.copy({ method: 'auth.login', display: 'popup' }, opts || {});
    FB.ui(opts, cb);
  },

  /**
   * Logout the user in the background.
   *
   * Just like logging in is tied to facebook.com, so is logging out -- and
   * this call logs the user out of both Facebook and your site. This is a
   * simple call:
   *
   *     FB.logout(function(response) {
   *       // user is now logged out
   *     });
   *
   * NOTE: You can only log out a user that is connected to your site.
   *
   * @access public
   * @param cb {Function} The callback function.
   */
  logout: function(cb) {
    FB.ui({ method: 'auth.logout', display: 'hidden' }, cb);
  }
});

/**
 * Internal Authentication implementation.
 *
 * @class FB.Auth
 * @static
 * @access private
 */
FB.provide('Auth', {
  // pending callbacks for FB.getLoginStatus() calls
  _callbacks: [],

  /**
   * Set a new session value. Invokes all the registered subscribers
   * if needed.
   *
   * @access private
   * @param session {Object}  the new Session
   * @param status  {String}  the new status
   * @return       {Object}  the "response" object
   */
  setSession: function(session, status) {
    // detect special changes before changing the internal session
    var
      login         = !FB._session && session,
      logout        = FB._session && !session,
      both          = FB._session && session && FB._session.uid != session.uid,
      sessionChange = login || logout || (FB._session && session &&
                         FB._session.session_key != session.session_key),
      statusChange  = status != FB._userStatus;

    var response = {
      session : session,
      status  : status
    };

    FB._session = session;
    FB._userStatus = status;

    // If cookie support is enabled, set the cookie. Cookie support does not
    // rely on events, because we want the cookie to be set _before_ any of the
    // event handlers are fired. Note, this is a _weak_ dependency on Cookie.
    if (sessionChange && FB.Cookie && FB.Cookie.getEnabled()) {
      FB.Cookie.set(session);
    }

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
    if (sessionChange) {
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
   * @return         {String}   the xd url bound to the callback
   */
  xdHandler: function(cb, frame, target, isDefault, status, session) {
    return FB.UIServer._xdNextHandler(function(params) {
      try {
        session = FB.JSON.parse(params.session);
      } catch (x) {
        // ignore parse errors
      }
      var response = FB.Auth.setSession(session || null, status);

      // incase we were granted some new permissions
      response.perms = (
        params.result != 'xxRESULTTOKENxx' && params.result || '');

      // user defined callback
      cb && cb(response);
    }, frame, target, isDefault) + '&result=xxRESULTTOKENxx';
  }
});

FB.provide('UIServer.Methods', {
  'auth.login': {
    size      : { width: 627, height: 326 },
    url       : 'login.php',
    transform : function(call) {
      //FIXME
      if (!FB._apiKey) {
        FB.log('FB.login() called before calling FB.init().');
        return;
      }

      // if we already have a session and permissions are not being requested,
      // we just fire the callback
      if (FB._session && !call.params.perms) {
        FB.log('FB.login() called when user is already connected.');
        call.cb && call.cb({ status: FB._userStatus, session: FB._session });
        return;
      }

      var
        xdHandler = FB.Auth.xdHandler,
        cb        = call.cb,
        id        = call.id,
        session   = FB._session,
        cancel    = xdHandler(
          cb,
          id,
          'opener',
          true, // isDefault
          FB._userStatus,
          session),
        next      = xdHandler(
          cb,
          id,
          'opener',
          false, // isDefault
          'connected',
          session);

      FB.copy(call.params, {
        cancel_url              : cancel,
        channel_url             : window.location.toString(),
        next                    : next,
        fbconnect               : 1,
        req_perms               : call.params.perms,
        enable_profile_selector : call.params.enable_profile_selector,
        profile_selector_ids    : call.params.profile_selector_ids,
        return_session          : 1,
        session_version         : 3,
        v                       : '1.0'
      });
      delete call.cb;
      delete call.params.perms; //TODO fix name to be the same on server

      return call;
    }
  },

  'auth.logout': {
    url       : 'logout.php',
    transform : function(call) {
      //FIXME make generic
      if (!FB._apiKey) {
        FB.log('FB.logout() called before calling FB.init().');
      } else if (!FB._session) {
        FB.log('FB.logout() called without a session.');
      } else {
        call.params.next = FB.Auth.xdHandler(
          call.cb, call.id, 'parent', false, 'unknown');
        return call;
      }
    }
  },

  'auth.status': {
    url       : 'extern/login_status.php',
    transform : function(call) {
      var
        cb = call.cb,
        id = call.id,
        xdHandler = FB.Auth.xdHandler;
      delete call.cb;
      FB.copy(call.params, {
        no_session : xdHandler(cb, id, 'parent', false, 'notConnected'),
        no_user    : xdHandler(cb, id, 'parent', false, 'unknown'),
        ok_session : xdHandler(cb, id, 'parent', false, 'connected'),
        session_version : 3
      });
      return call;
    }
  }
});
