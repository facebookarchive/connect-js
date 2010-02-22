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
 * @provides fb.dom
 * @layer basic
 * @requires fb.prelude fb.string fb.array
 */

/**
 * This provides helper methods related to DOM.
 *
 * @class FB.Dom
 * @static
 * @private
 */
FB.provide('Dom', {
  /**
   * Check if the element contains a class name.
   *
   * @param dom {DOMElement} the element
   * @param className {String} the class name
   * @return {Boolean}
   */
  containsCss: function(dom, className) {
    var cssClassWithSpace = ' ' + dom.className + ' ';
    return cssClassWithSpace.indexOf(' ' + className + ' ') >= 0;
  },

  /**
   * Add a class to a element.
   *
   * @param dom {DOMElement} the element
   * @param className {String} the class name
   */
  addCss: function(dom, className) {
    if (!FB.Dom.containsCss(dom, className)) {
      dom.className = dom.className + ' ' + className;
    }
  },

  /**
   * Remove a class from the element.
   *
   * @param dom {DOMElement} the element
   * @param className {String} the class name
   */
  removeCss: function(dom, className) {
    if (FB.Dom.containsCss(dom, className)) {
      dom.className = dom.className.replace(className, '');
      FB.Dom.removeCss(dom, className); // in case of repetition
    }
  },

  /**
   * Dynamically add a script tag.
   *
   * @param src {String} the url for the script
   */
  addScript: function(src) {
    var script = document.createElement('script');
    script.type = "text/javascript";
    script.src = src;
    return document.getElementsByTagName('HEAD')[0].appendChild(script);
  },

  /**
   * Add CSS rules using a <style> tag.
   *
   * @param styles {String} the styles
   * @param names {Array} the component names that the styles represent
   */
  addCssRules: function(styles, names) {
    if (!FB.Dom._cssRules) {
      FB.Dom._cssRules = {};
    }

    // note, we potentially re-include CSS if it comes with other CSS that we
    // have previously not included.
    var allIncluded = true;
    FB.Array.forEach(names, function(id) {
      if (!(id in FB.Dom._cssRules)) {
        allIncluded = false;
        FB.Dom._cssRules[id] = true;
      }
    });

    if (allIncluded) {
      return;
    }

//#JSCOVERAGE_IF
    if (FB.Dom.getBrowserType() != 'ie') {
      var style = document.createElement('style');
      style.type = 'text/css';
      style.textContent = styles;
      document.getElementsByTagName('HEAD')[0].appendChild(style);
    } else {
      document.createStyleSheet().cssText = styles;
    }
  },

  /**
   * Get browser type.
   *
   * @return string 'ie' | 'mozilla' |'safari' | 'other'
   */
  getBrowserType: function() {
    if (!FB.Dom._browserType) {
      var
        userAgent = window.navigator.userAgent.toLowerCase(),
        // list of known browser. NOTE: the order is important
        keys  = ['msie', 'firefox', 'safari', 'gecko'],
        names = ['ie',   'mozilla', 'safari', 'mozilla'];
      for (var i = 0; i < keys.length; i++) {
        if (userAgent.indexOf(keys[i]) >= 0) {
          FB.Dom._browserType = names[i];
          break;
        }
      }
    }
    return FB.Dom._browserType;
  },

  /**
   * Get the viewport info. Contains size and scroll offsets.
   *
   * @returns {Object} with the width and height
   */
  getViewportInfo: function() {
    // W3C compliant, or fallback to body
    var root = (document.documentElement && document.compatMode == 'CSS1Compat')
      ? document.documentElement
      : document.body;
    return {
      scrollTop  : root.scrollTop,
      scrollLeft : root.scrollLeft,
      width      : self.innerWidth  ? self.innerWidth  : root.clientWidth,
      height     : self.innerHeight ? self.innerHeight : root.clientHeight
    };
  }
});
