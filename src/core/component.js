/**
 * @provides fb.Component
 * @layer Basic
 * @requires fb.prelude
 *
 *
 */

/**
* This base loader that does housekeeping of loaded components and support
* automatic loading of required css for a a component. It is required in
* prelude because if any future code wants to dynamically load a component,
* it will need to know about what has been loaded so far.
*
* This is invoked at the bottom of every script when it's packaged
* via connect.php.
*
* See FB.Loader for more info on usage.
*
* @class FB.Component
* @static
* @private
*/
FB.provide('Component', {
  loaded: {},
  loadedCss: {},


  /**
   * This function will be invoked at end of each connect.php load
   * @static
   */
  onScriptLoaded: function(components) {
    var c = components.length;
    for(var i = 0; i < c; i++) {
      FB.Component.loaded[components[i]] = true;
    }

    // if the FB.Loader has been loaded,
    // then fire the callback handler
    if (FB.Loader._onCompLoaded) {
      FB.Loader._onCompLoaded(components);
    }
  }
});
