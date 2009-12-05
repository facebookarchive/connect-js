/**
 * @provides fb.Loader
 * @layer Basic
 * @requires fb.prelude
 *
 *
 */

/**
* This base loader that does housekeeping of loaded components and support
* automatic loading of required css for a a component.
* @class FB.Loader
* @private
*/
FB.provide('Loader', {
  loaded: {},
  loadedCss: {},


  /**
   * This function will be invoked at end of each connect.php load
   * @static
   */
  onScriptLoaded: function(components) {
    var c = components.length;
    for(var i = 0; i < c; i++) {
      FB.Loader.loaded[components[i]] = true;
    }

    if (FB.Loader._onCompLoaded) {
      FB.Loader._onCompLoaded(components);
    }
  }
});
