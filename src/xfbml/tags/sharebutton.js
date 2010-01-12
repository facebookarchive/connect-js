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
 * @provides xfbml.fb:share-button
 * @layer xfbml
 * @requires fb.type fb.xfbml  fb.string fb.dom fb.xfbml.element fb.ui
 *  fb.data fb.helper fb.share-button-css
 */

/**
 * Implementation for fb:share-button tag.
 * @class FB.XFBML.ShareButton
 * @extends  FB.XFBML.Element
 * @private
 */
FB.subclass('XFBML.ShareButton', 'XFBML.Element', null,
  /*
   * Instance methods
   */
  {
  process: function() {
    this._href = this.getAttribute('href', window.location.href);

    //TODO: When we turn sharepro on, replace icon_link with button_count
    this._type = this.getAttribute('type', 'icon_link');

    this._renderButton();

  },

  _renderButton: function() {
    if (!this.isValid()) {
      return;
    }
    var
      contentStr = '',
      extra = '',
      classStr = '',
      share = 'Share',
      wrapperClass = '';

    switch (this._type) {
    case 'icon':
    case 'icon_link':
      classStr = 'FBConnectButton_Simple';
      contentStr = '<span class=\'FBConnectButton_Text_Simple\'>' +
              (this._type == 'icon_link' ? share : '&nbsp;') +
              '</span>';
      break;
    case 'link':
      contentStr = 'Share on Facebook';
      break;
    case 'button_count':
      contentStr = '<span class="FBConnectButton_Text">' + share +  '</span>';
      extra ='<span class=\'fb_share_count_nub_right\'>&nbsp;</span>' +
        '<span class=\'fb_share_count fb_share_count_right\'>'+
        this._getCounterMarkup() +
        '</span>';
      classStr = 'FBConnectButton FBConnectButton_Small';
      break;
    default:
      // box count
      contentStr = '<span class=\'fb_share_count_nub_top\'>&nbsp;</span>';
      extra = '<span class=\'fb_share_count fb_share_count_top\'>' +
        this._getCounterMarkup() +
        '</span>' +
        '<span class="FBConnectButton_Text">' + share +  '</span>';
      classStr = 'FBConnectButton FBConnectButton_Small';
      wrapperClass = 'fb_share_count_wrapper';
    }
    this.dom.innerHTML = FB.String.format(
        '<span class="{0}"><a href="{1}" class="{2}"' +
        ' onclick=\'FB.share("{1}");'+
        'return false;\''+
          'target=\'_blank\'>{3}</a>{4}</span>',
          wrapperClass,
          this._href,
          classStr,
          contentStr, extra);
  },

  _getCounterMarkup: function() {
    if (!this._count) {
      this._count = FB.Data._selectByIndex(['share_count'], 'link_stat',
                                       'url', this._href);
    }

    if (this._count.value !== undefined) {
      if (this._count.value.length > 0) {
        var c = this._count.value[0].share_count;
        if (c > 3) {
          var prettyCount = c >= 10000000 ? Math.round(c/1000000) + 'M' :
                            (c >= 10000 ? Math.round(c/1000) + 'K' : c);
          return  '<span class=\'fb_share_count_inner\'>' +
            prettyCount + '</span>';
        }
      }
    } else {
      this._count.wait(this.bind(this._renderButton));
    }

    return '';

  }
});
