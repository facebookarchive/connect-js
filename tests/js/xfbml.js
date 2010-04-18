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
 * @provides fb.tests.xfbml
 * @requires fb.tests.qunit
 *           fb.xfbml
 */
////////////////////////////////////////////////////////////////////////////////
module('xfbml');
////////////////////////////////////////////////////////////////////////////////

test(
  'FB.XFBML.Element',

  function() {
    // an FB.XFBML.Element can be any dom node, doesn't
    // necessarily need to be a special fb: one
    var html = (
      '<a' +
        ' href="#"' +
        ' text-attr="The answer"' +
        ' num-attr="42"' +
        ' bool-attr="true"' +
        ' px-attr-one="1"' +
        ' px-attr-two="2px"' +
        ' px-attr-three="three"' +
        ' list-attr-one="hello"' +
        ' list-attr-two="world"' +
        ' under_score="42"' +
        ' joinword="42"' +
        '>' +
        'Some text' +
      '</a>'
    );

    var dom = FB.Content.append(html).childNodes[0];
    var xe = new FB.XFBML.Element(dom);
    equals(xe.isValid(), true);

    equals(xe.getAttribute('text-attr'), 'The answer');
    equals(xe.getAttribute('num-attr'), 42);
    equals(xe.getAttribute('bool-attr'), 'true');
    equals(xe.getAttribute('not-an-attribute'), null);

    equals(xe._getBoolAttribute('bool-attr'), true);
    equals(xe._getBoolAttribute('num-attr'), false);

    equals(xe._getPxAttribute('px-attr-one'), 1, 'expect px value 1');
    equals(xe._getPxAttribute('px-attr-two'), 2, 'expect px value 2');
    equals(xe._getPxAttribute('px-attr-three', 3), 3, 'expect px value 3');

    equals(xe._getAttributeFromList('list-attr-one', "a", ['hello']),
           'hello', 'expect list value "hello"');
    equals(xe._getAttributeFromList('list-attr-two', "a", ['hello']),
           'a', 'expect list value "a"');

    equals(xe.getAttribute('under-score'), 42, 'got under_score attr value');
    equals(xe.getAttribute('join-word'), 42, 'got joinword attr value');

    xe.clear();
    equals(xe.dom.innerHTML, '');
    dom.parentNode.parentNode.removeChild(dom.parentNode);
  }
);

// register a quick class for testing
FB.subclass('XFBML.TestElement', 'XFBML.Element', null, {
  process: function() {
    this.dom.innerHTML = this.render();
    this.fire('render');
  },
  render: function() {
    return 'The answer is obviously ' + this.getAttribute('answer');
  }
});

test(
   'FB.XFBML parsing and callbacks',

  function() {
    // preset
    FB.XFBML.registerTag({
      xmlns     : 'test',
      localName : 'answer',
      className : 'FB.XFBML.TestElement'
    });

    var fbml = '<test:answer answer="42"></test:answer>';
    var container = FB.Content.append(fbml);

    FB.XFBML.parse(container, function() {
      var domElement = container.childNodes[0];

      // _element is the FB.XFBML.Element object
      same(domElement._element.dom, domElement);
      equals(domElement.innerHTML, 'The answer is obviously 42');

      // change an attribute on the existing node and reprocess
      domElement.attributes['answer'].nodeValue = 39;
      FB.XFBML.parse(container, function() {
        equals(domElement.innerHTML, 'The answer is obviously 39');

        domElement._element.clear();
        equals(domElement.innerHTML, '');

        domElement.parentNode.parentNode.removeChild(domElement.parentNode);
        start();
      });
    });

    expect(4);
    stop();
  }
);
