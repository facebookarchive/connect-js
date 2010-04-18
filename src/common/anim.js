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
 * @provides fb.anim
 * @layer basic
 * @requires fb.prelude fb.array fb.dom
 */

/**
 * This provides helper methods related to basic animation.
 *
 * @class FB.Anim
 * @static
 * @private
 */
FB.provide('Anim', {
  /**
   * Animate Transformable Element
   *
   * Note: only pixel, point, %, and opactity values are animate-able
   *
   * @param dom {DOMElement} the element to be animated
   * @param props {Object} an object with the properties of the animation
   *                       destination
   * @param duration {Number} the number of milliseconds over which the
   *                          animation should happen.
   * @param callback {Function} the callback function to call after the
   *                            animation is complete
   */
  ate: function(dom, props, duration, callback) {
    duration = duration ? duration : 750;
    var
      frame_speed = 40,
      from        = {},
      to          = {},
      begin       = null,
      s           = dom.style,
      timer       = setInterval(FB.bind(function() {
        if (!begin) { begin = new Date().getTime(); }
        // percent done
        var pd = Math.min((new Date().getTime() - begin) / duration, 1);
        FB.Array.forEach(props, FB.bind(function(value, prop) {
          if (!from[prop]) { // parse from CSS
            var style = FB.Dom.getStyle(dom, prop);
            // check for can't animate this, bad prop for this browser
            if (!style) { return; }
            from[prop] = this._parseCSS(style);
          }
          if (!to[prop]) { // parse to CSS
            to[prop] = this._parseCSS(value.toString());
          }
          var next = ''; // the next value to set
          FB.Array.forEach(from[prop], function(pair, i) {
            /* check for user overide not animating this part via special symbol
             * , "?". This is best used for animating properties with multiple
             * parts, such as backgroundPositon, where you only want to animate
             * one part and not the other.
             *
             * e.g.
             *   backgroundPosition: '8px 10px' => moves x and y to 8, 10
             *   backgroundPosition: '? 4px' => moves y to 4 and leaves x alone
             *   backgroundPosition: '7px ?' => moves x to 7 and leaves y alone
             */
            if (isNaN(to[prop][i].numPart) && to[prop][i].textPart == '?') {
              next = pair.numPart + pair.textPart;
            /* check for a non animate-able part
             * this includes colors (for now), positions, anything with out a #,
             * etc.
             */
            } else if (isNaN(pair.numPart)) {
              next = pair.textPart;
            // yay it's animate-able!
            } else {
              next +=
                (pair.numPart + // orig value
                 Math.ceil((to[prop][i].numPart - pair.numPart) *
                            Math.sin(Math.PI/2 * pd))) +
                to[prop][i].textPart + ' '; // text part and trailing space
            }
          });
          // update with new value
          FB.Dom.setStyle(dom, prop, next);
        }, this));
        if (pd == 1) { // are we done? clear the timer, call the callback
          clearInterval(timer);
          if (callback) { callback(dom); }
        }
      }, this), frame_speed);
  },

  /*
   * Parses a CSS statment into it's parts
   *
   * e.g. "1px solid black" =>
   *        [[numPart: 1,   textPart: 'px'],
   *         [numPart: NaN, textPart: 'solid'],
   *         [numPart: NaN, textPart: 'black']]
   *  or
   *      "5px 0% 2em none" =>
   *        [[numPart: 5,   textPart: 'px'],
   *         [numPart: 0,   textPart: '%'],
   *         [numPart: 2,   textPart: 'em'],
   *         [numPart: NaN, textPart: 'none']]
   */
  _parseCSS: function(css) {
    var ret = [];
    FB.Array.forEach(css.split(' '), function(peice) {
      var num = parseInt(peice, 10);
      ret.push({numPart: num, textPart: peice.replace(num,'')});
    });
    return ret;
  }
});
