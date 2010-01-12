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
 * @provides fb.component
 * @layer basic
 * @requires fb.prelude
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
