/**
 * @provides fb.Dom
 * @layer Basic
 * @requires fb.prelude fb.String fb.Array
 */

/**
 * This provides helper methods related to DOM
 * @class FB.Dom
 * @static
 * @private
 */
FB.provide('Dom', {
  /**
   * @param  {DOMElement} dom
   * @param  {String} newClass
   */
  addCss: function(dom, newClass) {
    var cssClassWithSpace = ' ' + dom.className + ' ';
    var newClassWithSpace = ' ' + newClass + ' ';
    if (cssClassWithSpace.indexOf(newClassWithSpace) < 0) {
      dom.className = dom.className + ' ' + newClass;
    }
  },
  /**
   * @param  {DOMElement} dom
   * @param  {String} className
   * @return  Boolean
   */
  containsCss: function(dom, className) {
    var cssClassWithSpace = ' ' + dom.className + ' ';
    return cssClassWithSpace.indexOf(' ' + className + ' ') >= 0;
  },
  /**
   * @param  {DOMElement} dom
   * @param  {String} className
   */
  removeCss: function(dom, className) {
    var cssClassWithSpace = ' ' + dom.className + ' ';
    var classNameWithSpace = ' ' + className + ' ';
    var index = cssClassWithSpace.indexOf(classNameWithSpace);
    if (index >= 0) {
      var newClassName = cssClassWithSpace.substring(1, index) +
        cssClassWithSpace.substring(index + classNameWithSpace.length,
                                    cssClassWithSpace.length - 1);
      dom.className = newClassName;
    }
  },

  /**
   * Dynamically add a script tag
   */
   addScript: function(src) {
     var script = document.createElement('script');
     script.type = "text/javascript";
     script.src = src;
     return document.getElementsByTagName('HEAD')[0].appendChild(script);
   },

   addCssRules: function(s, id) {
     if (!FB.Dom._cssRules) {
       FB.Dom._cssRules = {};
     }

     // Check if this style sheet is already applied
     if (id in FB.Dom._cssRules) {
       return;
     }

     FB.Dom._cssRules[id] = true;

     if (FB.Dom.getBrowserType() != 'ie') {
       style = document.createElement('style');
       style.type = "text/css";
       style.innerHTML = s;
       document.getElementsByTagName('HEAD')[0].appendChild(style);
     } else {
       var re = /([\w|#|\.|\\][^{]*){(.*?)}/mg,
         a,
         style = document.createStyleSheet();
       while (a = re.exec(s)) {
         var rules = FB.Array.map(a[1].split(','), FB.String.trim);
         for (var i=0; i < rules.length; i++) {
           style.addRule(rules[i], a[2]);
         }
       }
     }
   },

   /**
   * Get browser type
   * @return string 'ie' | 'mozilla' |'safari' | 'other'
   */
  getBrowserType: function() {
    if (!FB.Dom._browserType) {
      var userAgent = window.navigator.userAgent.toLowerCase();
          // list of known browser and
          keys = ['msie', 'firefox', 'gecko',   'safari'];
          names = ['ie',  'mozilla', 'mozilla', 'safari'];
      this.hostName = 'other';
      for(var i = 0; i < keys.length; i++) {
        if (userAgent.indexOf(keys[i]) >= 0) {
          FB.Dom._browserType = names[i];
          break;;
        }
      }
    }
    return FB.Dom._browserType;
  }
});
