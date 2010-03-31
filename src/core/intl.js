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
 * @provides fb.intl
 * @requires fb.prelude
 */

/**
 * Provides i18n machinery.
 *
 * @class FB.Intl
 * @static
 * @access private
 */
FB.provide('Intl', {
  /**
   * Regular expression snippet containing all the characters that we
   * count as sentence-final punctuation.
   */
  _punctCharClass: (
    '[' +
      '.!?' +
      '\u3002' +  // Chinese/Japanese period
      '\uFF01' +  // Fullwidth exclamation point
      '\uFF1F' +  // Fullwidth question mark
      '\u0964' +  // Hindi "full stop"
      '\u2026' +  // Chinese ellipsis
      '\u0EAF' +  // Laotian ellipsis
      '\u1801' +  // Mongolian ellipsis
      '\u0E2F' +  // Thai ellipsis
      '\uFF0E' +  // Fullwidth full stop
    ']'
  ),

  /**
   * Checks whether a string ends in sentence-final punctuation. This logic is
   * about the same as the PHP ends_in_punct() function; it takes into account
   * the fact that we consider a string like "foo." to end with a period even
   * though there's a quote mark afterward.
   */
  _endsInPunct: function(str) {
    if (typeof str != 'string') {
      return false;
    }

    return str.match(new RegExp(
      FB.Intl._punctCharClass +
      '[' +
        ')"' +
        "'" +
        // JavaScript doesn't support Unicode character
        // properties in regexes, so we have to list
        // all of these individually. This is an
        // abbreviated list of the "final punctuation"
        // and "close punctuation" Unicode codepoints,
        // excluding symbols we're unlikely to ever
        // see (mathematical notation, etc.)
        '\u00BB' +  // Double angle quote
        '\u0F3B' +  // Tibetan close quote
        '\u0F3D' +  // Tibetan right paren
        '\u2019' +  // Right single quote
        '\u201D' +  // Right double quote
        '\u203A' +  // Single right angle quote
        '\u3009' +  // Right angle bracket
        '\u300B' +  // Right double angle bracket
        '\u300D' +  // Right corner bracket
        '\u300F' +  // Right hollow corner bracket
        '\u3011' +  // Right lenticular bracket
        '\u3015' +  // Right tortoise shell bracket
        '\u3017' +  // Right hollow lenticular bracket
        '\u3019' +  // Right hollow tortoise shell
        '\u301B' +  // Right hollow square bracket
        '\u301E' +  // Double prime quote
        '\u301F' +  // Low double prime quote
        '\uFD3F' +  // Ornate right parenthesis
        '\uFF07' +  // Fullwidth apostrophe
        '\uFF09' +  // Fullwidth right parenthesis
        '\uFF3D' +  // Fullwidth right square bracket
        '\s' +
      ']*$'
    ));
  },

  /**
   * i18n string formatting
   *
   * @param str {String} the string id
   * @param args {Object} the replacement tokens
   */
  _tx: function (str, args) {
    // Does the token substitution for tx() but without the string lookup.
    // Used for in-place substitutions in translation mode.
    if (args !== undefined) {
      if (typeof args != 'object') {
        FB.log(
          'The second arg to FB.Intl._tx() must be an Object for ' +
          'tx(' + str + ', ...)'
        );
      } else {
        var regexp;
        for (var key in args) {
          if (args.hasOwnProperty(key)) {
            // _tx("You are a {what}.", {what:'cow!'}) should be "You are a
            // cow!" rather than "You are a cow!."

            if (FB.Intl._endsInPunct(args[key])) {
              // Replace both the token and the sentence-final punctuation
              // after it, if any.
              regexp = new RegExp('\{' + key + '\}' +
                                    FB.Intl._punctCharClass + '*',
                                  'g');
            } else {
              regexp = new RegExp('\{' + key + '\}', 'g');
            }
            str = str.replace(regexp, args[key]);
          }
        }
      }
    }
    return str;
  },

  /**
   * i18n string formatting
   *
   * @access private
   * @param str {String} the string id
   * @param args {Object} the replacement tokens
   */
  tx: function (str, args) {
    // this is replaced by the i18n machinery when the resources are localized
    function tx(str, args) {
      void(0);
    }

    // Fail silently if the string table isn't defined. This behaviour is used
    // when a developer chooses the host the library themselves, rather than
    // using the one served from facebook.
    if (!FB.Intl._stringTable) {
      return null;
    }
    return FBIntern.Intl._tx(FB.Intl._stringTable[str], args);
  }
});
