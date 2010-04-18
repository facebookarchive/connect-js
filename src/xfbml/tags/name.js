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
 * @provides fb.xfbml.name
 * @layer xfbml
 * @requires fb.type fb.xfbml  fb.dom fb.xfbml.element fb.data fb.helper
 */

/**
 * @class FB.XFBML.Name
 * @extends  FB.XFBML.Element
 * @private
 */
FB.subclass('XFBML.Name', 'XFBML.Element', null, {
  /**
   * Processes this tag.
   */
  process: function() {
    FB.copy(this, {
      _uid           : this.getAttribute('uid'),
      _firstnameonly : this._getBoolAttribute('first-name-only'),
      _lastnameonly  : this._getBoolAttribute('last-name-only'),
      _possessive    : this._getBoolAttribute('possessive'),
      _reflexive     : this._getBoolAttribute('reflexive'),
      _objective     : this._getBoolAttribute('objective'),
      _linked        : this._getBoolAttribute('linked', true),
      _subjectId     : this.getAttribute('subject-id')
    });

    if (!this._uid) {
      FB.log('"uid" is a required attribute for <fb:name>');
      this.fire('render');
      return;
    }

    var fields = [];
    if (this._firstnameonly) {
      fields.push('first_name');
    } else if (this._lastnameonly) {
      fields.push('last_name');
    } else {
      fields.push('name');
    }

    if (this._subjectId) {
      fields.push('sex');

      if (this._subjectId == FB.Helper.getLoggedInUser()) {
        this._reflexive = true;
      }
    }

    var data;
    // Wait for status to be known
    FB.Event.monitor('auth.statusChange', this.bind(function() {
      // Is Element still in DOM tree?
      if (!this.isValid()) {
        this.fire('render');
        return true; // Stop processing
      }

      if (FB._userStatus) {
        if (this._uid == 'loggedinuser') {
          this._uid = FB.Helper.getLoggedInUser();
        }

        if (FB.Helper.isUser(this._uid)) {
          data = FB.Data._selectByIndex(fields, 'user', 'uid', this._uid);
        } else {
          data = FB.Data._selectByIndex(['name', 'id'], 'profile', 'id',
                                        this._uid);
        }
        data.wait(this.bind(function(data) {
          if (this._uid) {
            if (this._subjectId == this._uid) {
              this._renderPronoun(data[0]);
            } else {
              this._renderOther(data[0]);
            }
          }
          this.fire('render');
        }));
      }
      return false;
    }));
  },

  /**
   * Given this name, figure out the proper (English) pronoun for it.
   */
  _renderPronoun: function(userInfo) {
    var
      word = '',
      objective = this._objective;
    if (this._subjectId) {
      objective = true;
      if (this._subjectId === this._uid) {
        this._reflexive = true;
      }
    }
    if (this._uid == FB.Connect.get_loggedInUser() &&
        this._getBoolAttribute('use-you', true)) {
      if (this._possessive) {
        if (this._reflexive) {
          word = 'your own';
        } else {
          word = 'your';
        }
      } else {
        if (this._reflexive) {
          word = 'yourself';
        } else {
          word = 'you';
        }
      }
    }
    else {
      switch (userInfo.sex) {
        case 'male':
          if (this._possessive) {
            word = this._reflexive ? 'his own' : 'his';
          } else {
            if (this._reflexive) {
              word = 'himself';
            } else if (objective) {
              word = 'him';
            } else {
              word = 'he';
            }
          }
          break;
        case 'female':
          if (this._possessive) {
            word = this._reflexive ? 'her own' : 'her';
          } else {
            if (this._reflexive) {
              word = 'herself';
            } else if (objective) {
              word = 'her';
            } else {
              word = 'she';
            }
          }
          break;
        default:
          if (this._getBoolAttribute('use-they', true)) {
            if (this._possessive) {
              if (this._reflexive) {
                word = 'their own';
              } else {
                word = 'their';
              }
            } else {
              if (this._reflexive) {
                word = 'themselves';
              } else if (objective) {
                word = 'them';
              } else {
                word = 'they';
              }
            }
          }
          else {
            if (this._possessive) {
              if (this._reflexive) {
                word = 'his/her own';
              } else {
                word = 'his/her';
              }
            } else {
              if (this._reflexive) {
                word = 'himself/herself';
              } else if (objective) {
                word = 'him/her';
              } else {
                word = 'he/she';
              }
            }
          }
          break;
      }
    }
    if (this._getBoolAttribute('capitalize', false)) {
      word = FB.Helper.upperCaseFirstChar(word);
    }
    this.dom.innerHTML = word;
  },

  /**
   * Handle rendering of the element, using the
   * metadata that came with it.
   */
  _renderOther: function(userInfo) {
    if (!userInfo) {
      return;
    }
    var
      name = '',
      html = '';
    if (this._uid == FB.Helper.getLoggedInUser() &&
        this._getBoolAttribute('use-you', true)) {
      if (this._reflexive) {
        if (this._possessive) {
          name = 'your own';
        } else {
          name = 'yourself';
        }
      } else {
        //  The possessive works really nicely this way!
        if (this._possessive) {
          name = 'your';
        } else {
          name = 'you';
        }
      }
    }
    else {
      //  FQLCantSee structures will show as null.
      if (null === userInfo.first_name) {
        userInfo.first_name = '';
      }
      if (null === userInfo.last_name) {
        userInfo.last_name = '';
      }
      if (this._firstnameonly) {
        name = userInfo.first_name;
      } else if (this._lastnameonly) {
        name = userInfo.last_name;
      }

      if (!name) {
        name = userInfo.name;
      }

      if (name !== '' && this._possessive) {
        name += '\'s';
      }
    }

    if (!name) {
      name = this.getAttribute('if-cant-see', 'Facebook User');
    }
    if (name) {
      if (this._getBoolAttribute('capitalize', false)) {
        name = FB.Helper.upperCaseFirstChar(name);
      }
      if (this._linked) {
        html = FB.Helper.getProfileLink(userInfo, name,
          this.getAttribute('href', null));
      } else {
        html = name;
      }
    }
    this.dom.innerHTML = html;
  }
});
