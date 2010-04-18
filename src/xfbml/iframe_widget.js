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
 * @provides fb.xfbml.iframewidget
 * @layer xfbml
 * @requires fb.type
 *           fb.event
 *           fb.xfbml.element
 *           fb.content
 *           fb.qs
 *           fb.css.iframewidget
 */

/**
 * Base implementation for iframe based XFBML Widgets.
 *
 * @class FB.XFBML.IframeWidget
 * @extends FB.XFBML.Element
 * @private
 */
FB.subclass('XFBML.IframeWidget', 'XFBML.Element', null, {
  /**
   * Indicate if the loading animation should be shown while the iframe is
   * loading.
   */
  _showLoader: true,

  /**
   * Indicate if the widget should be reprocessed when the user enters or
   * leaves the "unknown" state. (Logs in/out of facebook, but not the
   * application.)
   */
  _refreshOnAuthChange: false,

  /**
   * Indicates if the widget should be reprocessed on auth.statusChange events.
   * This is the default for XFBML Elements, but is usually undesirable for
   * Iframe Widgets.
   */
  _allowReProcess: false,

  /**
   * Indicates when the widget will be made visible.
   *
   *   load: when the iframe's page onload event is fired
   *   resize: when the first resize message is received
   */
  _visibleAfter: 'load',

  /////////////////////////////////////////////////////////////////////////////
  // Methods the implementation MUST override
  /////////////////////////////////////////////////////////////////////////////

  /**
   * Implemented by the inheriting class to return a **name** and **params**.
   *
   * The name is the the file name in the plugins directory. So the name "fan"
   * translates to the path "/plugins/fan.php". This enforces consistency.
   *
   * The params should be the query params needed for the widget. API Key,
   * Session Key, SDK and Locale are automatically included.
   *
   * @return {Object} an object containing a **name** and **params**.
   */
  getUrlBits: function() {
    throw new Error('Inheriting class needs to implement getUrlBits().');
  },

  /////////////////////////////////////////////////////////////////////////////
  // Methods the implementation CAN override
  /////////////////////////////////////////////////////////////////////////////

  /**
   * This method is invoked before any processing is done to do any initial
   * setup and do any necessary validation on the attributes. A return value of
   * false will indicate that validation was unsuccessful and processing will
   * be halted. If you are going to return false and halt processing, you
   * should ensure you use FB.log() to output a short informative message
   * before doing so.
   *
   * @return {Boolean} true to continue processing, false to halt it
   */
  setupAndValidate: function() {
    return true;
  },

  /**
   * This is useful for setting up event handlers and such which should not be
   * run again if the widget is reprocessed.
   */
  oneTimeSetup: function() {},

  /**
   * Implemented by the inheriting class to return the initial size for the
   * iframe. If the inheriting class does not implement this, we default to
   * null which implies no element level style. This is useful if you are
   * defining the size based on the className.
   *
   * @return {Object} object with a width and height as Numbers (pixels assumed)
   */
  getSize: function() {},

  /**
   * Implemented by the inheriting class if it needs to override the name
   * attribute of the iframe node. Returning null will auto generate the name.
   *
   * @return {String} the name of the iframe
   */
  getIframeName: function() {},

  /////////////////////////////////////////////////////////////////////////////
  // Public methods the implementation CAN use
  /////////////////////////////////////////////////////////////////////////////

  /**
   * Get a channel url for use with this widget.
   *
   * @return {String} the channel URL
   */
  getChannelUrl: function() {
    if (!this._channelUrl) {
      // parent.parent => the message will be going from cdn => fb => app (with
      // cdn being the deepest frame, and app being the top frame)
      var self = this;
      this._channelUrl = FB.XD.handler(function(message) {
        self.fire('xd.' + message.type, message);
      }, 'parent.parent', true);
    }
    return this._channelUrl;
  },

  /**
   * Returns the iframe node (if it has already been created).
   *
   * @return {DOMElement} the iframe DOM element
   */
  getIframeNode: function() {
    // not caching to allow for the node to change over time without needing
    // house-keeping for the cached reference.
    return this.dom.getElementsByTagName('iframe')[0];
  },

  /////////////////////////////////////////////////////////////////////////////
  // Private methods the implementation MUST NOT use or override
  /////////////////////////////////////////////////////////////////////////////

  /**
   * Inheriting classes should not touch the DOM directly, and are only allowed
   * to override the methods defined at the top.
   *
   * @param force {Boolean} force reprocessing of the node
   */
  process: function(force) {
    // guard agains reprocessing if needed
    if (this._done) {
      if (!this._allowReProcess && !force) {
        return;
      }
      this.clear();
    } else {
      this._oneTimeSetup();
    }
    this._done = true;

    if (!this.setupAndValidate()) {
      // failure to validate means we're done rendering what we can
      this.fire('render');
      return;
    }

    // show the loader if needed
    if (this._showLoader) {
      this._addLoader();
    }

    // it's always hidden by default
    FB.Dom.addCss(this.dom, 'fb_iframe_widget');
    if (this._visibleAfter != 'immediate') {
      FB.Dom.addCss(this.dom, 'fb_hide_iframes');
    } else {
      this.subscribe('iframe.onload', FB.bind(this.fire, this, 'render'));
    }

    // the initial size
    var size = this.getSize() || {};

    // we use a GET request if the URL is less than 2k, otherwise we need to do
    // a <form> POST. we prefer a GET because it prevents the "POST resend"
    // warning browsers shown on page refresh.
    var url = this._getURL() + '?' + FB.QS.encode(this._getQS());
    if (url.length > 2000) {
      // we will POST the form once the empty about:blank iframe is done loading
      url = 'about:blank';
      var onload = FB.bind(function() {
        this._postRequest();
        this.unsubscribe('iframe.onload', onload);
      }, this);
      this.subscribe('iframe.onload', onload);
    }

    FB.Content.insertIframe({
      url    : url,
      root   : this.dom.appendChild(document.createElement('span')),
      name   : this.getIframeName(),
      height : size.height,
      width  : size.width,
      onload : FB.bind(this.fire, this, 'iframe.onload')
    });
  },

  /**
   * Internal one time setup logic.
   */
  _oneTimeSetup: function() {
    // the XD messages we want to handle. it is safe to subscribe to these even
    // if they will not get used.
    this.subscribe('xd.resize', FB.bind(this._handleResizeMsg, this));

    // weak dependency on FB.Auth
    if (FB.getLoginStatus) {
      this.subscribe(
        'xd.refreshLoginStatus',
        FB.bind(FB.getLoginStatus, FB, function(){}, true));
      this.subscribe(
        'xd.logout',
        FB.bind(FB.logout, FB, function(){}));
    }

    // setup forwarding of auth.statusChange events
    if (this._refreshOnAuthChange) {
      this._setupAuthRefresh();
    }

    // if we need to make it visible on iframe load
    if (this._visibleAfter == 'load') {
      this.subscribe('iframe.onload', FB.bind(this._makeVisible, this));
    }

    // hook for subclasses
    this.oneTimeSetup();
  },

  /**
   * Make the iframe visible and remove the loader.
   */
  _makeVisible: function() {
    this._removeLoader();
    FB.Dom.removeCss(this.dom, 'fb_hide_iframes');
    this.fire('render');
  },

  /**
   * Most iframe plugins do not tie their internal state to the "Connected"
   * state of the application. In other words, the fan box knows who you are
   * even if the page it contains does not. These plugins therefore only need
   * to reload when the user signs in/out of facebook, not the application.
   *
   * This misses the case where the user switched logins without the
   * application knowing about it. Unfortunately this is not possible/allowed.
   */
  _setupAuthRefresh: function() {
    FB.getLoginStatus(FB.bind(function(response) {
      var lastStatus = response.status;
      FB.Event.subscribe('auth.statusChange', FB.bind(function(response) {
        if (!this.isValid()) {
          return;
        }
        // if we gained or lost a user, reprocess
        if (lastStatus == 'unknown' || response.status == 'unknown') {
          this.process(true);
        }
        lastStatus = response.status;
      }, this));
    }, this));
  },

  /**
   * Invoked by the iframe when it wants to be resized.
   */
  _handleResizeMsg: function(message) {
    if (!this.isValid()) {
      return;
    }
    var iframe = this.getIframeNode();
    iframe.style.height = message.height + 'px';
    if (message.width) {
      iframe.style.width = message.width + 'px';
    }
    iframe.style.border = 'none';
    this._makeVisible();
  },

  /**
   * Add the loader.
   */
  _addLoader: function() {
    if (!this._loaderDiv) {
      FB.Dom.addCss(this.dom, 'fb_iframe_widget_loader');
      this._loaderDiv = document.createElement('div');
      this._loaderDiv.className = 'FB_Loader';
      this.dom.appendChild(this._loaderDiv);
    }
  },

  /**
   * Remove the loader.
   */
  _removeLoader: function() {
    if (this._loaderDiv) {
      FB.Dom.removeCss(this.dom, 'fb_iframe_widget_loader');
      this.dom.removeChild(this._loaderDiv);
      this._loaderDiv = null;
    }
  },

  /**
   * Get's the final QS/Post Data for the iframe with automatic params added
   * in.
   *
   * @return {Object} the params object
   */
  _getQS: function() {
    return FB.copy({
      api_key     : FB._apiKey,
      locale      : FB._locale,
      sdk         : 'joey',
      session_key : FB._session && FB._session.session_key
    }, this.getUrlBits().params);
  },

  /**
   * Gets the final URL based on the name specified in the bits.
   *
   * @return {String} the url
   */
  _getURL: function() {
    return FB._domain.www + 'plugins/' + this.getUrlBits().name + '.php';
  },

  /**
   * Will do the POST request to the iframe.
   */
  _postRequest: function() {
    FB.Content.postTarget({
      url    : this._getURL(),
      target : this.getIframeNode().name,
      params : this._getQS()
    });
  }
});
