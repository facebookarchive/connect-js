Facebook Connect JavaScript SDK
===============================

Facebook [Connect][Connect] is a set of APIs that make your application more
social. With it you gain access to:

1. Identity: name, photos, events and more -- [User][FQL_User].
2. Social Graph: friends and connections -- [Connection][FQL_Connection].
3. Stream: activity, distribution, and integration points within Facebook, like
   stream stories and Publishers [UI Dialogs][UI Dialogs].

[Connect]: http://developers.facebook.com/connect "Facebook | Connect"
[FQL_User]: http://wiki.developers.facebook.com/index.php/User_(FQL) "FQL User Table"
[FQL_Connection]: http://wiki.developers.facebook.com/index.php/Connection_(FQL) "FQL Connection Table"
[UI Dialogs]: http://developers.facebook.com/docs/?u=facebook.joey.FB.ui "UI Dialogs (to render dialogs like publish and share)"

This repository contains the open source JavaScript SDK that allows you to
utilize the above on your website. Except as otherwise noted, the Facebook
Connect JavaScript SDK is licensed under the Apache Licence, Version 2.0
(http://www.apache.org/licenses/LICENSE-2.0.html)



Status
------

This is an *beta* release. In order to guide the development of the library
and allow you to freely inspect and use the source, we have open sourced the
client JavaScript SDK. At a high level, the SDK provides:

- Authentication & Authorization
- Ability to make API calls
- Ability to show UI dialogs
- XFBML Tags & Widgets
- Data Access Abstractions


Usage
-----

The [examples][examples] are a good place to start. Here's an example of
initializing ([FB.init()][FB.init]) the library with all the options turned on:

    <div id="fb-root"></div>
    <script src="http://connect.facebook.net/en_US/all.js"></script>
    <script>
      FB.init({
        appId  : 'YOUR APP ID',
        status : true, // check login status
        cookie : true, // enable cookies to allow the server to access the session
        xfbml  : true  // parse XFBML
      });
    </script>

[examples]: http://github.com/facebook/connect-js/tree/master/examples/
[FB.init]: http://developers.facebook.com/docs/?u=facebook.joey.FB.init

### Asynchronous Loading

For better performance, you should load the initial script itself in a
non-blocking manner. This will mean you have to be more conscious about how you
invoke anything in the `FB` namespace, as asynchronously loading the script can
cause it to arrive after your application scripts have been loaded. To make
this more convenient, the library looks for a **global** named `fbAsyncInit`.
If it exists, this function will be executed once the library has been loaded.
You should trigger all `FB` related logic from here. When using this approach,
you should put the code right *after the opening* `<body>` tag. This will allow
Facebook to initialize in parallel with the rest of your page.

    <div id="fb-root"></div>
    <script>
      window.fbAsyncInit = function() {
        FB.init({
          appId  : 'YOUR APP ID',
          status : true, // check login status
          cookie : true, // enable cookies to allow the server to access the session
          xfbml  : true  // parse XFBML
        });
      };

      (function() {
        var e = document.createElement('script');
        e.src = document.location.protocol + '//connect.facebook.net/en_US/all.js';
        e.async = true;
        document.getElementById('fb-root').appendChild(e);
      }());
    </script>

### Internationalization

Facebook Connect features are available many locales. You can replace the
`en_US` locale specifed above with one of the [supported Facebook
Locales][locales]. For example, to load up the library and trigger dialogs,
popups and widgets to be in Hindi (`hi_IN`), you can load the library from this
URL:

    http://connect.facebook.net/hi_IN/all.js

[locales]: http://wiki.developers.facebook.com/index.php/Facebook_Locales

### SSL

Facebook Connect is also available over SSL. You should only use this when your
own page is served over `https://`. The library will rely on the current page
protocol at runtime. The SSL URL is the same, only the protocol is changed:

    https://connect.facebook.net/en_US/all.js


Authentication & Authorization
------------------------------

Facebook Connect provides the great benefit of removing the registration
process by allowing the user to login to your site with their Facebook account.
This is achieved by sharing the logged in user state between
http://www.facebook.com/ and your site http://www.example.com/. A Connected
user remains logged in to your site as long as they are logged in to Facebook.

This means you get to skip a lot of the boring stuff when you're building your
hot new application. You don't need to create your own registration flow, and
your users don't have to create new profiles, upload profile pictures or
remember a username. But not only that, you also get the user's social graph,
and many other useful pieces of information. Facebook Connect can also be used
with your existing user management system as many sites already do.

### Status & Sessions

The first step is figuring out how you identify who the current user is, and
how to make API calls on their behalf. In fact, almost **half** of the public
API deals directly with auth:

- [FB.login()][FB.login] -- login and/or request extended permissions
- [FB.logout()][FB.logout] -- logout (only if the user is connected with your application)
- [FB.getLoginStatus()][FB.getLoginStatus] -- get current login status from facebook.com
- [FB.getSession()][FB.getSession] -- **synchronous** accessor for the current session

In addition, there many events that you can subscribe to using
[FB.Event.subscribe()][FB.Event.subscribe]:

- auth.statusChange
- auth.sessionChange
- auth.login
- auth.logout

[FB.login]: http://developers.facebook.com/docs/?u=facebook.joey.FB.login
[FB.logout]: http://developers.facebook.com/docs/?u=facebook.joey.FB.logout
[FB.getLoginStatus]: http://developers.facebook.com/docs/?u=facebook.joey.FB.getLoginStatus
[FB.getSession]: http://developers.facebook.com/docs/?u=facebook.joey.FB.getSession
[FB.Event.subscribe]: http://developers.facebook.com/docs/?u=facebook.joey.FB.Event.subscribe


API Calls
---------

Facebook provides many server-side [APIs][API] to enable you to integrate data
from Facebook into your site, as well as allowing you to submit data into
Facebook. The JavaScript SDK makes all this available to you via
[FB.api()][FB.api]:

[FB.api]: http://developers.facebook.com/docs/?u=facebook.joey.FB.api "Server-Side API Calls"

    FB.api(
      {
        method: 'fql.query',
        query: 'SELECT name FROM user WHERE uid=5526183'
      },
      function(response) {
        alert('Name is ' + response[0].name);
      }
    );

[API]: http://wiki.developers.facebook.com/index.php/API


Dialogs
-------

One of the most powerful features of the SDK is to integrate Facebook UI flows
into your application. The most common example of this is the
**stream.publish** dialog. [FB.ui()][FB.ui] is the method that allows you to
trigger this and other dialogs. For example:

[FB.ui]: http://developers.facebook.com/docs/?u=facebook.joey.FB.ui "UI Dialogs (to render dialogs like publish and share)"

    FB.ui(
      {
        method: 'stream.publish',
        attachment: {
          name: 'Connect',
          caption: 'The Facebook Connect JavaScript SDK',
          description: (
            'A small JavaScript library that allows you to harness ' +
            'the power of Facebook, bringing the user\'s identity, ' +
            'social graph and distribution power to your site.'
          ),
          href: 'http://fbrell.com/'
        },
        action_links: [
          { text: 'fbrell', href: 'http://fbrell.com/' }
        ]
      },
      function(response) {
        if (response && response.post_id) {
          alert('Post was published.');
        } else {
          alert('Post was not published.');
        }
      }
    );

UI dialogs are documented at TODO.


XFBML & Widgets
---------------

XFBML and Widgets provide a simple, low effort means of integrating social
features into your site. The current set of supported tags are:

- [fb:comments][fb:comments]
- [fb:fan][fb:fan]
- [fb:live-stream][fb:live-stream]
- [fb:login-button][fb:login-button]
- [fb:name][fb:name]
- [fb:profile-pic][fb:profile-pic]
- [fb:serverfbml][fb:serverfbml]
- [fb:share-button][fb:share-button]

[fb:comments]: http://wiki.developers.facebook.com/index.php/Fb:comments_(XFBML)
[fb:fan]: http://wiki.developers.facebook.com/index.php/Fb:fan
[fb:live-stream]: http://wiki.developers.facebook.com/index.php/Fb:live-stream
[fb:login-button]: http://wiki.developers.facebook.com/index.php/Fb:login-button
[fb:name]: http://wiki.developers.facebook.com/index.php/Fb:name
[fb:profile-pic]: http://wiki.developers.facebook.com/index.php/Fb:profile-pic
[fb:serverfbml]: http://wiki.developers.facebook.com/index.php/Fb:serverFbml
[fb:share-button]: http://wiki.developers.facebook.com/index.php/Fb:share-button_(XFBML)

Documentation
-------------

We have made API documentation available for the public APIs [here][docs]. In
addition, the code itself contains full documentation for the private APIs if
you want to study the internals.

We have a list of [FAQs][FAQs] that detail some of the changes and provide
information about the new SDK.

We are maintaining a [changelog][changelog] as we update the SDK. Since this is
an Beta SDK, we might need to break compatibility between releases if the need
arises.

The repository also contains simple [examples][examples] showing the use of the
SDK with popular JavaScript libraries such as [Dojo][Dojo], [jQuery][jQuery],
[MooTools][MooTools], [Prototype][Prototype] and [YUI][YUI].


[docs]: http://developers.facebook.com/docs/?u=facebook.joey.FB "Public API Documentation"
[Dojo]: http://www.dojotoolkit.org/
[jQuery]: http://jquery.com/
[MooTools]: http://mootools.net/
[Prototype]: http://prototypejs.org/
[YUI]: http://developer.yahoo.com/yui/
[FAQs]: http://wiki.github.com/facebook/connect-js/faq
[changelog]: http://github.com/facebook/connect-js/tree/master/changelog.md
[examples]: http://github.com/facebook/connect-js/tree/master/examples/



Feedback
--------

We are relying on the [GitHub issues tracker][issues] linked from above for
feedback. File bugs or other issues [here][issues].

[issues]: http://github.com/facebook/connect-js/issues



Tests
-----

We are working hard to ensure your experience using Connect is stable. In order
to keep us nimble and allow us to bring you new functionality, without
compromising on stability, we have ensured full test coverage of the new SDK.
We are including this in the open source repository to assure you of our
commitment to quality, but also with the hopes that you will contribute back to
help keep it stable. The easiest way to do so is to file bugs and include a
test case.
