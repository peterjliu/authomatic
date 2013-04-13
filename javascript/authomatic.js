// Generated by CoffeeScript 1.6.2
(function() {
  var $, Authomatic, BaseProvider, OAuth2CrossDomainProvider, OAuth2JsonpProvider, Oauth1Provider, Oauth2Provider, addJsonpCallback, defaults, deserializeCredentials, format, getProviderClass, log, parseQueryString, parseUrl, _ref, _ref1,
    __slice = [].slice,
    _this = this,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  $ = jQuery;

  defaults = {
    backend: null,
    substitute: {},
    params: {},
    jsonpCallbackPrefix: 'authomaticJsonpCallback',
    beforeBackend: function(data) {},
    backendComplete: function(data, status, jqXHR) {},
    beforeSend: function(jqXHR) {},
    success: function(data, status, jqXHR) {},
    complete: function(jqXHR, status) {}
  };

  log = function() {
    var args;

    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    if (authomatic.defaults.logging) {
      return console.log.apply(console, ['Authomatic:'].concat(__slice.call(args)));
    }
  };

  parseQueryString = function(queryString) {
    var item, k, result, v, _i, _len, _ref, _ref1;

    result = {};
    _ref = queryString.split('&');
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      item = _ref[_i];
      _ref1 = item.split('='), k = _ref1[0], v = _ref1[1];
      v = decodeURIComponent(v);
      if (result.hasOwnProperty(k)) {
        if (Array.isArray(result[k])) {
          result[k].push(v);
        } else {
          result[k] = [result[k], v];
        }
      } else {
        result[k] = v;
      }
    }
    return result;
  };

  parseUrl = function(url) {
    var qs, questionmarkIndex, u;

    log('parseUrl', url);
    questionmarkIndex = url.indexOf('?');
    if (questionmarkIndex >= 0) {
      u = url.substring(0, questionmarkIndex);
      qs = url.substring(questionmarkIndex + 1);
    } else {
      u = url;
    }
    return {
      url: u,
      query: qs,
      params: qs ? parseQueryString(qs) : void 0
    };
  };

  deserializeCredentials = function(credentials) {
    var sc, subtype, type, typeId, _ref;

    sc = decodeURIComponent(credentials).split('\n');
    typeId = sc[1];
    _ref = typeId.split('-'), type = _ref[0], subtype = _ref[1];
    return {
      id: parseInt(sc[0]),
      typeId: typeId,
      type: parseInt(type),
      subtype: parseInt(subtype),
      rest: sc.slice(2)
    };
  };

  getProviderClass = function(credentials) {
    var subtype, type, _ref;

    _ref = deserializeCredentials(credentials), type = _ref.type, subtype = _ref.subtype;
    if (type === 1) {
      return Oauth1Provider;
    } else if (type === 2) {
      return OAuth2JsonpProvider;
    } else {
      return BaseProvider;
    }
  };

  format = function(template, substitute) {
    return template.replace(/{([^}]*)}/g, function(match, tag) {
      var level, target, _i, _len, _ref;

      target = substitute;
      _ref = tag.split('.');
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        level = _ref[_i];
        target = target[level];
      }
      return target;
    });
  };

  addJsonpCallback = function(callback) {
    var name, path;

    Authomatic.jsonPCallbackCounter += 1;
    name = "" + defaults.jsonpCallbackPrefix + Authomatic.jsonPCallbackCounter;
    path = "window." + name;
    window[name] = function(data) {
      log('Calling jsonp callback:', path);
      if (typeof callback === "function") {
        callback(data);
      }
      log('Deleting jsonp callback:', path);
      return delete _this[name];
    };
    log("Adding " + path + " jsonp callback");
    return name;
  };

  window.authomatic = new (Authomatic = (function() {
    function Authomatic() {
      this.addJsonpCallback = __bind(this.addJsonpCallback, this);
    }

    Authomatic.prototype.defaults = {
      logging: true
    };

    Authomatic.prototype.accessDefaults = {
      backend: null,
      substitute: {},
      params: {},
      jsonpCallbackPrefix: 'authomaticJsonpCallback',
      beforeBackend: function(data) {},
      backendComplete: function(data, status, jqXHR) {},
      beforeSend: function(jqXHR) {},
      success: function(data, status, jqXHR) {},
      complete: function(jqXHR, status) {}
    };

    Authomatic.prototype._openWindow = function(url, width, height) {
      var left, settings, top;

      top = (screen.height / 2) - (height / 2);
      left = (screen.width / 2) - (width / 2);
      settings = "width=" + width + ",height=" + height + ",top=" + top + ",left=" + left;
      return window.open(url, "authomatic:" + url, settings);
    };

    Authomatic.prototype.popup = function(width, height, validator, aSelector, formSelector) {
      var _this = this;

      if (width == null) {
        width = 800;
      }
      if (height == null) {
        height = 600;
      }
      if (validator == null) {
        validator = (function($form) {
          return true;
        });
      }
      if (aSelector == null) {
        aSelector = 'a.authomatic';
      }
      if (formSelector == null) {
        formSelector = 'form.authomatic';
      }
      $(aSelector).click(function(e) {
        e.preventDefault();
        return _this._openWindow(e.target.href, width, height);
      });
      return $(formSelector).submit(function(e) {
        var $form, url;

        e.preventDefault();
        $form = $(e.target);
        url = $form.attr('action') + '?' + $form.serialize();
        if (validator($form)) {
          return _this._openWindow(url, width, height);
        }
      });
    };

    Authomatic.prototype.access = function(credentials, url, options) {
      var Provider, provider;

      if (options == null) {
        options = {};
      }
      url = format(url, options.substitute);
      Provider = getProviderClass(credentials);
      log("Instantiating " + Provider.name + ".");
      provider = new Provider(options.backend, credentials, url, options);
      return provider.access();
    };

    Authomatic.jsonPCallbackCounter = 0;

    Authomatic.prototype.addJsonpCallback = function(callback) {
      var name, path,
        _this = this;

      Authomatic.jsonPCallbackCounter += 1;
      name = "jsonpCallback" + Authomatic.jsonPCallbackCounter;
      path = "authomatic." + name;
      this[name] = function(data) {
        log('Calling jsonp callback:', path);
        if (typeof callback === "function") {
          callback(data);
        }
        log('Deleting jsonp callback:', path);
        return delete _this[name];
      };
      log('Adding jsonp callback:', path);
      return path;
    };

    return Authomatic;

  })());

  BaseProvider = (function() {
    function BaseProvider(backend, credentials, url, options) {
      var parsedUrl;

      this.backend = backend;
      this.credentials = credentials;
      this.access = __bind(this.access, this);
      this.contactProvider = __bind(this.contactProvider, this);
      this.contactBackend = __bind(this.contactBackend, this);
      this.options = {};
      $.extend(this.options, defaults, options);
      this.backendRequestType = 'auto';
      this.deserializedCredentials = deserializeCredentials(this.credentials);
      this.providerID = this.deserializedCredentials.id;
      this.providerType = this.deserializedCredentials.type;
      this.credentialsRest = this.deserializedCredentials.rest;
      parsedUrl = parseUrl(url);
      this.url = parsedUrl.url;
      this.params = {};
      $.extend(this.params, parsedUrl.params, this.options.params);
    }

    BaseProvider.prototype.contactBackend = function(callback) {
      var data;

      data = {
        type: this.backendRequestType,
        credentials: this.credentials,
        url: this.url,
        method: this.options.method,
        params: JSON.stringify(this.params)
      };
      this.options.beforeBackend(data);
      log("Contacting backend at " + this.options.backend + ".", data);
      return $.get(this.options.backend, data, callback);
    };

    BaseProvider.prototype.contactProvider = function(requestElements) {
      var headers, method, options, params, url;

      url = requestElements.url, method = requestElements.method, params = requestElements.params, headers = requestElements.headers;
      options = {
        type: method,
        data: params,
        headers: headers,
        complete: this.options.complete,
        success: this.options.success
      };
      log("Contacting provider.", url, options);
      return $.ajax(url, options);
    };

    BaseProvider.prototype.access = function() {
      var callback,
        _this = this;

      callback = function(data, textStatus, jqXHR) {
        var responseTo;

        _this.options.backendComplete(data, textStatus, jqXHR);
        responseTo = jqXHR != null ? jqXHR.getResponseHeader('Authomatic-Response-To') : void 0;
        if (responseTo === 'fetch') {
          log("Fetch data returned from backend.", jqXHR.getResponseHeader('content-type'), data);
          _this.options.success(data, status, jqXHR);
        } else if (responseTo === 'elements') {
          log("Request elements data returned from backend.", data);
          _this.contactProvider(data);
        }
        return _this.options.complete(jqXHR, textStatus);
      };
      return this.contactBackend(callback);
    };

    return BaseProvider;

  })();

  Oauth1Provider = (function(_super) {
    __extends(Oauth1Provider, _super);

    function Oauth1Provider() {
      var args;

      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      this.contactProvider = __bind(this.contactProvider, this);
      Oauth1Provider.__super__.constructor.apply(this, args);
      this.jsonpCallbackName = addJsonpCallback(this.options.success);
      $.extend(this.params, {
        callback: this.jsonpCallbackName
      });
    }

    Oauth1Provider.prototype.contactProvider = function(requestElements) {
      var headers, method, options, params, url;

      url = requestElements.url, method = requestElements.method, params = requestElements.params, headers = requestElements.headers;
      delete params.callback;
      options = {
        type: method,
        data: params,
        headers: headers,
        jsonpCallback: this.jsonpCallbackName,
        cache: true,
        dataType: 'jsonp',
        complete: this.options.log
      };
      this.optionscomplete("Contacting provider with JSONP callback " + this.jsonpCallbackName + ".", url, options);
      return $.ajax(url, options);
    };

    return Oauth1Provider;

  })(Oauth1Provider);

  Oauth2Provider = (function(_super) {
    __extends(Oauth2Provider, _super);

    function Oauth2Provider() {
      var args, _ref;

      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      this.handleTokenType = __bind(this.handleTokenType, this);
      this.handlePOST = __bind(this.handlePOST, this);
      this._x_unifyDifferences = __bind(this._x_unifyDifferences, this);
      Oauth2Provider.__super__.constructor.apply(this, args);
      this._x_unifyDifferences();
      _ref = this.credentialsRest, this.accessToken = _ref[0], this.refreshToken = _ref[1], this.expirationTime = _ref[2], this.tokenType = _ref[3];
    }

    Oauth2Provider.prototype._x_unifyDifferences = function() {
      this._x_bearer = 'Bearer';
      return this._x_accessToken = 'access_token';
    };

    Oauth2Provider.prototype.handlePOST = function() {
      var qs, url, _ref, _ref1;

      if ((_ref = this.options.method) === 'POST' || _ref === 'PUT') {
        _ref1 = authomatic.splitUrl(this.url), url = _ref1.url, qs = _ref1.qs;
        return this.params = $.extend(this.options.params, authomatic.parseQueryString(qs));
      }
    };

    Oauth2Provider.prototype.handleTokenType = function() {
      if (this.tokenType === '1') {
        return this.options.headers['Authorization'] = "" + this._x_bearer + " " + accessToken;
      } else {
        return this.options.params[this._x_accessToken] = this.accessToken;
      }
    };

    return Oauth2Provider;

  })(BaseProvider);

  OAuth2CrossDomainProvider = (function(_super) {
    __extends(OAuth2CrossDomainProvider, _super);

    function OAuth2CrossDomainProvider() {
      this.access = __bind(this.access, this);      _ref = OAuth2CrossDomainProvider.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    OAuth2CrossDomainProvider.prototype.access = function() {
      var requestElements;

      this.handlePOST();
      this.handleTokenType();
      requestElements = {
        url: this.url,
        method: this.options.method,
        params: this.options.params,
        headers: this.options.headers
      };
      return this.contactProvider(requestElements);
    };

    return OAuth2CrossDomainProvider;

  })(Oauth2Provider);

  OAuth2JsonpProvider = (function(_super) {
    __extends(OAuth2JsonpProvider, _super);

    function OAuth2JsonpProvider() {
      this.contactProvider = __bind(this.contactProvider, this);      _ref1 = OAuth2JsonpProvider.__super__.constructor.apply(this, arguments);
      return _ref1;
    }

    OAuth2JsonpProvider.prototype.contactProvider = function(requestElements) {
      var body, headers, method, params, url;

      url = requestElements.url, method = requestElements.method, params = requestElements.params, headers = requestElements.headers, body = requestElements.body;
      if (body) {
        params = authomatic.parseQueryString(body);
      }
      this.options.type = method;
      this.options.data = params;
      this.options.headers = headers;
      this.options.jsonpCallback = authomatic.addJsonpCallback(this.options.success);
      log("Contacting provider.", url, this.options);
      return $.ajax(url, this.options);
    };

    return OAuth2JsonpProvider;

  })(OAuth2CrossDomainProvider);

  window.pokus = function() {
    var fbCredentials, fbUrl, twCredentials, twGetOptions, twGetUrl, twPostOptions, twPostUrl;

    defaults.backend = 'http://authomatic.com:8080/login/';
    twCredentials = '5%0A1-5%0A1186245026-TI2YCrKLCsdXH7PeFE8zZPReKDSQ5BZxHzpjjel%0A1Xhim7w8N9rOs05WWC8rnwIzkSz1lCMMW9TSPLVtfk';
    twPostUrl = 'https://api.twitter.com/1.1/statuses/update.json';
    twPostOptions = {
      method: 'POST',
      params: {
        status: 'keket'
      },
      success: function(data, status, jqXHR) {
        return log('hura, podarilo sa:', data);
      }
    };
    twGetUrl = 'https://api.twitter.com/1.1/statuses/user_timeline.json';
    twGetOptions = {
      method: 'GET',
      params: {
        pokus: 'POKUS'
      },
      success: function(data, status, jqXHR) {
        return log('hura, podarilo sa:', data);
      }
    };
    fbUrl = 'https://graph.facebook.com/737583375/feed';
    fbCredentials = '15%0A2-5%0ABAAG3FAWiCwIBAJn0CKLOphV4meEbBvUcGcAXIN0z1Pv2JtCrziXlKvM99WX3p4YxI9oHC02ZCpsv7d3CZCsTMy9lqZAohaypwb3nGSKAscqngzFVTOULGLRd5ygXQYtqcka1iERfZAfZA8KQjx7Mps0izinhKyV0EGCJo1HhQcOjx1QYiCAEp%0A%0A1370766038%0A0';
    log('POKUS', parseUrl('http://example.com/foo/bar?a=1&b=2&c=3&b=4&d=%3F%2F%24%26'));
    return authomatic.access(twCredentials, 'https://api.twitter.com/1.1/statuses/user_timeline.json', {
      method: 'GET',
      params: {
        a: 'a',
        b: 'b'
      },
      success: function(data, status, jqXHR) {
        return log('Pokus 1:', data);
      }
    });
  };

  window.cb = function(data) {
    return console.log('CALLBACK', data);
  };

}).call(this);

/*
//@ sourceMappingURL=authomatic.map
*/