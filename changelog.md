Cookie Format
-------------

*Date*: 20th November, 2009

We were including the '=' sign in the cookie value which although works on many
servers, is not actually valid accoring to [RFC2965][CookieRFC]. The correct
way to include the '=' character is by having the cookie value be quoted.

The result is that you will need to update your server side logic for parsing
the Cookie to handle the quotes if needed.

[CookieRFC]: http://www.faqs.org/rfcs/rfc2965.html

Options for FB.login
-------------

*Date*: 25th November, 2009

We changed the signature for FB.login. It now takes a dictionary of
options instead of just a permissions string. This will allow us to maintain
backwards compatibility in the future if we expand the arguments.

XFBML and Advanced Data layer
-------------

*Date*: 18th December, 2009

Alpha release for an implementation of [XFBML] and an [advanced data layer].

[XFBML]: http://wiki.github.com/facebook/connect-js/xfbml
[advanced data layer]: http://wiki.github.com/facebook/connect-js/data-layer

Iframe Dialogs
-------------

*Date*: 11th Match, 2010

Support for iframe dialogs via [FB.ui()][FB.ui].

[FB.ui]: http://developers.facebook.com/docs/?u=facebook.joey.FB.ui "UI Dialogs"
