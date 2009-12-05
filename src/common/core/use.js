/**
 * @provides fb.Loader.use
 * @layer Basic
 * @requires fb.Loader fb.Array fb.Dom fb.prelude
 */

/**
 * Provide dynamic loading feature
 * @class FB.Loader
 * @private
 */
FB.provide('Loader', {
  /*
   * Use this to request dynamic loading of components in Facebook Client
   * JavaScript library
   * @param {string} comp  a component
   * @param {function} callback  callback function to be executed when all
   *                  required comp
   *                  are finished loading
   * @static
   */
  use: function(comp, callback) {
    var request = {'comp': comp, 'cb': callback};
    // Check if request is already completed
    if (FB.Loader._check(comp)) {
      callback();
      return;
    }

    FB.Loader._reqs.push(request);
    FB.Loader._comps[comp] = true;

    // We use a timer trick to queue up multiple components requests
    // so we just need to send out a single script HTTP request
    if (!FB.Loader._timer) {
      FB.Loader._timer = setTimeout(function(){
        FB.Loader._timer = 0;
        FB.Dom.addScript(FB.dynData.resources.loader_url  + '?comps=' +
                         FB.Array.keys(FB.Loader._comps).join(',') +
                         '&exclude=' +
                      FB.Array.keys(FB.Loader.loaded).join(','));
      }, 0);
    }
  },

  _onCompLoaded: function() {
    var completed = [];
    FB.forEach(FB.Loader._reqs, function(req, i) {
      if (req && FB.Loader._check(req.comp)){
        completed.push([i, req.cb]);
      }
    });

    // First delete them from request query before calling
    // callback functions to prevent re-entrant calls
    FB.forEach(completed, function(item) {
      delete FB.Loader._reqs[item[0]];
    });


    // Now call the callbacks
    FB.forEach(completed, function(item) {
      item[1]();
    })
  },


  /**
   * Check if a comp if fullfilled
   * @return true if it is done
   * @static
   */
  _check: function(comp) {
    // Is comp loaded?
    return (FB.Loader.loaded[comp] || FB.create(comp, false, true));
  },

  /*
   * Global state variables
   */
  _reqs : [],
  _comps: {}
});

