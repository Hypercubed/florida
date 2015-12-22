'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.$identity = exports.$this = exports.$index = exports.not = exports.or = exports.and = exports.keys = undefined;

var _identity = require('ramda/src/identity');

var _identity2 = _interopRequireDefault(_identity);

var _both2 = require('ramda/src/both');

var _both3 = _interopRequireDefault(_both2);

var _either2 = require('ramda/src/either');

var _either3 = _interopRequireDefault(_either2);

var _complement = require('ramda/src/complement');

var _complement2 = _interopRequireDefault(_complement);

var _isNil2 = require('ramda/src/isNil');

var _isNil3 = _interopRequireDefault(_isNil2);

var _pipe = require('ramda/src/pipe');

var _pipe2 = _interopRequireDefault(_pipe);

var _equals = require('ramda/src/equals');

var _equals2 = _interopRequireDefault(_equals);

var _identical = require('ramda/src/identical');

var _identical2 = _interopRequireDefault(_identical);

var _test = require('ramda/src/test');

var _test2 = _interopRequireDefault(_test);

var _lte = require('ramda/src/lte');

var _lte2 = _interopRequireDefault(_lte);

var _gte = require('ramda/src/gte');

var _gte2 = _interopRequireDefault(_gte);

var _lt = require('ramda/src/lt');

var _lt2 = _interopRequireDefault(_lt);

var _gt = require('ramda/src/gt');

var _gt2 = _interopRequireDefault(_gt);

var _type = require('ramda/src/type');

var _type2 = _interopRequireDefault(_type);

var _comparator = require('ramda/src/comparator');

var _comparator2 = _interopRequireDefault(_comparator);

var _useWith = require('ramda/src/useWith');

var _useWith2 = _interopRequireDefault(_useWith);

var _not = require('ramda/src/not');

var _not2 = _interopRequireDefault(_not);

var _defaultTo = require('ramda/src/defaultTo');

var _defaultTo2 = _interopRequireDefault(_defaultTo);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// constants

// these are internal
// these are exported
var $$index = '$index';
var $$this = '$this';

// exported getters
var $this = function $this() {
  return this;
};
var $index = function $index(d, i) {
  return i;
};

function prop(key) {
  if ((0, _isNil3.default)(key)) return _identity2.default;
  if (typeof key === 'function') return key;
  if (key === $$index) return $index;
  if (key === $$this) return $this;
  if (typeof key === 'number') {
    return function (d) {
      return (0, _isNil3.default)(d) ? undefined : d[key];
    };
  }
  if (typeof key === 'string' && key.indexOf('.') === -1) {
    return function (d) {
      return (0, _isNil3.default)(d) ? undefined : d[key];
    };
  }

  var chain = Array.isArray(key) ? key : key.split('.');
  chain = chain.map(prop);
  return _pipe2.default.apply(null, chain);
}

function FK() {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  var _getter = arguments.length > 1 ? prop(args) : prop(args[0]);
  var S = function S(_) {
    return (0, _pipe2.default)(_getter, _);
  };

  return {
    get: function get(_) {
      return S((0, _defaultTo2.default)(_));
    },

    satisfies: S,
    eq: function eq(_) {
      return S((0, _equals2.default)(_));
    },
    is: function is(_) {
      return S((0, _identical2.default)(_));
    },
    match: function match(_) {
      return S((0, _test2.default)(_));
    }, // rename test?

    gte: function gte(_) {
      return S((0, _lte2.default)(_));
    }, // lte = flip(gte)
    lte: function lte(_) {
      return S((0, _gte2.default)(_));
    }, // gte = flip(lte)
    gt: function gt(_) {
      return S((0, _lt2.default)(_));
    }, // lt = flip(gt)
    lt: function lt(_) {
      return S((0, _gt2.default)(_));
    }, // gt = flip(lt)

    type: function type() {
      return S(_type2.default);
    },
    typeof: function _typeof(_) {
      return (0, _pipe2.default)(_getter, _type2.default, (0, _equals2.default)(_));
    },

    isNil: function isNil() {
      return S(_isNil3.default);
    },
    exists: function exists() {
      return (0, _pipe2.default)(_getter, _isNil3.default, _not2.default);
    },

    order: function order(_) {
      return (0, _comparator2.default)((0, _useWith2.default)(_, [_getter, _getter]));
    },
    asc: function asc() {
      return (0, _comparator2.default)((0, _useWith2.default)(_lt2.default, [_getter, _getter]));
    },
    desc: function desc() {
      return (0, _comparator2.default)((0, _useWith2.default)(_gt2.default, [_getter, _getter]));
    },

    both: function both(a, b) {
      return (0, _both3.default)(S(a), S(b));
    },
    either: function either(a, b) {
      return (0, _either3.default)(S(a), S(b));
    },
    between: function between(a, b) {
      return (0, _both3.default)(S((0, _lt2.default)(a)), S((0, _gt2.default)(b)));
    }
  };
}

exports.keys = FK;
exports.and = _both3.default;
exports.or = _either3.default;
exports.not = _complement2.default;
exports.$index = $index;
exports.$this = $this;
exports.$identity = _identity2.default;