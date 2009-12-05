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
    // Parse first
    // Each TagInfo is an array
    // [<namespace>, <tag-name>, <implementation class/component name>]

    // First, find all tags that are present
    FB.forEach(FB.XFBML._tagInfos, function(tagInfo) {
      xfbmlDoms = FB.XFBML._getDoms(dom, tagInfo[0], tagInfo[1]);
      for(var i=0; i < xfbmlDoms.length; i++) {
        FB.XFBML._processElement(xfbmlDoms[i], tagInfo);
      };
    });

    // TODO: We need put functionality to detect when
    // all rendering is completed and fire an event
  },

  /**
   * Register a custom XFBML Tag
   * Example: FB.XFBML.registerTag('digg', 'digg-button', 'Digg.DiggButton'])
   *
   * @param {object} An array of the format ['<xmls-namespace>', '<tag-name>',
   *       '<name of the JS class that implements the tag>']
   * @static
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
    if (!element) {
      var className = tagInfo[2];
      var comp = tagInfo[3];
      // Load necessary class on-demand if necessary
      FB.Loader.use(comp, function() {
        fn = eval(className);
        element = dom._element = new fn(dom);
        element.process();
      });
    } else {
      element.process();
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
  _getDoms: function(dom, xmlns, localName) {
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

  _tagInfos: [
    ['fb', 'profile-pic','FB.XFBML.ProfilePic', 'fb.XFBML.ProfilePic'],
    ['fb', 'name','FB.XFBML.Name', 'fb.XFBML.Name'],
    ['fb', 'login-button', 'FB.XFBML.LoginButton', 'fb.XFBML.LoginButton'],
    ['fb', 'share-button', 'FB.XFBML.ShareButton', 'fb.XFBML.ShareButton']
  ],
  _list:[]
});

/*
 * For IE, we will try to detect if document.namespaces contains 'fb' already
 * and add it if it does not exist.
 */
if (document.namespaces && !document.namespaces.item['fb']) {
   document.namespaces.add('fb');
}
