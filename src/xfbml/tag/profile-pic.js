/**
 * @module Mu
 * @provides Mu.XFBML.Tag.ProfilePic
 *
 * @requires Mu.Prelude
 *           Mu.Lang
 *           Mu.IndexedQuery
 *           Mu.XFBML.Core
 *           Mu.API
 */

/**
 * Profile Pic.
 *
 * @class Mu.XFBML.Tag.ProfilePic
 * @static
 * @access private
 */
Mu.copy('XFBML.Tag.ProfilePic', {
  /**
   * The tag name.
   *
   * @access private
   * @type String
   */
  name: 'profile-pic',

  /**
   * Returns the Attribute Configuration.
   *
   * @access private
   * @returns {Object} the Attribute Configuration.
   */
  attrConfig: function() {
    var Attr = Mu.XFBML.Attr;
    return {
      size: Attr.ienum('thumb', Mu.Lang.keys(Mu.XFBML.Tag.ProfilePic.sizeMap)),
      width: Attr.size(),
      height: Attr.size(),
      uid: Attr.uid(),
      'facebook-logo': Attr.bool(true),
      href: Attr.any(),
      linked: Attr.bool(true)
    };
  },

  /**
   * Map user specified size attribute to FQL field in user table.
   *
   * @access private
   * @type Object
   */
  sizeMap: {
    n: 'pic_big',    normal: 'pic_big',
    s: 'pic',        small : 'pic',
    q: 'pic_square', square: 'pic_square',
    t: 'pic_small',  thumb : 'pic_small'
  },

  /**
   * Process the node.
   *
   * @access private
   * @param node   {Node}      a DOM Node
   * @param config {Object}    the tag configuration
   * @param cb     {Function}  function to invoke upon completion/error
   */
  process: function(node, config, cb) {
    // if we dont have a uid, we can't do much
    if (!config.uid) {
      node.innerHTML = '';
      cb(node, 'Missing required "uid" field.');
      return;
    }

    var
      sizeMap     = Mu.XFBML.Tag.ProfilePic.sizeMap,
      picFqlField = sizeMap[config.size];

    // logo rulez
    if (config['facebook-logo']) {
      picFqlField += '_with_logo';
    }

    // finally make the API call to get the necessary data
    Mu.IndexedQuery.make(
      [{
        table: 'user',
        fields: [picFqlField, 'name', 'profile_url'],
        keyName: 'uid',
        keyValue: config.uid
      }],
      function(response) {
        //TODO error handling
        if (response && response[0]) {
          response = response[0];

          // empty out the node
          node.innerHTML = '';

          // create the profile pic image
          var contents = document.createElement('img');
          contents.src = response[picFqlField];
          contents.alt = contents.title = response.name;
          contents.style.border = 'none';

          // if we were given explicit dimensions
          if (config.height) {
            contents.height = config.height;
          }
          if (config.width) {
            contents.width = config.width;
          }

          // wrap in <a> if needs/can be linked
          if (config.href || (config.linked && response.profile_url)) {
            var a = document.createElement('a');
            a.href = config.href || response.profile_url;
            a.appendChild(contents);
            contents = a;
          }

          // done
          node.appendChild(contents);
        }

        cb(node);
      }
    );
  }
});
