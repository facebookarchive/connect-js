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
 * @provides fb.xfbml.sharebutton
 * @layer xfbml
 * @requires fb.type
 *           fb.intl
 *           fb.xfbml
 *           fb.string
 *           fb.dom
 *           fb.xfbml.element
 *           fb.ui
 *           fb.data
 *           fb.helper
 *           fb.css.sharebutton
 */

/**
 * Implementation for fb:share-button tag.
 * @class FB.XFBML.ShareButton
 * @extends  FB.XFBML.Element
 * @private
 */
FB.subclass('XFBML.ShareButton', 'XFBML.Element', null, {
  /**
   * Processes this tag.
   */
  process: function() {
    this._href = this.getAttribute('href', window.location.href);

    //TODO: When we turn sharepro on, replace icon_link with button_count
    this._type = this.getAttribute('type', 'icon_link');

    this._renderButton(true);
  },

  /**
   * Render's the button.
   *
   * @access private
   * @param skipRenderEvent {Boolean} indicate if firing of the render event
   * should be skipped. This is useful because the _renderButton() function may
   * recursively call itself to do the final render, which is when we want to
   * fire the render event.
   */
  _renderButton: function(skipRenderEvent) {
    if (!this.isValid()) {
      this.fire('render');
      return;
    }

    var
      contentStr = '',
      post = '',
      pre = '',
      classStr = '',
      share = FB.Intl.tx('sh:share-button'),
      wrapperClass = '';

    switch (this._type) {
    case 'icon':
    case 'icon_link':
      classStr = 'fb_button_simple';
      contentStr = (
        '<span class="fb_button_text">' +
          (this._type == 'icon_link' ? share : '&nbsp;') +
        '</span>'
      );
      skipRenderEvent = false;
      break;
    case 'link':
      contentStr = FB.Intl.tx('cs:share-on-facebook');
      skipRenderEvent = false;
      break;
    case 'button':
      contentStr = '<span class="fb_button_text">' + share +  '</span>';
      classStr = 'fb_button fb_button_small';
      skipRenderEvent = false;
      break;
    case 'button_count':
      contentStr = '<span class="fb_button_text">' + share +  '</span>';
      post = (
        '<span class="fb_share_count_nub_right">&nbsp;</span>' +
        '<span class="fb_share_count fb_share_count_right">'+
          this._getCounterMarkup() +
        '</span>'
      );
      classStr = 'fb_button fb_button_small';
      break;
    default:
      // box count
      contentStr = '<span class="fb_button_text">' + share +  '</span>';
      pre = (
        '<span class="fb_share_count_nub_top">&nbsp;</span>' +
        '<span class="fb_share_count fb_share_count_top">' +
          this._getCounterMarkup() +
        '</span>'
      );
      classStr = 'fb_button fb_button_small';
      wrapperClass = 'fb_share_count_wrapper';
    }
    this.dom.innerHTML = FB.String.format(
      '<span class="{0}">{4}<a href="{1}" class="{2}" ' +
      'onclick=\'FB.ui({6});return false;\'' +
      'target="_blank">{3}</a>{5}</span>',
      wrapperClass,
      this._href,
      classStr,
      contentStr,
      pre,
      post,
      FB.JSON.stringify({ method: 'stream.share', u: this._href })
    );

    if (!skipRenderEvent) {
      this.fire('render');
    }
  },

  _getCounterMarkup: function() {
    if (!this._count) {
      this._count = FB.Data._selectByIndex(
        ['share_count'],
        'link_stat',
        'url',
        this._href
      );
    }

    if (this._count.value !== undefined) {
      if (this._count.value.length > 0) {
        var c = this._count.value[0].share_count;
        if (c > 3) {
          var prettyCount = c >= 10000000 ? Math.round(c/1000000) + 'M' :
                            (c >= 10000 ? Math.round(c/1000) + 'K' : c);
          return (
            '<span class="fb_share_count_inner">' +
              prettyCount +
            '</span>'
          );
        }
      }
    } else {
      this._count.wait(FB.bind(this._renderButton, this, false));
    }

    return '';
  }
});
