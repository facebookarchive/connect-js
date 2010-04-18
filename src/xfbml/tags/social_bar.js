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
 * @provides fb.xfbml.socialbar
 * @layer xfbml
 * @requires fb.type fb.xfbml.element fb.css.socialbarwidget fb.anim
 */

/**
 * Implementation for fb:social-bar tag.
 *
 * @class FB.XFBML.SocialBar
 * @extends FB.XFBML.IframeWidget
 * @private
 */
FB.subclass('XFBML.SocialBar', 'XFBML.IframeWidget', null, {
  _showLoader: false, // no spinner when loading
  // the inital width/height of the iframe, doesn't really matter, since it'll
  // resize to page width onload
  _initialWidth: 860,
  _initialHeight: 29,
  _barIframe: null, // the socialbar iframe
  // all child iframes are render with incrementing z-index values, this is the
  // current highest z index created
  _currentZ: 0,
  // the current right offset to spawn a new child iframe at. For placing new
  // iframes relative to the social bar
  _currentChildRight: 0,
  _refreshOnAuthChange: true, // if the user state changes, refresh
  _visibleAfter: 'load', // show onload

  /**
   * Minimizes the toolbar and hides all it's child windows
   *
   * @param message {Object} the message object from the XD.send() call
   */
  _minimizeToolbar: function(message) {
    var iframe = this._barIframe;
    message.resetWidth = false;
    if (message.width == '100%') {
      var page_width =
        parseInt(FB.Dom.getStyle(iframe.parentNode, 'width'), 10);
      message.resetWidth = true;
      message.width      = page_width;
    }
    FB.Anim.ate(iframe, { width: message.width + 'px' }, 300, function(el) {
      if (message.resetWidth) {
        el.style.width = '100%';
      }
    });
    var iframes = this.dom.getElementsByTagName('iframe');
    FB.Array.forEach(iframes, function(frame) {
      // skip main iframe
      if (frame.parentNode.className == 'fb_social_bar_container') {
        return;
      }
      if (!frame._isHidden) {
        frame._origHeight = parseInt(FB.Dom.getStyle(frame, 'height'), 10);
        frame._origWidth  = parseInt(FB.Dom.getStyle(frame, 'width'), 10);
        FB.Anim.ate(frame, {
          height  : '0px',
          width   : '0px',
          opacity : 0
        }, 300);
        frame._isHidden = true;
      } else {
        FB.Anim.ate(frame, {
          height  : frame._origHeight + 'px',
          width   : frame._origWidth + 'px',
          opacity : 100
        });
        frame._isHidden = false;
      }
    });
  },

  /**
   * Creates a new child iframe, positioned relative to the social bar
   *
   * @param message {Object} the message object from the Xd.send() call
   */
  _spawnChild: function(message) {
    var iframe = this._barIframe, _this = this;
    var span = document.createElement('span');
    var pos = parseInt(FB.Dom.getStyle(iframe.parentNode, 'padding-right'), 10)
      + this._currentChildRight + parseInt(message.minimizeWidth, 10);
    iframe.parentNode.appendChild(span);
    FB.Content.insertIframe({
      root      : span,
      name      : message.name,
      url       : message.src,
      className : 'fb_social_bar_iframe',
      width     : message.width,
      height    : 0,
      onload    : function(el) {
        el.style.position              = 'absolute';
        el.style[_this._attr.position] = _this._initialHeight + 'px';
        el.style.right                 = pos + 'px';
        el.style.zIndex                = ++_this._currentZ;
        FB.Anim.ate(el, { height: message.height + 'px', opacity: 100 });
      }
    });
    this._currentChildRight += parseInt(message.width, 10);
  },

  /**
   * Removes all child iframes with name = message.name and slides all iframes
   * down into compact positioning
   *
   * @param message {Object} the message object from the Xd.send() call
   */
  _removeChild: function(message) {
    var removed = 0;
    var iframes = this.dom.getElementsByTagName('iframe');
    for (var i=1; i < iframes.length; i++) { // skip main iframe
      var frame = iframes[i];
      if (frame.name == message.name) {
        var width_removed = parseInt(FB.Dom.getStyle(frame, 'width'), 10);
        removed += width_removed;
        this._currentChildRight -= width_removed;
        FB.Anim.ate(frame, { height: '0px', opacity: 0 }, 300, function(el) {
          el.parentNode.parentNode.removeChild(el.parentNode);
        });
      } else {
        FB.Anim.ate(frame, {
          right: parseInt(FB.Dom.getStyle(frame, 'right'), 10) - removed + 'px'
        }, 300);
      }
    }
  },

  /**
   * Provides initialization for the socialbar child iframe placement, main
   * iframe placement, and opening animation
   *
   * @param message {Object} the message object from the XD.send() call
   */
  _iframeOnLoad : function() {
    var iframe = this._barIframe = this.getIframeNode(),
        container = iframe.parentNode;
    container.className = 'fb_social_bar_container';
    iframe.style.width = '100%';
    this._currentZ += parseInt(FB.Dom.getStyle(iframe, 'zIndex'), 10);
    var move = { opacity: 100 };
    iframe.className = 'fb_social_bar_iframe';
    if (!window.XMLHttpRequest) {
      // ie6 fix // TODO(alpjor) fix me
      container.style.position = 'absolute';
      //iframe.style[this._attr.position] = '0px';
      container.className +=
        ' fb_social_bar_iframe' + this._attr.position + '_ie6';
    } else {
      FB.Anim.ate(iframe, move);
      // initial position
      container.style[this._attr.position] = (-1*this._initialHeight) + 'px';
      // fade and slide in
      move[this._attr.position] = '0px';
    }
    FB.Anim.ate(container, move);

  },
  oneTimeSetup: function() {
    // events
    this.subscribe('xd.minimizeToolbar', FB.bind(this._minimizeToolbar, this));
    this.subscribe('xd.spawnChild', FB.bind(this._spawnChild, this));
    this.subscribe('xd.removeChild', FB.bind(this._removeChild, this));
    this.subscribe('iframe.onload', FB.bind(this._iframeOnLoad, this));
  },
  getUrlBits: function() {
    return {
      name   : 'social_bar',
      params : this._attr
    }
  },
  getSize: function() {
    return { width: this._initialWidth, height: this._initialHeight };
  },
  setupAndValidate: function() {
     this._attr = {
       like     : this._getBoolAttribute('like'),
       send     : this._getBoolAttribute('send'),
       activity : this._getBoolAttribute('activity'),
       chat     : this._getBoolAttribute('chat'),
       position : this._getAttributeFromList('position', 'bottom',
        ['top', 'bottom']),
       site     : this.getAttribute('site', location.hostname),
       channel  : this.getChannelUrl()
     };
     return true;
  }
});

