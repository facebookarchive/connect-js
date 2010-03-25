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
 * This provides helper methods related to animation.
 *
 * @class FB.Anim
 * @static
 * @private
 */
FB.provide('Anim', {
  /**
   * Animate Transformable Element
   *
   * Note: only pixel, opactity values are animatable
   *
   * @param dom {DOMElement} the element
   * @param props {Object} an object with the properties of the destination
   * @param duration {Number} the number of miliseconds over which the animation
   *                          should happen
   * @param callback {Function} the callback function to call after the
   *                                 animcation is complete
   */
  ate: function(dom, props, duration, callback) {
    duration = duration ? duration : 500;
    var
      frame_speed = 40,
      step        = 0,
      total_steps = Math.round(duration / frame_speed),
      start       = {},
      _this       = this,
      s           = dom.style,
      timer       = setInterval(function() {
        FB.Array.forEach(props, function(value, property) {
          if (step == 0) {
            if (property === 'opacity') {
              if (s.opacity) { start[property] = (s.opacity * 100); }
              if (s.MozOpacity) { start[property] = (s.MozOpacity * 100); }
              if (s.KhtmlOpacity) { start[property] = (s.KhtmlOpacity * 100); }
              if (s.filters) { start[property] = s.filters.alpha.opacity; }
            } else {
              start[property] = parseInt(FB.Dom.getStyle(dom, property), 10);
            }
          }
          var got_property =
            (!isNaN(start[property]) && start[property] != null);
          var st = got_property ? start[property] : 0;
          var pos = parseInt(FB.Dom.getStyle(dom, property), 10);
          var next = st +
           Math.ceil((value - st) * Math.sin(Math.PI/2 * (step / total_steps)));
          if (property == 'opacity') {
            if (next >= 100) { next = 99.999; } // fix for Mozilla < 1.5b2
            if (next < 0) { next = 0; }
            s.opacity = next/100;
            s.MozOpacity = next/100;
            s.KhtmlOpacity = next/100;
            if (s.filters) { s.filters.alpha.opacity = next; }
          } else { s[property] = next + 'px'; }
        });
        if (step++ >= total_steps) {
          clearInterval(timer);
          if (callback) { callback(dom); }
        }
      }, frame_speed);
  }
});
