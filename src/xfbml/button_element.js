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
 * @provides fb.xfbml.buttonelement
 * @layer xfbml
 * @requires fb.type fb.xfbml.element fb.css.button fb.string
 */

/**
 * Base class for a button element.
 *
 * @class FB.XFBML.ButtonElement
 * @extends  FB.XFBML.Element
 * @private
 */
FB.subclass('XFBML.ButtonElement', 'XFBML.Element', null, {
  _allowedSizes: ['icon', 'small', 'medium', 'large', 'xlarge'],

  /////////////////////////////////////////////////////////////////////////////
  // Methods the implementation MUST override
  /////////////////////////////////////////////////////////////////////////////

  /**
   * Invoked when the button is clicked.
   */
  onClick: function() {
    throw new Error('Inheriting class needs to implement onClick().');
  },

  /////////////////////////////////////////////////////////////////////////////
  // Methods the implementation CAN override
  /////////////////////////////////////////////////////////////////////////////

  /**
   * This method is invoked before any processing is done to do any initial
   * setup and do any necessary validation on the attributes. A return value of
   * false will indicate that validation was unsuccessful and processing will
   * be halted. If you are going to return false and halt processing, you
   * should ensure you use FB.log() to output a short informative message
   * before doing so.
   *
   * @return {Boolean} true to continue processing, false to halt it
   */
  setupAndValidate: function() {
    return true;
  },

  /**
   * Should return the button markup. The default behaviour is to return the
   * original innerHTML of the element.
   *
   * @return {String} the HTML markup for the button
   */
  getButtonMarkup: function() {
    return this.getOriginalHTML();
  },

  /////////////////////////////////////////////////////////////////////////////
  // Public methods the implementation CAN use
  /////////////////////////////////////////////////////////////////////////////

  /**
   * Get the original innerHTML of the element.
   *
   * @return {String} the original innerHTML
   */
  getOriginalHTML: function() {
    return this._originalHTML;
  },

  /////////////////////////////////////////////////////////////////////////////
  // Private methods the implementation MUST NOT use or override
  /////////////////////////////////////////////////////////////////////////////

  /**
   * Processes this tag.
   */
  process: function() {
    if (!('_originalHTML' in this)) {
      this._originalHTML = FB.String.trim(this.dom.innerHTML);
    }

    if (!this.setupAndValidate()) {
      // failure to validate means we're done rendering what we can
      this.fire('render');
      return;
    }

    var
      size = this._getAttributeFromList('size', 'medium', this._allowedSizes),
      className = '',
      markup    = '';

    if (size == 'icon') {
      className = 'fb_button_simple';
    } else {
      var rtl_suffix = FB._localeIsRtl ? '_rtl' : '';
      markup = this.getButtonMarkup();
      className = 'fb_button' + rtl_suffix + ' fb_button_' + size + rtl_suffix;
    }

    this.dom.innerHTML = (
      '<a class="' + className + '">' +
        '<span class="fb_button_text">' + markup + '</span>' +
      '</a>'
    );

    // the firstChild is the anchor tag we just setup above
    this.dom.firstChild.onclick = FB.bind(this.onClick, this);

    this.fire('render');
  }
});
