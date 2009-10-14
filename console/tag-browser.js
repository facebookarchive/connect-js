var AttrDefinitions = {
  any: function(def) {
    return { type: 'any', def: def };
  },

  bool: function(def) {
    return { type: 'bool', def: def };
  },

  integer: function(def) {
    //todo use better type
    return { type: 'any', def: def };
  },

  size: function(def) {
    //todo use better type
    return { type: 'any', def: def };
  },

  ienum: function(def, allowed) {
    return { type: 'ienum', def: def, allowed: allowed };
  },

  uid: function() {
    //todo use better type
    return { type: 'any' };
  }
};

function getTagDefinitions() {
  // replace the Attr logic to return the information rather than validation
  var oldAttr = Mu.XFBML.Attr;
  Mu.XFBML.Attr = AttrDefinitions;

  var definitions = {};

  var TagNS = Mu.XFBML.Tag;
  for (var impl in TagNS) {
    var tag = TagNS[impl];
    definitions[tag.name] = tag.attrConfig();
  }

  Mu.XFBML.Attr = oldAttr;

  return definitions;
}

// just do this once on load
var TagDefs = getTagDefinitions();

var AttrRenderer = {
  any: function(name, conf) {
    return (
      '<input name="' + name + '"' +
      (conf.def ? (' value="' + conf.def + '"') : '') +
      '>'
    );
  },

  bool: function(name, conf) {
    return (
      '<select name="' + name + '">' +
      '<option value="1"' + (conf.def ? ' selected' : '') + '>Yes</option>' +
      '<option value="0"' + (!conf.def ? ' selected' : '') + '>No</option>' +
      '</select>'
    );
  },

  ienum: function(name, conf) {
    var options = '';
    for (var i=0, l=conf.allowed.length; i<l; i++) {
      var val = conf.allowed[i];
      options += (
        '<option value="' + val + '"' +
        (val == conf.def ? ' selected' : '') +
        '>' + val + '</option>'
      );
    }
    return (
      '<select name="' + name + '">' +
      options +
      '</select>'
    );
  }
};

function renderAttr(name, conf) {
  return (
    '<div class="attr">' +
      '<label for="' + name + '">' + name + '</label>' +
      AttrRenderer[conf.type](name, conf) +
    '</div>'
  );
}

function renderMarkup(root) {
  var name = root.getElementsByTagName('h1')[0].innerHTML;
  var textarea = root.getElementsByTagName('textarea')[0];
  var preview = root.getElementsByTagName('div')[0];
  var tag = TagDefs[name];

  var markup = '<fb:' + name;
  for (var attr in tag) {
    var userVal = root[attr].value;
    if (userVal && userVal != tag[attr].def) {
      markup += ' ' + attr + '="' + userVal + '"';
    }
  }
  markup += '></fb:' + name + '>';
  textarea.value = markup;
  preview.innerHTML = markup;
  Mu.processXFBML(preview);
}

function renderTagBrowser() {
  var html = '';
  for (var tagName in TagDefs) {
    var tag = TagDefs[tagName];

    html += (
      '<form class="tag-configurer">' +
      '<h1>' + tagName + '</h1>' +
      '<textarea></textarea>' +
      '<div class="preview"></div>'
    );
    for (var attr in tag) {
      html += renderAttr(attr, tag[attr]);
    }
    html += '</form>';
  }

  var tagBrowser = document.getElementById('tag-browser');
  tagBrowser.innerHTML = html;

  // render the markup for each form once
  var forms = tagBrowser.getElementsByTagName('form');
  for (var i=0, l=forms.length; i<l; i++) {
    renderMarkup(forms[i]);
  }

  // setup change monitor and trigger it when something changes
  Delegator.listen('#tag-browser input, #tag-browser select', 'change', function(e) {
    renderMarkup(this.parentNode.parentNode);
  });
}
