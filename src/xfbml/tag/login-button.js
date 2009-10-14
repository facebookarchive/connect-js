/**
 * @module Mu
 * @provides Mu.XFBML.Tag.LoginButton
 *
 * @requires Mu.Prelude
 *           Mu.XFBML.Core
 *           Mu.API
 */

/**
 * Login Button.
 *
 * @class Mu.XFBML.Tag.LoginButton
 * @static
 * @access private
 */
Mu.copy('XFBML.Tag.LoginButton', {
  /**
   * The tag name.
   *
   * @access private
   * @type String
   */
  name: 'login-button',

  /**
   * Returns the Attribute Configuration.
   *
   * @access private
   * @returns {Object} the Attribute Configuration.
   */
  attrConfig: function() {
    var Attr = Mu.XFBML.Attr;
    return {
      autologoutlink : Attr.bool(false),
      background     : Attr.ienum('light', ['white', 'light', 'dark']),
      length         : Attr.ienum('short', ['short', 'long']),
      onlogin        : Attr.any(),
      onlogout       : Attr.any(),
      size           : Attr.ienum('large', ['small', 'medium', 'large'])
    };
  },

  /**
   * Process the node.
   *
   * @access private
   * @param node   {Node}      a DOM Node
   * @param config {Object}    the tag configuration
   * @param cb     {Function}  function to invoke upon completion/error
   */
  process: function(node, config, cb) {
    var type = Mu._session ? 'Logout' : 'Connect'; // TODO i18n

    // no content if user is already logged in and autologoutlink is not
    // specified
    if (Mu._session && !config.autologoutlink) {
      node.innerHTML = '';
      cb(node);
      return;
    }

    // size=small only has the length=short option
    if (config.size == 'small') {
      config.length = 'short';
    }

    var src;
    if (Mu._session) {
      src = (
        'http://static.ak.fbcdn.net/images/fbconnect/logout-buttons/logout_' +
        config.size +
        '.gif'
      );
    } else {
      src = (
        'http://static.ak.fbcdn.net/images/fbconnect/login-buttons/connect_' +
        config.background +
        '_' +
        config.size +
        '_' +
        config.length +
        '.gif'
      );
    }

    // onclick handler
    node.onclick = function() {
      if (Mu._session) {
        Mu.logout(function() {
          if (config.onlogout) {
            eval(config.onlogout);
          }
        });
      } else {
        Mu.login(function() {
          if (config.onlogin) {
            eval(config.onlogin);
          }
        });
      }
    };

    // finally, the content
    node.innerHTML = '<img src="' + src + '" alt="' + type + '">';

    // done
    cb(node);
  }
});
