/**
 * @module Mu
 * @provides Mu.XFBML.Tag.Name
 *
 * @requires Mu.Prelude
 *           Mu.XFBML.Core
 *           Mu.API
 */

/**
 * Share code between fb:name and fb:pronoun.
 *
 * @class Mu.XFBML.NameBase
 * @static
 * @access private
 */
Mu.copy('XFBML.NameBase', {
  /**
   * Process the node.
   *
   * @access private
   * @param node     {Node}      a DOM Node
   * @param config   {Object}    the tag configuration
   * @param userCb   {Function}  function to invoke upon completion/error
   * @param renderCb {Function}  function to invoke to handle data & render tag
   */
  process: function(node, config, userCb, renderCb) {
    // no uid, bail
    if (!config.uid) {
      node.innerHTML = '';
      userCb(node, 'Missing required "uid" field.');
      return;
    }

    // implicit reflexive
    if (config.uid == config.subjectid) {
      config.reflexive = true;
    }

    // fields needed
    var fields = ['first_name', 'last_name', 'sex', 'profile_url'];
    if (config.shownetwork) {
      fields.push('affiliations');
    }

    // need the uid data for sure
    var queries = [
      {
        table    : 'user',
        fields   : fields,
        keyName  : 'uid',
        keyValue : config.uid
      }
    ];

    // incase a subject data is needed
    if (config.subjectid && !config.reflexive) {
      queries.push(
        {
          table    : 'user',
          fields   : fields,
          keyName  : 'uid',
          keyValue : config.subjectid
        }
      );
    }

    // do the query, render using the supplied renderCb, finally invoke userCb
    Mu.IndexedQuery.make(queries, function(response) {
      // TODO what to do if we dont get the data?
      if (response && response[0]) {
        node.innerHTML = renderCb(config, response[0], response[1]);
        userCb(node);
      }
    });
  },

  /**
   * Render the fb:name.
   *
   * @access private
   * @param config  {Object} the config
   * @param user    {Object} the user
   * @param subject {Object} the subject
   * @returns String
   */
  renderName: function(config, user, subject) {
    var
      isCurrentUser = config.uid == (Mu._session && Mu._session.uid),
      network = '',
      name;

    if (subject && user.uid == subject.uid) {
      name = Mu.XFBML.NameBase.renderPronoun(config, user, subject);
    } else if (isCurrentUser && config.useyou) {
      name = config.capitalize
        ? 'fixme'
        : Mu.XFBML.NameBase.renderSelf(config);
    } else {
      if (user.first_name === null) {
        user.first_name = '';
      }
      if (user.last_name === null) {
        user.last_name = '';
      }

      if (config.firstnameonly) {
        name = user.first_name;
      } else if (config.lastnameonly) {
        name = user.last_name;
      } else {
        name = (
          user.first_name +
          (user.first_name === '' ? '' : ' ') +
          user.last_name
        );
      }

      if (name !== '' && config.possessive) {
        name += "'s";
      }

      if (config.shownetwork) {
        network = (
          '(' +
          (user.affiliations && user.affiliations.length > 0
            ? user.affiliations[0].name
            : 'no network' //TODO i18n
          ) +
          ')'
        );
      }
    }

    if (name === '') {
      name = config.ifcantsee;
    }

    if (config.linked) {
      name = '<a href="' + user.profile_url + '">' + name + '</a>';
    }

    if (!Mu._session) {
      name = '<strong>' + name + '</strong>';
    }

    if (network !== '') {
      name += ' ' + network;
    }

    return name;
  },

  /**
   * Helper function shared between name/pronoun.
   *
   * @access private
   * @param config  {Object} the config
   * @returns String
   */
  renderSelf: function(config) {
    if (config.possessive) {
      return config.reflexive ? 'your own' : 'your';
    } else {
      return config.reflexive ? 'yourself' : 'you';
    }
  },

  /**
   * Render the pronoun.
   *
   * @access private
   * @param config  {Object} the config
   * @param user    {Object} the user
   * @param subject {Object} the subject
   * @returns String
   */
  renderPronoun: function(config, user, subject) {
    var isCurrentUser = config.uid == (Mu._session && Mu._session.uid);

    if (isCurrentUser && config.useyou) {
      return Mu.XFBML.NameBase.renderSelf(config);
    } else {
      switch (user.sex) {
        case 'male':
          if (config.possessive) {
            return config.reflexive ? 'his own' : 'his';
          } else {
            if (config.reflexive) {
              return 'himself';
            } else if (subject) {
              return 'him';
            } else {
              return 'he';
            }
          }
          break;
        case 'female':
          if (config.possessive) {
            return config.reflexive ? 'her own' : 'her';
          } else {
            if (config.reflexive) {
              return 'herself';
            } else if (subject) {
              return 'her';
            } else {
              return 'she';
            }
          }
          break;
        default:
          if (config.usethey) {
            if (config.possessive) {
              return config.reflexive ? 'their own' : 'their';
            } else {
              if (config.reflexive) {
                return 'themself';
              } else if (subject) {
                return 'them';
              } else {
                return 'they';
              }
            }
          } else {
            if (config.possessive) {
              return config.reflexive ? 'his/her own' : 'his/her';
            } else {
              if (config.reflexive) {
                return 'himself/herself';
              } else if (subject) {
                return 'him/her';
              } else {
                return 'he/she';
              }
            }
          }
      }
    }
  }
});

