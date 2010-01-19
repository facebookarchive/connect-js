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
 * @provides fb.xfbml
 * @layer xfbml
 * @requires fb.prelude fb.loader
 */

/**
 * Methods for the rendering of [[wiki:XFBML]] tags.
 *
 * To render the tags, simple use them anywhere in your page,
 * and then call:
 *
 *      FB.XFBML.parse();
 *
 * @class FB.XFBML
 * @static
 */
FB.provide('XFBML', {
  /**
   * Dynamically set XFBML markup on a given DOM element. Use this
   * method if you want to set XFBML after the page has already loaded
   * (for example, in response to an Ajax request or API call).
   *
   * Example:
   * --------
   * Set the innerHTML of a dom element with id "container"
   * to some markup (fb:name + regular HTML) and render it
   *
   *      FB.XFBML.set(FB.$('container'),
   *          '<fb:name uid="4"></fb:name><div>Hello</div>');
   *
   * @param {DOMElement} dom  DOM element
   * @param {String} markup XFBML markup. It may contain reguarl
   *         HTML markup as well.
   */
  set: function(dom, markup) {
    dom.innerHTML = markup;
    FB.XFBML.parse(dom);
  },

  /**
   * Parse and render XFBML markup in the document.
   *
   * Examples
   * --------
   *
   * By default, this is all you need to make XFBML work:
   *
   *       FB.XFBML.parse();
   *
   * Alternately, you may want to only evaluate a portion of
   * the document. In that case, you can pass in the elment.
   *
   *       FB.XFBML.parse(document.getElementById('foo'));
   *
   * @param {DOMElement} dom [Optional] Container DOM of XFBML
   * By default, we parse document.body
   */
  parse: function(dom) {
    dom = dom || document.body;

    // First, find all tags that are present
    FB.forEach(FB.XFBML._tagInfos, function(tagInfo) {
      // default the xmlns if needed
      if (!tagInfo.xmlns) {
        tagInfo.xmlns = 'fb';
      }

      var xfbmlDoms = FB.XFBML._getDomElements(
        dom,
        tagInfo.xmlns,
        tagInfo.localName
      );
      for (var i=0; i < xfbmlDoms.length; i++) {
        FB.XFBML._processElement(xfbmlDoms[i], tagInfo);
      }
    });

    // TODO: We need put functionality to detect when
    // all rendering is completed and fire an event
  },

  /**
   * Register a custom XFBML tag. If you create an custom XFBML tag, you can
   * use this method to register it so the it can be treated like
   * any build-in XFBML tags.
   *
   * Example
   * -------
   *
   * Register fb:name tag that is implemented by class FB.XFBML.Name
   *       tagInfo = {xmlns: 'fb',
   *                  localName: 'name',
   *                  className: 'FB.XFBML.Name'},
   *       FB.XFBML.registerTag(tagInfo);
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
   * Process an XFBML element.
   * @private
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
        // Load necessary class on-demand if necessary. Component name is lower
        // case className.
        var component = tagInfo.className.toLowerCase();
        FB.Loader.use(component, processor);
      }
    }
  },

  /**
   * Get all the DOM elements present under a given node with a
   * given tag name.
   *
   * @param  {Object} element
   * @param  {String} xmlns
   * @param  {String} localName
   * @return  DOMElementCollection
   * @private
   */
  _getDomElements: function(dom, xmlns, localName) {
    // Different browsers behave slightly differently in handling tags
    // with custom namespace.
    switch (FB.Dom.getBrowserType()) {
    case 'mozilla':
      // Use document.body.namespaceURI as first parameter per
      // suggestion by Firefox developers.
      // See https://bugzilla.mozilla.org/show_bug.cgi?id=531662
      return dom.getElementsByTagNameNS(document.body.namespaceURI,
                                        xmlns + ':' + localName);
      break;
    case 'ie':
      var docNamespaces = document.namespaces;
      if (docNamespaces && docNamespaces[xmlns]) {
        return dom.getElementsByTagName(localName);
      } else {
        // it seems that developer tends to forget to declare the fb namespace
        // in the HTML tag (xmlns:fb="http://www.facebook.com/2008/fbml")
        // IE has a stricter implementation for custom tags.
        // If namespace is missing, custom DOM dom does not appears to be
        // fully functional. For example, setting innerHTML on it will
        // fail.
        // As such, we can't tolerate the absence the namespace
        // declaration. We can however, detect this mistake and throw an
        // exception to help developer identify the problem and fix it.
        // If a namespace is not declared, we can still find the
        // element using GetElementssByTagName with namespace appended.
        return dom.getElementsByTagName(xmlns + ':' + localName);
      }
      break;
    default:
      return dom.getElementsByTagName(xmlns + ':' + localName);
      break;
    }
  },

  /**
   * Register the default set of base tags. Each entry must have a localName
   * and a className property, and can optionally have a xmlns property which
   * if missing defaults to 'fb'.
   *
   * NOTE: Keep the list alpha sorted.
   */
  _tagInfos: [
    { localName: 'add-to-wishlist', className: 'FB.XFBML.AddToWishList' },
    { localName: 'comments',        className: 'FB.XFBML.Comments' },
    { localName: 'fan',             className: 'FB.XFBML.Fan' },
    { localName: 'like',            className: 'FB.XFBML.Like' },
    { localName: 'live-stream',     className: 'FB.XFBML.LiveStream' },
    { localName: 'login-button',    className: 'FB.XFBML.LoginButton' },
    { localName: 'name',            className: 'FB.XFBML.Name' },
    { localName: 'profile-pic',     className: 'FB.XFBML.ProfilePic' },
    { localName: 'serverfbml',      className: 'FB.XFBML.ServerFbml' },
    { localName: 'share-button',    className: 'FB.XFBML.ShareButton' }
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
