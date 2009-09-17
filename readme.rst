============
Introduction
============

Facebook Connect_ is way to make your application more social. With the
it you gain access to:

    #. **Identity**: the user's name, photo and more [User_].
    #. **Social Graph**: the user's friends and connections [Connection_].
    #. **Distribution**: the Stream, and the ability to communicate [Publishing_]
    #. **Integration**: publishers, canvas pages, profile boxes & tabs.

This guide is for using the Mu JavaScript library to access the above on your
site. Mu is a very small library which you can use along with your favourite
JavaScript library such as Dojo_, jQuery_, MooTools_ or YUI_.

.. _Connect: http://www.facebook.com/advertising/?connect
.. _User: http://wiki.developers.facebook.com/index.php/User_(FQL)
.. _Connection: http://wiki.developers.facebook.com/index.php/Connection_(FQL)
.. _Dojo: http://www.dojotoolkit.org/
.. _jQuery: http://jquery.com/
.. _MooTools: http://mootools.net/
.. _YUI: http://developer.yahoo.com/yui/


===============
Getting Started
===============

Console
-------

A Console_ is available which demonstrates the various features provided
by the library. `Click here and try it out`__.

.. _Console: http://mu.daaku.org/console/
__ Console_


Examples
--------

- `Dojo / Login`_
- `jQuery / Login`_
- `MooTools / Login`_
- `YUI2 / Login`_

.. _Dojo / Login: http://mu.daaku.org/examples/dojo/login.html
.. _jQuery / Login: http://mu.daaku.org/examples/jquery/login.html
.. _MooTools / Login: http://mu.daaku.org/examples/mootools/login.html
.. _YUI2 / Login: http://mu.daaku.org/examples/yui2/login.html


Bootstrap
---------

#. Create a application at http://www.facebook.com/developers/createapp.php
    #. Give it a name, Agree to the TOS.
    #. Click on the *Connect* entry on the left hand navigation.
    #. Enter your website URL in *Connect URL*.
    #. Save Changes
    #. Copy the API Key
#. *Optional:* Use one of the Examples_ to get started.

Here's the minimal you need before calling most of the API::

    <div id="mu-hidden-root"></div>
    <script src="http://mu.daaku.org/m.js"></script>
    <script>
        Mu.init('YOUR API KEY');
    </script>

Note: ``Mu.publish()`` and ``Mu.share()`` can be used without registering an
application or calling ``Mu.init()``.


==============================
Authentication & Authorization
==============================

Status
------

The User's Status or the question of "who is the current user" is the first
thing you will typically start with. For the answer, we ask facebook.com.
Facebook will answer this question in one of two ways:

    #. Someone you don't know.
    #. Someone you know and have interacted with. Here's a session for them.

Here's how you find out::

    Mu.status(function(session) {
        if (session) {
            // someone you know
        } else {
            // someone you don't know
        }
    });


Login
-----

Once you have determined the user's status, you may need to prompt the user to
login. It is best to delay this action to reduce user friction when they first
arrive at your site. You can then prompt and show them the "Connect with
Facebook" button bound to an event handler which does the following::

    Mu.login(function(session) {
        if (session) {
            // user successfully logged in
        } else {
            // user cancelled login
        }
    });

You should **only** call this on a user event as it opens a
popup. Most browsers block popups, *unless* they were initiated from a
user event, such as a click on a button or a link.


Permissions
-----------

Depending on your application's needs, you may need additional permissions from
the user. A large number of calls do not require any additional permissions, so
you should first make sure you need a permission. This is a good idea because
this process potentially adds friction to the user's process. Another point to
remember is that this call can be made even *after* the user has first
connected. So you may want to delay asking for permissions until as
late as possible::

    Mu.login(function(session, perms) {
        if (session) {
            if (perms) {
                // user is logged in and granted some permissions.
                // perms is a command separated list of the granted permissions
            } else {
                // user is logged in, but did not grant any permissions
            }
        } else {
            // user is not logged in
        }
    }, 'read_stream,publish_stream,offline_access');


Logout
------

Just like logging in is tied to facebook.com, so is logging out.  The
status shared between your site and Facebook, and logging out affects
both sites. This is a simple call::

    Mu.logout(function() {
        // user is now logged out
    });


Session on the Server
---------------------

In order to check on your server who the current user is, you want to pass back
the session. Typically this is done via a cookie, but its up to you how to do
it. On the server you can validate the authenticity by validating the
signature. You should also make an API call to facebook.com to ensure the
session is still active.



=========
API Calls
=========

Once you have a session for the current user, you will want to access data
about that user, such as getting their name & profile picture, friends lists or
upcoming events they will be attending. In order to do this, you will be making
signed API calls to Facebook using their session. Suppose we want to alert the
current user's name::

    Mu.api(
        { method: 'users.getInfo', fields: 'name', uids: Mu.session().uid },
        function(response) {
            alert(response[0].name);
        }
    );

API Calls are listed here: http://wiki.developers.facebook.com/index.php/API


