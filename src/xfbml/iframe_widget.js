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
 * @requires fb.type fb.event fb.xfbml.element fb.iframe-widget-css
 */

/**
 * Base implementation for iframe based XFBML Widgets.
 *
 * @class FB.XFBML.IframeWidget
 * @extends FB.XFBML.Element
 * @private
 */
FB.subclass('XFBML.IframeWidget', 'XFBML.Element', null, FB.copy({
  /**
   * Indicate if the loading animation should be shown while the iframe is
   * loading.
   */
  _showLoader: true,

  /**
   * Indicate if we should notify the iframe when the auth.statusChange event
   * is fired.
   */
  _notifyOnAuthChange: false,

  /**
   * Indicates if the widget should be reprocessed on auth.statusChange events.
   * This is the default for XFBML Elements, but is usually undesirable for
   * Iframe Widgets. Widgets that need to re-render on status change should
   * ideally rely on the _notifyOnAuthChange ability.
   */
  _allowReProcess: false,

  /**
   * Indicates when the widget will be made visible.
   *
   *   instant: as soon as it is inserted into the DOM
   *   load: when the iframe's page onload event is fired
   *   resize: when the first resize message is received
   */
  _visibleAfter: 'instant',

  /////////////////////////////////////////////////////////////////////////////
  // Methods the implementation MUST override
  /////////////////////////////////////////////////////////////////////////////

  /**
   * Implemented by the inheriting class to return the URL for the iframe.
   *
   * @return {String} the iframe URL
   */
  getIframeUrl: function() {
    throw new Error('Inheriting class needs to implement getIframeUrl().');
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
   * @return {DOMElemnent} the iframe DOM element
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
   */
  process: function() {
    // guard agains reprocessing if needed
    if (!this._allowReProcess && this._done) {
      return;
    }
    this._done = true;

    if (!this.setupAndValidate()) {
      return;
    }

    // do internal setup
    this._oneTimeSetup();

    // show the loader if needed
    if (this._showLoader) {
      this._addLoader();
    }

    // if it's not supposed to be instantly visible, hide it
    if (this._visibleAfter != 'instant') {
      FB.Dom.addCss(this.dom, 'FB_HideIframes');
    }

    // the initial size
    var size = this.getSize() || {};

    // we will append "js_sdk=joey" to the query parameters if it looks like a
    // URL with query params
    var url = this.getIframeUrl();
    if (url.indexOf('http') === 0 && url.indexOf('?') > -1) {
      url += '&js_sdk=joey';
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
    if (this._oneTimeSetupDone) {
      return;
    }
    this._oneTimeSetupDone = true;

    // the XD messages we want to handle. it is safe to subscribe to these even
    // if they will not get used.
    this.subscribe('xd.resize', FB.bind(this._handleResizeMsg, this));

    // weak dependency on FB.Auth
    if (FB.getLoginStatus) {
      this.subscribe('xd.refreshLoginStatus', FB.getLoginStatus);
    }

    // setup forwarding of auth.statusChange events
    if (this._notifyOnAuthChange) {
      this._setupAuthNotify();
    }

    // if we need to make it visible on iframe load
    if (this._visibleAfter == 'load') {
      this.subscribe('iframe.onload', FB.bind(this._makeVisible, this));
    }
  },

  /**
   * Make the iframe visible and remove the loader.
   */
  _makeVisible: function() {
    this._removeLoader();
    FB.Dom.removeCss(this.dom, 'FB_HideIframes');
  },

  /**
   * Forward status change events to the iframe.
   */
  _setupAuthNotify: function() {
    FB.Event.subscribe('auth.statusChange', FB.bind(function(response) {
      if (!this.isValid()) {
        return;
      }
      //TODO (naitik) send doesnt exist
      this.send({ type: 'statusChange', status: response.status });
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
      FB.Dom.addCss(this.dom, 'FB_IframeLoader');
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
      FB.Dom.removeCss(this.dom, 'FB_IframeLoader');
      this.dom.removeChild(this._loaderDiv);
      this._loaderDiv = null;
    }
  }
}, FB.EventProvider));
