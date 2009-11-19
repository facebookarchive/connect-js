Facebook Connect JavaScript SDK
===============================


Facebook [Connect][Connect] is a set of APIs that make your application more
social. With it you gain access to:

1. Identity: the user's name, photo and more [User][FQL_User].
2. The Graph: the user's friends and connections
   [Connection][FQL_Connection].
3. Distribution: the Stream, and the ability to communicate
   [Publishing][Publishing].
4. Integration: publishers, canvas pages, profile tabs.


[Connect]: http://developers.facebook.com/connect "Facebook | Connect"
[FQL_User]: http://wiki.developers.facebook.com/index.php/User_(FQL) "FQL User Table"
[FQL_Connection]: http://wiki.developers.facebook.com/index.php/Connection_(FQL) "FQL Connection Table"
[Publishing]: http://developers.facebook.com/docs/?u=facebook.jslib-alpha.FB.publish "Stream Publishing"

This repository contains the open source JavaScript SDK that allows you to
utilize the above on your website. Except as otherwise noted, the Facebook
Connect JavaScript SDK is licensed under the Apache Licence, Version 2.0
(http://www.apache.org/licenses/LICENSE-2.0.html)



Status
------

This is an **alpha** release. In order to guide the development of the library
and allow you to freely inspect and use the source, we have open sourced the
client JavaScript SDK. We do not have all the features we intend to build, but
we will be building them incrementally in a transparent manner.

Currently, we have the first iteration of the JavaScript APIs that allow you
to:

- Handle Authentication & Authorization
- Make API calls
- Publish to the Stream

Some major aspects that are still missing are:

- XFBML
- Widgets
- Data Access Abstractions


We will be actively iterating on this, and expect to have a beta release
shortly. Once we've worked out all the kinks, we will announce the final
release. Remember, this is an **alpha** release!


Usage
-----

The [examples][examples] are a good place to start. The minimal you'll need to
have is:

    <div id="fb-root"></div>
    <script src="http://static.ak.fbcdn.net/connect/en_US/core.js"></script>
    <script>
      FB.init({ apiKey: 'YOUR API KEY' });
    </script>

Note: For easier development, we also have a unminifed (raw code with comments)
available using this URL:

    http://static.ak.fbcdn.net/connect/en_US/core.debug.js

[examples]: http://github.com/facebook/connect-js/tree/master/examples/

Documentation
-------------

We have made API documentation available for the public APIs [here][docs]. In
addition, the code itself contains full documentation for the private APIs if
you want to study the internals.

We have a list of [FAQs][FAQs] that detail some of the changes and provide
information about the new SDK.

We are maintaining a [changelog][changelog] as we update the SDK. Since this is
an Alpha SDK, we might need to break compatibility between releases if the need
arises.

The repository also contains simple [examples][examples] showing the use of the
SDK with popular JavaScript libraries such as [Dojo][Dojo], [jQuery][jQuery],
[MooTools][MooTools], [Prototype][Prototype] and [YUI][YUI].


[docs]: http://developers.facebook.com/docs/?u=facebook.jslib-alpha.FB "Public API Documentation"
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
