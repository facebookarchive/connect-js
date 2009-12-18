/**
 * @provides fb.Loader
 * @layer Basic
 * @requires fb.Component fb.Array fb.Dom fb.prelude
 */

/**
 * Dynamically load components by inserting a <script> tag. Dynamic
 * loading can be good if it will be occasionally used on a page,
 * and you don't know until runtime. However, it can be bad because
 * it tends to break packaging and caching mechanisms. Be careful
 * when choosing to dynamically load a component, and if a component
 * is dynamically loaded in common usage, then prefer to just load
 * directly.
 *
 * @class FB.Loader
 * @static
 * @private
 */
FB.provide('Loader', {

  /**
   * Use this to request dynamic loading of components in Facebook Client
   * JavaScript library
   * @param {String} comp  a component
   * @param {Function} callback  callback function to be executed when all
   *                  required components are finished loading
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
        FB.Dom.addScript(FB.Loader._resourceUrl(
                           FB.Array.keys(FB.Loader._comps),
                           FB.Array.keys(FB.Component.loaded)));
      }, 0);
    }
  },

  /**
   * Construct a URL that will load the requested components.
   *
   * @param {Array} included  list of strings specifying requirements
   * @param {Array} excluded  list of strings for components that
   *                          should be excluded (because already loaded)
   * @private
   */
 _resourceUrl: function(included, excluded) {
    return FB._domain.cdn +
     'dynamic_loader/' + // TODO: doesn't exist yet
     '?comps=' + included.join(',') +
     '&exclude=' + excluded.join(',');
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
    });
  },

  /**
   * Check if a comp if fullfilled
   * @return true if it is done
   */
  _check: function(comp) {
    return FB.Component.loaded[comp];
  },

  /*
   * Global state variables
   */
  _reqs : [],
  _comps: {}
});
