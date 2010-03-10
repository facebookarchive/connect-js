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
 * @provides fb.flash
 * @requires fb.prelude
 *           fb.qs
 *           fb.content
 */

/**
 * Flash Support.
 *
 * @class FB.Flash
 * @static
 * @access private
 */
FB.provide('Flash', {
  //
  // DYNAMIC DATA
  //
  _minVersions: [
    [9,  0, 159, 0 ],
    [10, 0, 22,  87]
  ],
  _swfPath: 'swf/XdComm.swf',

  /**
   * The onReady callbacks.
   *
   * @access private
   * @type Array
   */
  _callbacks: [],

  /**
   * Initialize the SWF.
   *
   * @access private
   */
  init: function() {
    // only initialize once
    if (FB.Flash._init) {
      return;
    }
    FB.Flash._init = true;

    // the SWF calls this global function to notify that its ready
    // FIXME: should allow the SWF to take a flashvar that controls the name
    // of this function. we should not have any globals other than FB.
    window.FB_OnFlashXdCommReady = function() {
      FB.Flash._ready = true;
      for (var i=0, l=FB.Flash._callbacks.length; i<l; i++) {
        FB.Flash._callbacks[i]();
      }
      FB.Flash._callbacks = [];
    };

    // create the swf
    var
      IE   = !!document.attachEvent,
      swf  = FB._domain.cdn + FB.Flash._swfPath,
      html = (
        '<object ' +
          'type="application/x-shockwave-flash" ' +
          'id="XdComm" ' +
          (IE ? 'name="XdComm" ' : '') +
          (IE ? '' : 'data="' + swf + '" ') +
          (IE
              ? 'classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" '
              : ''
          ) +
          'allowscriptaccess="always">' +
          '<param name="movie" value="' + swf + '"></param>' +
          '<param name="allowscriptaccess" value="always"></param>' +
        '</object>'
      );

    FB.Content.appendHidden(html);
  },

  /**
   * Check that the minimal version of Flash we need is available.
   *
   * @access private
   * @return {Boolean} true if the minimum version requirements are matched
   */
  hasMinVersion: function() {
    if (typeof FB.Flash._hasMinVersion === 'undefined') {
      var
        versionString,
        i,
        l,
        version = [];
      try {
        versionString = new ActiveXObject('ShockwaveFlash.ShockwaveFlash')
                          .GetVariable('$version');
      } catch(x) {
        if (navigator.mimeTypes.length > 0) {
          var mimeType = 'application/x-shockwave-flash';
          if (navigator.mimeTypes[mimeType].enabledPlugin) {
            var name = 'Shockwave Flash';
            versionString = (navigator.plugins[name + ' 2.0'] ||
                             navigator.plugins[name])
                            .description;
          }
        }
      }

      // take the string and come up with an array of integers:
      //   [10, 0, 22]
      if (versionString) {
        var parts = versionString
                      .replace(/\D+/g, ',')
                      .match(/^,?(.+),?$/)[1]
                      .split(',');
        for (i=0, l=parts.length; i<l; i++) {
          version.push(parseInt(parts[i], 10));
        }
      }

      // start by assuming we dont have the min version.
      FB.Flash._hasMinVersion = false;

      // look through all the allowed version definitions.
      majorVersion:
      for (i=0, l=FB.Flash._minVersions.length; i<l; i++) {
        var spec = FB.Flash._minVersions[i];

        // we only accept known major versions, and every supported major
        // version has at least one entry in _minVersions. only if the major
        // version matches, does the rest of the check make sense.
        if (spec[0] != version[0]) {
          continue;
        }

        // the rest of the version components must be equal or higher
        for (var m=1, n=spec.length, o=version.length; (m<n && m<o); m++) {
          if (version[m] < spec[m]) {
            // less means this major version is no good
//#JSCOVERAGE_IF 0
            FB.Flash._hasMinVersion = false;
            continue majorVersion;
//#JSCOVERAGE_ENDIF
          } else {
            FB.Flash._hasMinVersion = true;
            if (version[m] > spec[m]) {
              // better than needed
              break majorVersion;
            }
          }
        }
      }
    }

    return FB.Flash._hasMinVersion;
  },

  /**
   * Register a function that needs to ensure Flash is ready.
   *
   * @access private
   * @param cb {Function} the function
   */
  onReady: function(cb) {
    FB.Flash.init();
    if (FB.Flash._ready) {
      // this forces the cb to be asynchronous to ensure no one relies on the
      // _potential_ synchronous nature.
      window.setTimeout(cb, 0);
    } else {
      FB.Flash._callbacks.push(cb);
    }
  }
});