FQL
---

Facebook Query Language [FQL_] is a SQL like query language that allows access
to various facebook data in a generic manner. This is a more efficient way of
getting data from Facebook. The same example as above using FQL_::

    Mu.api(
        {
            method: 'fql.query',
            query: 'SELECT name FROM profile WHERE id=' + Mu.session().uid
        },
        function(response) {
            alert(response[0].name);
        }
    );

FQL is the preferred way of reading data from Facebook (write/update/delete
queries are done via simpler URL parameters). FQL.multiQuery is also very
crucial for good performance, as it allows efficiently collecting different
types of data.

FQL is described here: http://wiki.developers.facebook.com/index.php/FQL

FQL Tables are listed here:
http://wiki.developers.facebook.com/index.php/FQL_Tables

.. _FQL: http://wiki.developers.facebook.com/index.php/FQL


===========
Integration
===========

Publishing
----------

This is the main, fully featured distribution mechanism for you to publish into
the user's stream. It can be used, with or without an API key. With an API key
you can control the Application Icon and get attribution.

Publishing is a powerful feature that allows you to submit rich media and
provide a integrated experience with control over your stream post. You can
guide the user by choosing the prompt, and/or a default message which they may
customize. In addition, you may provide image, video, audio or flash based
attachments with along with their metadata. You also get the ability to provide
action links which show next to the "Like" and "Comment" actions. All this
together provides you full control over your stream post. In addition, if you
may also specify a target for the story, such as another user or a page.

Here's an example call utilizing some of the features::

    var post = {
        message: 'getting educated about Facebook Connect',
        attachment: {
          name: 'Mu Connect',
          caption: 'A micro Facebook Connect library.',
          description: (
            'Mu is a small JavaScript library that allows you to harness the ' +
            'power of Facebook, bringing the user\'s identity, social graph ' +
            'and distribution power to your site.'
          ),
          href: 'http://mu.daaku.org/',
        },
        action_links: [
            { text: 'Mu Console', href: 'http://mu.daaku.org/' },
            { text: 'GitHub Repo', href: 'http://github.com/nshah/mu' }
        ],
        user_prompt_message: 'Share your thoughts about Mu Connect'
    };

    Mu.publish(
        post,
        function(post) {
            if (post) {
                alert(
                    'The post was successfully published. ' +
                    'Post ID: ' + post.post_id +
                    ' .Message: ' + post.message
                );
            } else {
                alert('The post was not published.');
            }
        }
    );

Publishing is described in greater detail here:
http://wiki.developers.facebook.com/index.php/Stream.publish. The API call and
the ``Mu.publish()`` method have the same parameters.

Attachments are described here:
http://wiki.developers.facebook.com/index.php/Attachment_%28Streams%29.

Action links are described here:
http://wiki.developers.facebook.com/index.php/Action_Links.


Sharing
-------

Sharing is the light weight way of distribution your content. As opposed to the
structured data explicitly given in the publish call, with share you simply
provide the URL and optionally a title::

    Mu.share('http://mu.daaku.org/', 'Mu Connect');

Both arguments are optional, and just calling ``Mu.share()`` will share the
current page.



=================
How does it work?
=================

Facebook Connect works on top of HTTP. If you're interested in the
underlying techniques, there are two you should be aware of.


Redirects
---------

The browser driven flows used by Connect for `Authentication & Authorization`_,
Permissions_, Publishing_ and so on are built using redirects. When you popup a
window for the user to perform an action on facebook.com, you may want to know
the result of the action that the user took. In order to get this result, we
pass URLs to facebook.com that the user's browser will get redirected to based
on the action they performed. This is most often seen with the 'next' and
'cancel_url' parameters.

For example, suppose we want facebook.com to prompt the user to perform an
action. As part of this, facebook.com shows a dialog, which has two buttons:
"Okay" and "Cancel". We want find out if the user clicked on "Okay" or
"Cancel". We would popup a URL with two parameters, such as:

    - next: http://mu.daaku.org/prompt/yes
    - cancel_url: http://mu.daaku.org/prompt/cancel

Now when we popup the facebook.com window with the two parameters as above
given in the URL, facebook.com will redirect the user to one of the given URLs
based on the user's action. If the user visits http://mu.daaku.org/prompt/yes
then you know they clicked on "Okay", and if they visit
http://mu.daaku.org/prompt/cancel you know they clicked on the cancel button.
You should be aware of CSRF issues and use tokens as appropriate if you are
directly using these URLs (Mu takes care of it for you). Note, this is made
available only on some dialogs, and typically only when a session key is
provided to ensure the user's privacy and safety.


REST
----

In order to access user's data or make API calls to facebook, you will use REST
style HTTP calls. These can be made via JavaScript, Flash or on your server
with Python, PHP, Perl or virtually any other language.

These are standard GET/POST calls identical to what a browser usually does. If
you are accessing Authenticated data, then you may need to sign them.
Signatures are discussed in the next section.
