Mu = {
  ApiKey        : null,
  ChannelUrl    : null,
  ConnectStatus : 'unknown', // or 'disconnected' or 'connected'
  Session       : null,

  Domain        : 'http://www.facebook.com/',
  ConnectDomain : 'http://www.connect.facebook.com/',
  ApiDomain     : 'http://api.facebook.com/',

  Callbacks     : {},
  XdFrames      : {},



  // initialize the library
  init: function(apiKey, channelUrl, session) {
    if (channelUrl.indexOf('http') !== 0) {
      var base = window.location.protocol + '//' + window.location.host;
      if (channelUrl.charAt(0) == '/') {
        channelUrl = base + channelUrl;
      } else {
        var path = window.location.pathname;
        channelUrl = (
          base +
          path.substr(0, path.lastIndexOf('/') + 1) +
          channelUrl
        );
      }
    }
    // we should never be busting the cache
    if (channelUrl.indexOf('#') < 0) {
      channelUrl += '#';
    }

    Mu.ApiKey        = apiKey;
    Mu.ChannelUrl    = channelUrl;
    Mu.Session       = session;
    Mu.ConnectStatus = session ? 'connected' : 'unknown';
  },



  //
  // helper functions
  //

  // weak random id's for various things
  guid: function() {
    return 'f' + (Math.random() * (1<<30)).toString(16).replace('.', '');
  },

  // encode to query string
  encodeQS: function(params, sep, encode) {
    sep    = sep === undefined ? '&' : sep;
    encode = encode === false ? function(s) { return s; } : encodeURIComponent;

    var
      pairs = [],
      k;

    for (k in params) {
      if (params.hasOwnProperty(k) && typeof params[k] != 'undefined') {
        pairs.push(encode(k) + '=' + encode(params[k]));
      }
    }
    pairs.sort();
    return pairs.join(sep);
  },

  // decode from query string
  decodeQS: function(str) {
    var
      decode = decodeURIComponent,
      params = {},
      parts  = str.split('&'),
      i,
      pair;

    for (i=0; i<parts.length; i++) {
      pair = parts[i].split('=', 2);
      params[decode(pair[0])] = decode(pair[1]);
    }

    return params;
  },

  // builds and inserts a hidden iframe
  hiddenIframe: function(url, frame) {
    var
      node  = document.createElement('iframe'),
      style = node.style;

    style.position = 'absolute';
    style.top      = style.left   = '-10000px';
    style.width    = style.height = 0;

    node.setAttribute('src', url);

    Mu.XdFrames[frame] = document.body.appendChild(node);
  },

  // for popup windows. can only be used in a user initiated event
  popup: function(url, width, height, id) {
    // we try to place it at the center of the current window
    var
      screenX    = typeof window.screenX      != 'undefined'
        ? window.screenX
        : window.screenLeft,
      screenY    = typeof window.screenY      != 'undefined'
        ? window.screenY
        : window.screenTop,
      outerWidth = typeof window.outerWidth   != 'undefined'
        ? window.outerWidth
        : document.body.clientWidth,
      outerHeight = typeof window.outerHeight != 'undefined'
        ? window.outerHeight
        : (document.body.clientHeight - 22),
      left     = parseInt(screenX + ((outerWidth - width) / 2), 10),
      top      = parseInt(screenY + ((outerHeight - height) / 2.5), 10),
      features = (
        'width=' + width +
        ',height=' + height +
        ',left=' + left +
        ',top=' + top
       );

    Mu.XdFrames[id] = window.open(url, '_blank', features);
  },



  //
  // the cross domain communication layer
  //

  // builds a url attached to a callback for xd messages
  xdHandler: function(cb, frame, target) {
    var g = Mu.guid();
    Mu.Callbacks[g] = cb;
    return Mu.ChannelUrl + Mu.encodeQS({
      frame  : frame,
      cb     : g,
      target : target || 'opener'
    });
  },

  // result token based handler
  xdResult: function(g, cb, target) {
    return Mu.xdHandler(function(params) {
      cb(params && params.result);
    }, g, target) + '&result=xxRESULTTOKENxx';
  },

  // session handler
  xdSession: function(g, callback, status, target) {
    return Mu.xdHandler(function(params) {
      // first we reset
      Mu.ConnectStatus = status;
      Mu.Session       = null;

      // try to extract a session
      if (params && params.session) {
        try {
          Mu.Session = params.session = JSON.parse(params.session);
        } catch(e) {}
      }

      // user defined callback
      callback(status, Mu.Session);
    }, g, target);
  },

  // handles an incoming xd message
  xdRecv: function(params) {
    var
      frame    = Mu.XdFrames[params.frame],
      callback = Mu.Callbacks[params.cb];

    // remove an iframe or close a popup window
    if (frame.tagName) {
      // timeout of 500 prevents the safari forever waiting bug if we end up
      // using this for visible iframe dialogs, the 500 would be unacceptable
      window.setTimeout(function() {
        frame.parentNode.removeChild(frame);
      }, 500);
    } else {
      frame.close();
    }

    // cleanup and fire
    delete Mu.XdFrames[params.frame];
    delete Mu.Callbacks[params.cb];
    callback(params);
  },

  // invoked by xd.html
  xdChild: function(href) {
    // the ? => & conversion is because of a bug in login.php
    var params = Mu.decodeQS(
      href.substr(href.indexOf('#') + 1).replace('?', '&'));
    if ('target' in params) {
      window[params.target].Mu.xdRecv(params);
    }
  },



  //
  // status and logut are hidden iframes, as they do not involve user
  // interaction. others are popup windows.
  //

  // find out the current status from the server
  status: function(cb) {
    var
      g   = Mu.guid(),
      url = Mu.ConnectDomain + 'extern/login_status.php?' + Mu.encodeQS({
        api_key    : Mu.ApiKey,
        no_session : Mu.xdSession(g, cb, 'disconnected', 'parent'),
        no_user    : Mu.xdSession(g, cb, 'unknown',      'parent'),
        ok_session : Mu.xdSession(g, cb, 'connected',    'parent')
      });

    Mu.hiddenIframe(url, g);
  },

  // open a new window asking the user to log in
  login: function(cb) {
    var
      g   = Mu.guid(),
      url = Mu.Domain + 'login.php?' + Mu.encodeQS({
        api_key        : Mu.ApiKey,
        cancel_url     : Mu.xdSession(g, cb, 'unknown'),
        display        : 'popup',
        fbconnect      : 1,
        next           : Mu.xdSession(g, cb, 'connected'),
        return_session : 1,
        v              : '1.0'
      });

    Mu.popup(url, 450, 415, g);
  },

  // show a iframe dialog asking the user to connect
  connect: function(cb) {
    var
      g   = Mu.guid(),
      url = Mu.Domain + 'tos.php?' + Mu.encodeQS({
        api_key        : Mu.ApiKey,
        cancel_url     : Mu.xdSession(g, cb, 'disconnected'),
        display        : 'popup',
        fbconnect      : 1,
        next           : Mu.xdSession(g, cb, 'connected'),
        return_session : 1,
        v              : '1.0'
      });

    Mu.popup(url, 450, 327, g);
  },

  // log the user out in the background
  logout: function(cb) {
    var
      g   = Mu.guid(),
      url = Mu.Domain + 'logout.php?' + Mu.encodeQS({
        api_key     : Mu.ApiKey,
        next        : Mu.xdSession(g, cb, 'unknown', 'parent'),
        session_key : Mu.Session.session_key
      });

    Mu.hiddenIframe(url, g);
  },

  // make an _API_ call (this is not a iframe or a popup)
  disconnect: function(cb) {
    Mu.api({ method: 'Auth.revokeAuthorization' }, function(response) {
      cb(Mu.ConnectStatus = 'disconnected', Mu.Session = null);
    });
  },

  // request the user to grant permissions
  permissions: function(perms, cb, height) {
    var
      g   = Mu.guid(),
      url = Mu.Domain + 'connect/prompt_permissions.php?' + Mu.encodeQS({
        api_key  : Mu.ApiKey,
        display  : 'popup',
        ext_perm : perms,
        next     : Mu.xdResult(g, cb),
        v        : '1.0'
      });

    // the height can vary widely, so we pick a safe tall value
    Mu.popup(url, 477, height || 500, g);
  },

  // let the user share the specified (or default current) url
  share: function(u, title) {
    var
      url = Mu.Domain + 'sharer.php?' + Mu.encodeQS({
        title : title || '',
        u     : u || window.location.toString()
      });

    Mu.popup(url, 575, 380);
  },

  // publish to the stream
  publish: function(message, attach, actions, target_id, prompt_message) {
    var
      url = Mu.Domain + 'connect/prompt_feed.php?' + Mu.encodeQS({
        action_links        : actions ? JSON.stringify(actions) : undefined,
        api_key             : Mu.ApiKey,
        attachment          : attach ? JSON.stringify(attach) : undefined,
        message             : message,
        preview             : true,
        session_key         : Mu.Session ? Mu.Session.session_key : '',
        target_id           : target_id,
        user_message_prompt : prompt_message
      });

    Mu.popup(url, 550, 242);
  },

  // add friend
  addFriend: function(id, cb) {
    var
      g   = Mu.guid(),
      url = Mu.Domain + 'addfriend.php?' + Mu.encodeQS({
        api_key     : Mu.ApiKey,
        display     : 'dialog',
        id          : id,
        next        : Mu.xdResult(g, cb),
        session_key : Mu.Session.session_key
      });

    Mu.popup(url, 565, 240, g);
  },



  //
  // this allows making siged API calls using JSONP. make sure you understand
  // JSONP limitations.
  //

  // make an api call
  api: function(params, cb) {
    var
      g      = Mu.guid(),
      script = document.createElement('script'),
      k,

      // general signed api call parameters
      signed = {
        api_key     : Mu.ApiKey,
        call_id     : (new Date()).getTime(),
        callback    : 'Mu.Callbacks.' + g,
        format      : 'json',
        session_key : Mu.Session.session_key,
        ss          : 1,
        v           : '1.0'
      };

    for (k in params) {
      if (params.hasOwnProperty(k)) {
        signed[k] = params[k];
      }
    }

    // the signature is described at:
    // http://wiki.developers.facebook.com/index.php/Verifying_The_Signature
    signed.sig = md5sum(Mu.encodeQS(signed, '', false) + Mu.Session.secret);

    // this is the JSONP callback invoked by the response from restserver.php
    Mu.Callbacks[g] = function(response) {
      cb(response);
      delete Mu.Callbacks[g];
      script.parentNode.removeChild(script);
    };

    script.src = Mu.ApiDomain + 'restserver.php?' + Mu.encodeQS(signed);
    document.getElementsByTagName('head')[0].appendChild(script);
  }
};