/**
 * Name.
 *
 * @class Mu.XFBML.Tag.Name
 * @static
 * @access private
 */
Mu.copy('XFBML.Tag.Name', {
  /**
   * The tag name.
   *
   * @access private
   * @type String
   */
  name: 'name',

  /**
   * Returns the Attribute Configuration.
   *
   * @access private
   * @returns {Object} the Attribute Configuration.
   */
  attrConfig: function() {
    var Attr = Mu.XFBML.Attr;
    return {
      uid           : Attr.uid(),
      firstnameonly : Attr.bool(false),
      linked        : Attr.bool(true),
      lastnameonly  : Attr.bool(false),
      possessive    : Attr.bool(false),
      reflexive     : Attr.bool(false),
      shownetwork   : Attr.bool(false),
      useyou        : Attr.bool(true),
      ifcantsee     : Attr.any('Facebook User'), //TODO i18n
      capitalize    : Attr.bool(false),
      subjectid     : Attr.any()
    };
  },

  /**
   * Process the node.
   *
   * @access private
   * @param node   {Node}      a DOM Node
   * @param config {Object}    the tag configuration
   * @param cb     {Function}  function to invoke upon completion/error
   */
  process: function(node, config, cb) {
    Mu.XFBML.NameBase.process(
      node,
      config,
      cb,
      Mu.XFBML.NameBase.renderName
    );
  }
});

/**
 * Pronoun.
 *
 * @class Mu.XFBML.Tag.Pronoun
 * @static
 * @access private
 */
Mu.copy('XFBML.Tag.Pronoun', {
  /**
   * The tag name.
   *
   * @access private
   * @type String
   */
  name: 'pronoun',

  /**
   * Returns the Attribute Configuration.
   *
   * @access private
   * @returns {Object} the Attribute Configuration.
   */
  attrConfig: function() {
    var Attr = Mu.XFBML.Attr;
    return {
      uid        : Attr.uid(),
      possessive : Attr.bool(false),
      reflexive  : Attr.bool(false),
      useyou     : Attr.bool(true),
      ifcantsee  : Attr.any('Facebook User'), //TODO i18n
      capitalize : Attr.bool(false)
    };
  },

  /**
   * Process the node.
   *
   * @access private
   * @param node   {Node}      a DOM Node
   * @param config {Object}    the tag configuration
   * @param cb     {Function}  function to invoke upon completion/error
   */
  process: function(node, config, cb) {
    Mu.XFBML.NameBase.process(
      node,
      config,
      cb,
      Mu.XFBML.NameBase.renderPronoun
    );
  }
});
