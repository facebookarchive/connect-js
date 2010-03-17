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
 * @provides fb.xfbml.profilepic
 * @layer xfbml
 * @requires fb.type fb.xfbml fb.string fb.dom fb.xfbml.element fb.data
 *           fb.helper
 */

/**
 * @class FB.XFBML.ProfilePic
 * @extends  FB.XFBML.Element
 * @private
 */
FB.subclass('XFBML.ProfilePic', 'XFBML.Element', null, {
  /**
   * Processes this tag.
   */
  process: function() {
    var
      size = this.getAttribute('size', 'thumb'),
      picFieldName = FB.XFBML.ProfilePic._sizeToPicFieldMap[size],
      width = this._getPxAttribute('width'),
      height = this._getPxAttribute('height'),
      style = this.dom.style,
      uid = this.getAttribute('uid');

    // Check if we need to add facebook logo image
    if (this._getBoolAttribute('facebook-logo')) {
      picFieldName += '_with_logo';
    }

    if (width) {
      width = width + 'px';
      style.width = width;
    }
    if (height) {
      height = height + 'px';
      style.height = height;
    }

    var renderFn = this.bind(function(result) {
      var
        userInfo = result ? result[0] : null,
        imgSrc = userInfo ? userInfo[picFieldName] : null;

      if (!imgSrc) {
        // Create default
        imgSrc = FB._domain.cdn + FB.XFBML.ProfilePic._defPicMap[picFieldName];
      }
      // Copy width, height style, and class name of fb:profile-pic down to the
      // image element we create
      var
        styleValue = (
          (width ? 'width:' + width + ';' : '') +
          (height ? 'height:' + width + ';' : '')
        ),
        html = FB.String.format(
          '<img src="{0}" alt="{1}" title="{1}" style="{2}" class="{3}" />',
          imgSrc,
          userInfo ? userInfo.name : '',
          styleValue,
          this.dom.className
        );

      if (this._getBoolAttribute('linked', true)) {
        html = FB.Helper.getProfileLink(
          userInfo,
          html,
          this.getAttribute('href', null)
        );
      }
      this.dom.innerHTML = html;
      FB.Dom.addCss(this.dom, 'fb_profile_pic_rendered');
      this.fire('render');
    });

    // Wait for status to be known
    FB.Event.monitor('auth.statusChange', this.bind(function() {
      //Is Element still in DOM tree
      if (!this.isValid()) {
        this.fire('render');
        return true; // Stop processing
      }

      if (this.getAttribute('uid', null) == 'loggedinuser') {
        uid = FB.Helper.getLoggedInUser();
      }

      // Is status known?
      if (FB._userStatus && uid) {
        // Get data
        // Use profile if uid is a user, but a page
        FB.Data._selectByIndex(
          ['name', picFieldName],
          FB.Helper.isUser(uid) ? 'user' : 'profile',
          FB.Helper.isUser(uid) ? 'uid' : 'id',
          uid
        ).wait(renderFn);
      } else {
        // Render default
        renderFn();
      }
    }));
  }
});

FB.provide('XFBML.ProfilePic', {
  /**
   * Maps field type to placeholder/silhouette image.
   *
   * This dynamic data is replaced with rsrc.php backed URLs by Haste.
   */
  _defPicMap: {
    pic                  : 'pics/s_silhouette.jpg',
    pic_big              : 'pics/d_silhouette.gif',
    pic_big_with_logo    : 'pics/d_silhouette_logo.gif',
    pic_small            : 'pics/t_silhouette.jpg',
    pic_small_with_logo  : 'pics/t_silhouette_logo.gif',
    pic_square           : 'pics/q_silhouette.gif',
    pic_square_with_logo : 'pics/q_silhouette_logo.gif',
    pic_with_logo        : 'pics/s_silhouette_logo.gif'
  },

  /**
   * Maps user specified attribute for size to a field type.
   */
  _sizeToPicFieldMap: {
    n      : 'pic_big',
    normal : 'pic_big',
    q      : 'pic_square',
    s      : 'pic',
    small  : 'pic',
    square : 'pic_square',
    t      : 'pic_small',
    thumb  : 'pic_small'
  }
});
