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
 */
////////////////////////////////////////////////////////////////////////////////
module('xfbml');
////////////////////////////////////////////////////////////////////////////////

test(
  'FB.XFBML.Element',

  function() {
    // an FB.XFBML.Element can be any dom node, doesn't
    // necessarily need to be a special fb: one
    var html = '<a href="#" text-attr="The answer" num-attr="42" bool-attr="true">Some text</a>';

    var dom = FB.Content.append(html).childNodes[0];
    var xe = new FB.XFBML.Element(dom);
    equals(xe.isValid(), true);

    equals(xe.getAttribute('text-attr'), "The answer");
    equals(xe.getAttribute('num-attr'), 42);
    equals(xe.getAttribute('bool-attr'), "true");
    equals(xe.getAttribute('not-an-attribute'), null);

    equals(xe._getBoolAttribute('bool-attr'), true);
    equals(xe._getBoolAttribute('num-attr'), false);

    xe.clear();
    equals(xe.dom.innerHTML, '');

  });

// register a quick class for testing
FB.subclass('XFBML.TestElement', 'XFBML.Element', null, {
              process: function() {
                this.dom.innerHTML = this.render();
              },
              render: function() {
                return "The answer is obviously " +
                  this.getAttribute("answer");
              }
            });

test(
   'FB.XFBML parsing',

  function() {

    // preset
    FB.XFBML.registerTag({xmlns:'test', localName:'answer',
                          className:'FB.XFBML.TestElement'});

    var html = '<test:answer answer="42"></test:answer>';

    var container = FB.Content.append('');

    FB.XFBML.set(container, html);

    // use setTimeouts to wait for the rendering
    // at least until we implement appropriate events
    // or callbacks for when rendering is complete
    setTimeout(
      function () {
        var domElement = container.childNodes[0];

        // _element is the FB.XFBML.Element object
        same(domElement._element.dom, domElement);

        equals(domElement.innerHTML,
               'The answer is obviously 42');

        // change an attribute on the existing node and reprocess
        domElement.attributes["answer"].nodeValue = 39;
        FB.XFBML.parse(container);

        setTimeout(
          function() {
            equals(domElement.innerHTML,
                   'The answer is obviously 39');

            domElement._element.clear();

            equals(domElement.innerHTML, '');
            start();
          }, 1000);
      }, 1000);

    expect(4);
    stop();
});
