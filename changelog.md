Cookie Format
-------------

*Date*: 20th November, 2009

We were including the '=' sign in the cookie value which although works on many
servers, is not actually valid accoring to [RFC2965][CookieRFC]. The correct
way to include the '=' character is by having the cookie value be quoted.

The result is that you will need to update your server side logic for parsing
the Cookie to handle the quotes if needed.

[CookieRFC]: http://www.faqs.org/rfcs/rfc2965.html
