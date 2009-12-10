/**
 * @provides xfbml.fb:profile-pic
 * @layer XFBML
 * @requires fb.Type fb.XFBML fb.String fb.Dom fb.XFBML.Element fb.Data
 *           fb.Helper
 */

/**
 * @class FB.XFBML.ProfilePic
 * @extends  FB.XFBML.Element
 */
FB.subclass('XFBML.ProfilePic', 'XFBML.Element', null,
  /*
   * Instance methods
   */
  {
  process: function() {
    var size = this.getAttribute('size', 'thumb'),
    sizeToPicFieldMap = { thumb: 'pic_small', small: 'pic', normal: 'pic_big',
                              square: 'pic_square', t: 'pic_small',
                              s: 'pic', n: 'pic_big', q: 'pic_square' },
    picFieldName = sizeToPicFieldMap[size],
        widthAttribute = this.getAttribute('width'),
    heightAttribute = this.getAttribute('height'),
    style = this.dom.style,
    uid = this.getAttribute('uid');

    //  Check if we need to add facebook logo image
    if (this._getBoolAttribute('facebook-logo')) {
      picFieldName += '_with_logo';
    }

    if (widthAttribute) {
      style.width = this.getUnit(widthAttribute);
    }
    if (heightAttribute) {
      style.height = this.getUnit(heightAttribute);
    }

    var renderFn = this.bind(function(result) {
      var userInfo = result ? result[0] : null;
      var imageSrc = (userInfo) ? userInfo[picFieldName] : null;
      if (!imageSrc) {
        // Create default
        imageSrc = FB._domain.cdn + 'pics/' +
          FB.XFBML.ProfilePic._defPicMap[picFieldName];
      }
      // Copy width, height style, and class name of fb:profile-pic down
      // to the image element we create
      var styleValue = ((style.width) ? 'width:' + style.width + ';' : '') +
        ((style.height) ? 'height:' + style.width + ';' : '');
      var html = FB.String.format('<img src=\'{0}\' alt=\'{1}\' title=\'{1}\' style=\'{2}\' class=\'{3}\' />',
                               imageSrc,
                               userInfo ? userInfo.name : '', styleValue,
                               this.dom.className);
      if (this._getBoolAttribute('linked', true)) {
        html = FB.Helper.getProfileLink(userInfo, html,
          this.getAttribute('href', null));
      }
      this.dom.innerHTML = html;
      FB.Dom.addCss(this.dom, 'fb_profile_pic_rendered');

    });

    // Wait for status to be known
    FB.Event.monitor('auth.statusChange', this.bind(function() {
      //Is Element still in DOM tree
      if (!this.isValid())
        return true; // Stop processing

      // Is status known?
      if (FB._userStatus) {
        if (uid === 'loggedinuser') {
          uid = FB.App.session.uid;
        }

        // Get data
        // Use profile if uid is a user, but a page
        FB.Data._selectByIndex(['name', picFieldName],
          FB.Helper.isUser(uid) ? 'user' : 'profile',
          FB.Helper.isUser(uid) ? 'uid' : 'id',
          uid).wait(renderFn);
      } else {
        // Render default
        renderFn();
      }
    }));
  },

  getUnit: function(value) {
    return parseInt(value).toString() == value ? value + 'px' : value;
  }


});

FB.provide('XFBML.ProfilePic', {
  _defPicMap: { pic_small: 't_silhouette.jpg',
    pic: 's_silhouette.jpg',
    pic_big: 'd_silhouette.gif',
    pic_square: 'q_silhouette.gif',
    pic_small_with_logo: 't_silhouette_logo.gif',
    pic_with_logo: 's_silhouette_logo.gif',
    pic_big_with_logo: 'd_silhouette_logo.gif',
    pic_square_with_logo: 'q_silhouette_logo.gif'
  }
});
