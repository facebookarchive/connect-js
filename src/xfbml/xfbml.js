/**
 * @provides fb.XFBML
 * @layer XFBML
 * @requires fb.prelude fb.Loader.use fb.Loader
 *
 *
 */

/**
 * This provides public APIs for developer to programming XFBML
 * @class FB.XFBML
 */
FB.provide('XFBML', {
  /**
   * Set XFBML markup on a given DOM node. This is like
   * setInnerHTML
   * Example: FB.XFBML.set($('container',
   *          '<fb:name uid="4"></fb:name><div>.....')
   * @param {DOMElement} dom  DOM element
   * @param {string} markup XFBML markup. It may contain reguarl
   *         HTML markup as well.
   * @static
   */
  set: function(dom, markup) {
    dom.innerHTML = markup;
    FB.XFBML.parse(dom);
  },

  /**
   * Parse and render XFBML markup inside a DOM element
   * @param [DOMElement} dom [Optional] Container DOM of XFBML
   *         By default, we parse document.body
   * @static
   */
  parse: function(dom) {
    dom = dom || document.body;

    // First, find all tags that are present
    FB.forEach(FB.XFBML._tagInfos, function(tagInfo) {
      xfbmlDoms = FB.XFBML._getDomElements(dom,
                                           tagInfo.xmlns,
                                           tagInfo.localName);
      for(var i=0; i < xfbmlDoms.length; i++) {
        FB.XFBML._processElement(xfbmlDoms[i], tagInfo);
      };
    });

    // TODO: We need put functionality to detect when
    // all rendering is completed and fire an event
  },

  /**
   * Register an XFBML tag, for example:
   *
   *       FB.XFBML.registerTag("fb", "login-button", "FB.XFBML.LoginButton");
   *
   * @param {Object} tagInfo
   * an object containiner the following keys:
   * - xmlns
   * - localName
   * - className
   */
  registerTag: function(tagInfo) {
    FB.XFBML._tagInfos.push(tagInfo);
  },


  //////////////// Private methods ////////////////////////////////////////////

  /**
   * Process an XFBML element
   * @private
   * @static
   */
  _processElement: function(dom, tagInfo) {
    // Check if element for the dom already exists
    var element = dom._element;
    if (element) {
      element.process();
    } else {
      var processor = function() {
         var fn = eval(tagInfo.className);
         element = dom._element = new fn(dom);
         element.process();
      };

      if (FB.CLASSES[tagInfo.className.substr(3)]) {
        processor();
      } else {
        // Load necessary class on-demand if necessary
        // haste component name is "xfbml:" plus the
        // tag name
        var component = 'xfbml.' +
          tagInfo.xmlns + ':' + tagInfo.localName;

        FB.Loader.use(component, processor);
      }
    }
  },



  /**
   * @param  {Object} element
   * @param  {String} xmlns
   * @param  {String} localName
   * @return  DOMElementCollection
   * @private
   * @static
   */
  _getDomElements: function(dom, xmlns, localName) {
    // Different browsers behave slightly differently in handling tags
    // with custom namespace.
    switch (FB.Dom.getBrowserType()) {
    case 'mozilla':
      return dom.getElementsByTagNameNS(null, xmlns + ':' + localName);
      break;
    case 'ie':
      var docNamespaces = document.namespaces;
      if (docNamespaces && docNamespaces[xmlns]) {
        return dom.getElementsByTagName(localName);
      } else {
        //  it seems that developer tends to forget to declare the fb namespace
        //  in the HTML tag (xmlns:fb="http://www.facebook.com/2008/fbml")
        //  IE has a stricter implementation for custom tags.
        //  If namespace is missing, custom DOM dom does not appears to be
        //  fully functional. For example, setting innerHTML on it will
        //  fail.
        //  As such, we can't tolerate the absence the namespace
        //  declaration. We can however, detect this mistake and throw an
        //  exception to help developer identify the problem and fix it.
        //  If a namespace is not declared, we can still find the
        //  element using GetElementssByTagName with namespace appended.
        return dom.getElementsByTagName(xmlns + ':' + localName);
      }
      break;
    default:
      return dom.getElementsByTagName(xmlns + ':' + localName);
      break;
    }
  },

  /**
   * Register the default set of base tags.
   */

  _tagInfos:
    [{xmlns: 'fb', localName: 'profile-pic',  className: 'FB.XFBML.ProfilePic'},
     {xmlns: 'fb', localName: 'name',         className: 'FB.XFBML.Name'},
     {xmlns: 'fb', localName: 'login-button', className: 'FB.XFBML.LoginButton'},
     {xmlns: 'fb', localName: 'share-button', className: 'FB.XFBML.ShareButton'}
    ],

  _list: []
});

/*
 * For IE, we will try to detect if document.namespaces contains 'fb' already
 * and add it if it does not exist.
 */
if (document.namespaces && !document.namespaces.item['fb']) {
   document.namespaces.add('fb');
}
