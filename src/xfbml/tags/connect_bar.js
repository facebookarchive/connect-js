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

  /**
   * Processes this tag.
   */
  process: function() {
    // Wait for status to be known
    FB.Event.monitor('auth.statusChange', this.bind(function() {
      // Is Element still in DOM tree? are we connected?
      if (!this.isValid() || FB._userStatus == 'notConnected') {
        this.fire('render');
        return true; // Stop processing
      }
      if (FB._userStatus == 'connected') {
        this._uid = FB.Helper.getLoggedInUser();
        if (this._uid) {
          // TODO(alpjor) check if marked seen / current seen count
          var q1 = FB.Data._selectByIndex(['first_name', 'profile_url',
                                            this._picFieldName],
                                          'user', 'uid', this._uid);
          var q2 = FB.Data._selectByIndex(['display_name'], 'application',
                                          'api_key', FB._apiKey);
          FB.Data.waitOn([q1, q2], this.bind(function(data) {
            data[0][0].site_name = data[1][0].display_name;
            this._renderConnectBar(data[0][0]);
            this.fire('render');
            // TODO(alpjor) increment seen count
          }));
          return false;
        }
      }
    }));
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
    this.dom.appendChild(container);
    this._initialHeight = parseInt(FB.Dom.getStyle(container, 'height'), 10);
    bar.style.width = this._getPxAttribute('width', 900) + 'px';
    container.style.top = (-1*this._initialHeight) + 'px';
    bar.innerHTML = FB.String.format(
      '<div class="fb_buttons">' +
        '<a href="#" class="fb_no_thanks">{0}</a>' +
        '<span class="fb_button">' +
          '<a href="#" class="fb_button_text">{1}</a>' +
        '</span>' +
      '</div>' +
      '<a href="{7}" class="fb_profile" target="_blank">' +
        '<img src="{2}" alt="{3}" title="{3}" />' +
      '</a>' +
      '{4}' +
      ' <span>( ' +
        '<a href="{8}" class="fb_learn_more" target="_blank">{5}</a> | ' +
        '<a class="fb_not_me" href="#">{6}</a>' +
      ' )</span>',
      FB.Intl.tx('connect-bar:no-thanks'),
      FB.Intl.tx('sh:ok-button'),
      info[this._picFieldName],
      info.first_name,
      FB.Intl.tx('connect-bar:sentence', {
        firstName: info.first_name,
        siteName: info.site_name
      }),
      FB.Intl.tx('connect-bar:learn-more'),
      FB.Intl.tx('connect-bar:not-first-name', { firstName: info.first_name }),
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
    if (!window.XMLHttpRequest ||
        navigator.appVersion.indexOf('MSIE 7.')!=-1) { // ie6 && ie7
      FB.Anim.ate(document.body, {
        backgroundPositionY: this._initialHeight
      });
    }
    var top_margin =
      parseInt(FB.Dom.getStyle(this._page, 'marginTop'), 10);
    top_margin = isNaN(top_margin) ? 0 : top_margin;
    this._initTopMargin = top_margin;
    FB.Anim.ate(this._page, {
      marginTop: this._initTopMargin + this._initialHeight
    });
    FB.Anim.ate(container, { top: 0 });
  },

  /**
   * Handle the anchor clicks from the connect bar
   *
   */
  _clickHandler : function(e) {
    e = e || window.event;
    var el = e.target || e.srcElement;
    switch (el.className) {
      case 'fb_button_text':
        // TODO(alpjor) mark seen
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
        FB.Anim.ate(this.dom.firstChild, {
          top: -1 * this._initialHeight
        }, 300, function(el) {
          el.parentNode.removeChild(el);
        });
        break;
      case 'fb_learn_more':
      case 'fb_profile':
        return true;
      case 'fb_no_thanks':
        FB.api({ method: 'auth.revokeAuthorization'}, function() {
          window.location.reload();
        });
        break;
      case 'fb_not_me':
        // TODO(alpjor) decrement seen count
        FB.logout(function() {
          window.location.reload();
        });
        break;
    }
    return false;
  }
});
