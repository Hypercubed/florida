'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.$identity = exports.$this = exports.$index = exports.not = exports.or = exports.and = exports.keys = undefined;

var _ramda = require('ramda');

var _ramda2 = _interopRequireDefault(_ramda);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var $$index = '$index';
var $$this = '$this';

var keys = FK;
var and = _ramda2.default.both;
var or = _ramda2.default.either;
var not = _ramda2.default.compliment;

var $identity = _ramda2.default.identity;
var $this = function $this() {
  return this;
};
var $index = function $index(d, i) {
  return i;
};

function prop(key) {
  if (_ramda2.default.isNil(key)) return $identity;
  if (typeof key === 'function') return function () {
    return key.apply(this, arguments);
  };
  if (key === $$index) return $index;
  if (key === $$this) return $this;
  if (typeof key === 'number') {
    return function (d) {
      return _ramda2.default.isNil(d) ? undefined : d[key];
    };
  }
  if (typeof key === 'string' && key.indexOf('.') === -1) {
    return function (d) {
      return _ramda2.default.isNil(d) ? undefined : d[key];
    };
  }

  var chain = Array.isArray(key) ? key : key.split('.');
  chain = chain.map(prop);
  return _ramda2.default.pipe.apply(null, chain);
}

function FK(key) {
  var _getter = prop(key);
  var _fn = {};

  _fn.get = function () {
    return _getter;
  };

  _fn.satisfies = function (_) {
    return _ramda2.default.pipe(_getter, _);
  };

  _fn.eq = function (_) {
    return _ramda2.default.pipe(_getter, _ramda2.default.equals(_));
  };
  // _fn.eq = _ => _fn.satisfies(R.equals(_));
  // _fn.eq = R.curry((v, o) => R.equals(v, _getter(o)));

  _fn.is = function (_) {
    return _ramda2.default.pipe(_getter, _ramda2.default.identical(_));
  };
  _fn.match = function (_) {
    return _ramda2.default.pipe(_getter, _ramda2.default.test(_));
  }; // rename test?

  _fn.gte = function (_) {
    return _ramda2.default.pipe(_getter, _ramda2.default.lte(_));
  }; // lte = flip(gte)
  _fn.lte = function (_) {
    return _ramda2.default.pipe(_getter, _ramda2.default.gte(_));
  }; // gte = flip(lte)
  _fn.gt = function (_) {
    return _ramda2.default.pipe(_getter, _ramda2.default.lt(_));
  }; // lt = flip(gt)
  _fn.lt = function (_) {
    return _ramda2.default.pipe(_getter, _ramda2.default.gt(_));
  }; // gt = flip(lt)

  _fn.type = function () {
    return _ramda2.default.pipe(_getter, _ramda2.default.type);
  };
  _fn.typeof = function (_) {
    return _ramda2.default.pipe(_getter, _ramda2.default.type, _ramda2.default.equals(_));
  };

  _fn.nil = function () {
    return _ramda2.default.pipe(_getter, _ramda2.default.isNil);
  };
  _fn.exists = function () {
    return _ramda2.default.pipe(_getter, _ramda2.default.isNil, _ramda2.default.not);
  };

  _fn.order = function (_) {
    return _ramda2.default.comparator(_ramda2.default.useWith(_, [_getter, _getter]));
  };

  _fn.asc = function () {
    return _fn.order(_ramda2.default.lt);
  };
  _fn.desc = function () {
    return _fn.order(_ramda2.default.gt);
  };

  _fn.both = function (a, b) {
    return _ramda2.default.both(_ramda2.default.pipe(_getter, a), _ramda2.default.pipe(_getter, b));
  };

  _fn.either = function (a, b) {
    return _ramda2.default.either(_ramda2.default.pipe(_getter, a), _ramda2.default.pipe(_getter, b));
  };

  _fn.between = function (a, b) {
    return _ramda2.default.both(_fn.gt(a), _fn.lt(b));
  };

  return _fn;
}

exports.keys = keys;
exports.and = and;
exports.or = or;
exports.not = not;
exports.$index = $index;
exports.$this = $this;
exports.$identity = $identity;