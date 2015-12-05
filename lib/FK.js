'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _ramda = require('ramda');

var _ramda2 = _interopRequireDefault(_ramda);

var compose = _ramda2['default'].compose;
// const _ = R.__;
var isNil = _ramda2['default'].isNil;

function prop(key) {
  if (isNil(key)) return _ramda2['default'].identity;
  if (typeof key === 'function') return function () {
    return key.apply(this, arguments);
  };
  if (key === '$index') return function (d, i) {
    return i;
  };
  if (key === '$this') return function () {
    return this;
  };
  if (typeof key === 'number') {
    return function (d) {
      return isNil(d) ? undefined : d[key];
    };
  }
  if (typeof key === 'string' && key.indexOf('.') === -1) {
    return function (d) {
      return isNil(d) ? undefined : d[key];
    };
  }

  var chain = Array.isArray(key) ? key : key.split('.');
  var f = prop(chain.shift());
  var g = prop(chain.join('.'));
  return compose(g, f);
}

function FK(key) {
  var _getter = prop(key);
  var _fn = _getter;

  _fn.get = _getter;

  _fn.eq = function (v) {
    return compose(_ramda2['default'].equals(v), _getter);
  };
  _fn.is = function (v) {
    return compose(_ramda2['default'].identical(v), _getter);
  };
  _fn.match = function (v) {
    return compose(_ramda2['default'].test(v), _getter);
  }; // rename test?

  _fn.gte = function (v) {
    return compose(_ramda2['default'].flip(_ramda2['default'].gte)(v), _getter);
  };
  _fn.lte = function (v) {
    return compose(_ramda2['default'].flip(_ramda2['default'].lte)(v), _getter);
  };
  _fn.gt = function (v) {
    return compose(_ramda2['default'].flip(_ramda2['default'].gt)(v), _getter);
  };
  _fn.lt = function (v) {
    return compose(_ramda2['default'].flip(_ramda2['default'].lt)(v), _getter);
  };

  _fn.type = function () {
    return compose(_ramda2['default'].type, _getter);
  };
  _fn['typeof'] = function (v) {
    return compose(_ramda2['default'].equals(v), _fn.type());
  };

  _fn.nil = function () {
    return compose(isNil, _getter);
  };
  _fn.exists = function () {
    return compose(_ramda2['default'].not, _fn.nil());
  };

  // const _fn_order = function (c) {  // todo compose
  //  return R.comparator(c);
  // };

  _fn.asc = _ramda2['default'].comparator(function (a, b) {
    return _getter(a) < _getter(b);
  });
  _fn.desc = _ramda2['default'].comparator(function (a, b) {
    return _getter(a) > _getter(b);
  });

  _fn.both = function (a, b) {
    return _ramda2['default'].both(compose(a, _getter), compose(b, _getter));
  };

  _fn.either = function (a, b) {
    return _ramda2['default'].either(compose(a, _getter), compose(b, _getter));
  };

  _fn.between = function (a, b) {
    return _ramda2['default'].both(_fn.gt(a), _fn.lt(b));
  };

  return _fn;
}

FK.and = _ramda2['default'].both;
FK.not = _ramda2['default'].compliment;
FK.or = _ramda2['default'].either;

exports['default'] = FK;
module.exports = exports['default'];