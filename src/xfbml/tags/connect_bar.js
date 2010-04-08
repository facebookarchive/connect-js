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
 * @provides fb.xfbml.connectbar
 * @layer xfbml
 * @requires fb.type
 *           fb.dom
 *           fb.xfbml
 *           fb.xfbml.element
 *           fb.css.connectbarwidget
 *           fb.anim
 *           fb.data
 *           fb.helper
 *           fb.string
 *           fb.auth
 *           fb.intl
 *           fb.event
 *           fb.insights
 */

/**
 * @class FB.XFBML.ConnectBar
 * @extends  FB.XFBML.Element
 * @private
 */
FB.subclass('XFBML.ConnectBar', 'XFBML.Element', null, {
  _initialHeight: null,
  _initTopMargin: 0,
  _picFieldName: 'pic_square',
  _page: null, // the external site's content parent node
  _displayed: false, // is the bar currently displayed
  _notDisplayed: false, // is the bar currently not displayed
  _container: null,

  /**
   * Processes this tag.
   */
  process: function() {
    // Wait for status to be known
    FB.getLoginStatus(this.bind(function(resp) {
      FB.Event.monitor('auth.statusChange', this.bind(function() {
        // Is Element still in DOM tree? are we connected?
        if (this.isValid() && FB._userStatus == 'connected') {
          this._uid = FB.Helper.getLoggedInUser();
          FB.api({ // check if marked seen / current seen count
            method: 'Connect.shouldShowConnectBar'
          }, this.bind(function(showBar) {
            if (showBar == true) {
              this._showBar();
            } else {
              this._noRender();
            }
          }));
        } else {
          this._noRender();
        }
        return false; // continue monitoring
      }));
    }));
  },

  /**
   * load the data for the bar and render it firing all the events in the
   * process
   */
  _showBar: function() {
    var q1 = FB.Data._selectByIndex(['first_name', 'profile_url',
                                      this._picFieldName],
                                    'user', 'uid', this._uid);
    var q2 = FB.Data._selectByIndex(['display_name'], 'application',
                                    'api_key', FB._apiKey);
    FB.Data.waitOn([q1, q2], FB.bind(function(data) {
      data[0][0].site_name = data[1][0].display_name;
      if (!this._displayed) {
        this._displayed = true;
        this._notDisplayed = false;
        this._renderConnectBar(data[0][0]);
        this.fire('render');
        FB.Insights.impression({
          lid: 104,
          name: 'widget_load'
        });
        this.fire('connectbar.ondisplay');
        FB.Event.fire('connectbar.ondisplay', this);
        FB.Helper.invokeHandler(this.getAttribute('ondisplay'), this);
      }
    }, this));
  },

  /**
   * If the bar is rendered, hide it and fire the no render events
   */
  _noRender: function() {
    if (this._displayed) {
      this._displayed = false;
      this._closeConnectBar();
    }
    if (!this._notDisplayed) {
      this._notDisplayed = true;
      this.fire('render');
      this.fire('connectbar.onnotdisplay');
      FB.Event.fire('connectbar.onnotdisplay', this);
      FB.Helper.invokeHandler(this.getAttribute('onnotdisplay'), this);
    }
  },

  /**
   * Given this name, site name, and profile pic url render the connect bar
   */
  _renderConnectBar: function(info) {
    var bar = document.createElement('div'),
        container = document.createElement('div');
    // TODO(alpjor) add rtl support
    bar.className = 'fb_connect_bar';
    container.className = 'fb_reset fb_connect_bar_container';
    container.appendChild(bar);
    document.body.appendChild(container);
    this._container = container;
    this._initialHeight = parseInt(FB.Dom.getStyle(container, 'height'), 10);
    bar.innerHTML = FB.String.format(
      '<div class="fb_buttons">' +
        '<a href="#" class="fb_bar_close">' +
          '<img src="{1}" alt="{2}" title="{2}" class="fb_bar_close"/>' +
        '</a>' +
      '</div>' +
      '<a href="{7}" class="fb_profile" target="_blank">' +
        '<img src="{3}" alt="{4}" title="{4}" />' +
      '</a>' +
      '{5}' +
      ' <span>' +
        '<a href="{8}" class="fb_learn_more" target="_blank">{6}</a> &ndash; ' +
        '<a href="#" class="fb_no_thanks">{0}</a>' +
      '</span>',
      FB.Intl.tx('connect-bar:no-thanks'),
      FB._domain.cdn + FB.XFBML.ConnectBar.imgs.buttonUrl,
      FB.Intl.tx('connect-bar:close'),
      info[this._picFieldName],
      info.first_name,
      FB.Intl.tx('connect-bar:sentence', {
        firstName: info.first_name,
        siteName: info.site_name,
        logoUrl: FB._domain.cdn + FB.XFBML.ConnectBar.imgs.logoUrl
      }),
      FB.Intl.tx('connect-bar:learn-more'),
      info.profile_url,
      '#' // TODO(alpjor) learn_more url
    );
    var _this = this;
    FB.Array.forEach(bar.getElementsByTagName('a'), function(el) {
      el.onclick = FB.bind(_this._clickHandler, _this);
    });
    this._page = document.body.parentNode;
    // TODO(naitik) When FB.Dom.UA is fixed correct these checks
    if (!window.XMLHttpRequest) { // ie6
      this._page = document.body;
      // ie6 just won't show the container @ 100%, this was the best I could do
      // to make it ful width, but this makes the hoz scroll bar appear
      container.style.width = '102%';
    }
    var top_margin =
      parseInt(FB.Dom.getStyle(this._page, 'marginTop'), 10);
    top_margin = isNaN(top_margin) ? 0 : top_margin;
    this._initTopMargin = top_margin;
    if (!window.XMLHttpRequest ||
        navigator.appVersion.indexOf('MSIE 7.')!=-1) { // ie6 && ie7
      FB.Anim.ate(document.body, {
        backgroundPositionY: this._initialHeight
      });
    }
    if (!window.XMLHttpRequest) { // ie6
      container.className += " fb_connect_bar_container_ie6";
    } else {
      container.style.top = (-1*this._initialHeight) + 'px';
      FB.Anim.ate(container, { top: 0 });
    }
    FB.Anim.ate(this._page, {
      marginTop: this._initTopMargin + this._initialHeight
    });
  },

  /**
   * Handle the anchor clicks from the connect bar
   *
   */
  _clickHandler : function(e) {
    e = e || window.event;
    var el = e.target || e.srcElement;
    switch (el.className) {
      case 'fb_bar_close':
        FB.api({ // mark seen
          method: 'Connect.connectBarMarkAcknowledged'
        });
        FB.Insights.impression({
          lid: 104,
          name: 'widget_user_closed'
        });
        this._closeConnectBar();
        break;
      case 'fb_learn_more':
      case 'fb_profile':
        return true;
      case 'fb_no_thanks':
        FB.api({ // mark seen
          method: 'Connect.connectBarMarkAcknowledged'
        });
        FB.Insights.impression({
          lid: 104,
          name: 'widget_user_no_thanks'
        });
        FB.api({ method: 'auth.revokeAuthorization'}, this.bind(function() {
          this.fire('connectbar.ondeauth');
          FB.Event.fire('connectbar.ondeauth', this);
          FB.Helper.invokeHandler(this.getAttribute('ondeauth'), this);
          if (this._getBoolAttribute('autorefresh', true)) {
            window.location.reload();
          }
        }));
        break;
    }
    return false;
  },

  _closeConnectBar: function() {
    FB.Anim.ate(this._page, {
      marginTop: this._initTopMargin
    }, 300);
    // TODO(naitik) When FB.Dom.UA is fixed correct these checks
    if (!window.XMLHttpRequest ||
        navigator.appVersion.indexOf('MSIE 7.')!=-1) { // ie6 && ie7
      FB.Anim.ate(document.body, {
        backgroundPositionY: 0
      }, 300);
    }
    this._notDisplayed = true;
    FB.Anim.ate(this._container, {
      top: -1 * this._initialHeight
    }, 300, function(el) {
      el.parentNode.removeChild(el);
    });
    this.fire('connectbar.onclose');
    FB.Event.fire('connectbar.onclose', this);
    FB.Helper.invokeHandler(this.getAttribute('onclose'), this);
  }
});

FB.provide('XFBML.ConnectBar', {
  imgs: {
   logoUrl: 'images/facebook-widgets/fb_logo.png',
   buttonUrl: 'images/facebook-widgets/close_btn.png'
  }
});
