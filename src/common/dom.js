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
 * @requires fb.prelude
 *           fb.event
 *           fb.string
 *           fb.array
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
   * Returns the computed style for the element
   *
   * note: requires browser specific names to be passed for specials
   *       border-radius -> ('-moz-border-radius', 'border-radius')
   *
   * @param dom {DOMElement} the element
   * @param styleProp {String} the property name
   */
  getStyle: function (dom, styleProp) {
    var y = false, s = dom.style;
    if (styleProp == 'opacity') {
      if (s.opacity) { return s.opacity * 100; }
      if (s.MozOpacity) { return s.MozOpacity * 100; }
      if (s.KhtmlOpacity) { return s.KhtmlOpacity * 100; }
      if (s.filters) { return s.filters.alpha.opacity; }
      return 0; // TODO(alpjor) fix default opacity
    } else {
      if (dom.currentStyle) { // camelCase (e.g. 'marginTop')
        FB.Array.forEach(/\-([a-z])/.exec(styleProp), function(match) {
          styleProp = styleProp.replace('-' + match, match.toUpperCase());
        });
        y = dom.currentStyle[styleProp];
      } else { // dashes (e.g. 'margin-top')
        FB.Array.forEach(/([A-Z])/.exec(styleProp), function(match) {
          styleProp = styleProp.replace(match, '-'+ match.toLowerCase());
        });
        if (window.getComputedStyle) {
          y = document.defaultView
           .getComputedStyle(dom,null).getPropertyValue(styleProp);
          // special handling for IE
          // for some reason it doesn't return '0%' for defaults. so needed to
          // translate 'top' and 'left' into '0px'
          if (styleProp == 'background-position-y' ||
              styleProp == 'background-position-x') {
            if (y == 'top' || y == 'left') { y = '0px'; }
          }
        }
      }
    }
    return y;
  },

  /**
   * Sets the style for the element to value
   *
   * note: requires browser specific names to be passed for specials
   *       border-radius -> ('-moz-border-radius', 'border-radius')
   *
   * @param dom {DOMElement} the element
   * @param styleProp {String} the property name
   * @param value {String} the css value to set this property to
   */
  setStyle: function(dom, styleProp, value) {
    var s = dom.style;
    if (styleProp == 'opacity') {
      if (value >= 100) { value = 99.999; } // fix for Mozilla < 1.5b2
      if (value < 0) { value = 0; }
      s.opacity = value/100;
      s.MozOpacity = value/100;
      s.KhtmlOpacity = value/100;
      if (s.filters) { s.filters.alpha.opacity = value; }
    } else { s[styleProp] = value; }
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
  },

  /**
   * Bind a function to be executed when the DOM is ready. It will be executed
   * immediately if the DOM is already ready.
   *
   * @param {Function} the function to invoke when ready
   */
  ready: function(fn) {
    if (FB.Dom._isReady) {
      fn();
    } else {
      FB.Event.subscribe('dom.ready', fn);
    }
  }
});

// NOTE: This code is self-executing. This is necessary in order to correctly
// determine the ready status.
(function() {
  // Handle when the DOM is ready
  function domReady() {
    FB.Dom._isReady = true;
    FB.Event.fire('dom.ready');
    FB.Event.clear('dom.ready');
  }

  // In case we're already ready.
  if (FB.Dom._isReady || document.readyState == 'complete') {
    return domReady();
  }

  // Good citizens.
  if (document.addEventListener) {
    document.addEventListener('DOMContentLoaded', domReady, false);
  // Bad citizens.
  } else if (document.attachEvent) {
    document.attachEvent('onreadystatechange', domReady);
  }

  // Bad citizens.
  // If IE is used and page is not in a frame, continuously check to see if
  // the document is ready
  if (FB.Dom.getBrowserType() == 'ie' && window === top) {
    (function() {
      try {
        // If IE is used, use the trick by Diego Perini
        // http://javascript.nwbox.com/IEContentLoaded/
        document.documentElement.doScroll('left');
      } catch(error) {
        setTimeout(arguments.callee, 0);
        return;
      }

      // and execute any waiting functions
      domReady();
    })();
  }

  // Ultimate Fallback.
  var oldonload = window.onload;
  window.onload = function() {
    domReady();
    if (oldonload) {
      if (typeof oldonload == 'string') {
        eval(oldonload);
      } else {
        oldonload();
      }
    }
  };
})();
