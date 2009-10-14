/**
 * @module Mu
 * @provides Mu.XFBML.Tag.Fan
 *
 * @requires Mu.Prelude
 *           Mu.XFBML.Core
 *           Mu.Content
 *           Mu.NodeData
 */

/**
 * Fan Box.
 *
 * @class Mu.XFBML.Tag.Fan
 * @static
 * @access private
 */
Mu.copy('XFBML.Tag.Fan', {
  /**
   * The tag name.
   *
   * @access private
   * @type String
   */
  name: 'fan',

  /**
   * Returns the Attribute Configuration.
   *
   * @access private
   * @returns {Object} the Attribute Configuration.
   */
  attrConfig: function() {
    var Attr = Mu.XFBML.Attr;
    return {
      profile_id  : Attr.any(),
      name        : Attr.any(),
      stream      : Attr.bool(true),
      connections : Attr.integer(10),
      // cannot use Attr.size() here as the iframe needs a exact
      // px size, and % em or pt are not allowed
      width       : Attr.integer(300),
      height      : Attr.size(),
      css         : Attr.any()
    };
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
    // this tag only needs to be rendered once. it doesnt ever cange
    if (Mu.NodeData.get(node, 'rendered')) {
      cb(node);
      return;
    }
    Mu.NodeData.put(node, 'rendered', true);

    // need one of profile_id or name, but not both
    if ((!config.profile_id && !config.name) ||
        (config.profile_id && config.name)) {
      cb(node, 'Must specify one and only one of "profile_id" or "name".');
      return;
    }

    // setup height unless explicitly given
    if (!config.height) {
      if (!config.connections && !config.stream) {
        config.height = 65;
      } else if (!config.connections) {
        config.height = 375;
      } else if (!config.stream) {
        config.height = 250;
      } else {
        config.height = 550;
      }
      config.height = config.height + 'px';
    }

    // we want the iframe to be initially hidden, we first append a hidden
    // element to use as the root for the iframe.
    var hiddenContainer = document.createElement('span');
    hiddenContainer.style.visibility = 'hidden';
    node.appendChild(hiddenContainer);

    // once the iframe has been loaded, we make it visible and remove the
    // loading spinner
    // TODO there is no spinner. there is no spoon.
    var onIframeLoad = function() {
      hiddenContainer.style.visibility = 'visible';
    };

    // final url to fan box with config
    var
      url = Mu._domain.www + 'connect/connect.php?' + Mu.QS.encode({
        api_key     : Mu._apiKey,
        //todo what is this used for? loose dependency on Mu.XD
        channel_url : Mu.XD && Mu.XD._origin,
        id          : config.profile_id,
        name        : config.name,
        width       : config.width,
        connections : config.connections,
        stream      : config.stream ? 1 : 0,
        css         : config.css
      }),

      // insert the iframe
      iframe = Mu.Content.iframe(url, hiddenContainer, onIframeLoad),
      style = iframe.style;

    style.height = config.height;
    style.width = config.width + 'px';
    style.overflow = 'hidden';

    // done
    cb(node);
  }
});
