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

var _isNil = require('ramda/src/isNil');

var _isNil2 = _interopRequireDefault(_isNil);

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

// import compose from 'ramda/src/compose';

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
  if ((0, _isNil2.default)(key)) return _identity2.default;
  if (typeof key === 'function') return key;
  if (key === $$index) return $index;
  if (key === $$this) return $this;
  if (typeof key === 'number') {
    return function (d) {
      return (0, _isNil2.default)(d) ? undefined : d[key];
    };
  }
  if (typeof key === 'string' && key.indexOf('.') === -1) {
    return function (d) {
      return (0, _isNil2.default)(d) ? undefined : d[key];
    };
  }
  if (key.isFK) {
    return key.$;
  }

  var chain = Array.isArray(key) ? key : key.split('.');
  chain = chain.map(prop);
  return _pipe2.default.apply(null, chain);
}

function FK() {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  // if (this instanceof FK !== true) { return new FK(...args); }

  var _value = arguments.length > 1 ? prop(args) : prop(args[0]);

  /* function apply (thisArg, args) {
    var length = args ? args.length : 0;
    switch (length) {
      case 0: return _value.call(thisArg);
      case 1: return _value.call(thisArg, args[0]);
      case 2: return _value.call(thisArg, args[0], args[1]);
      case 3: return _value.call(thisArg, args[0], args[1], args[2]);
    }
    return _value.apply(thisArg, args);
  } */

  var pipeline = function pipeline() {
    for (var _len2 = arguments.length, f = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      f[_key2] = arguments[_key2];
    }

    return _pipe2.default.apply(undefined, [_value].concat(f));
  };

  var wrap = function wrap(f) {
    return function () {
      return pipeline(f.apply(undefined, arguments));
    };
  };

  var wrap0 = function wrap0() {
    for (var _len3 = arguments.length, f = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
      f[_key3] = arguments[_key3];
    }

    return function () {
      return pipeline.apply(undefined, f);
    };
  };

  return {
    value: _value,
    $: _value,
    extract: function extract() {
      return _value;
    },

    // fantasyland?
    of: FK, // Applicative
    map: function map(f) {
      return FK(f(_value));
    }, // Functor
    ap: function ap(b) {
      return FK(_value(b.value));
    }, // Apply
    chain: function chain(f) {
      return f(_value);
    }, // Chain
    // extend: f => FK(f(_value)),

    // composition
    andThen: function andThen(f) {
      return FK((0, _pipe2.default)(_value, prop(f)));
    },
    compose: function compose(b) {
      return FK((0, _pipe2.default)(prop(b), _value));
    },

    isFK: true,

    // values
    get: wrap(_defaultTo2.default),

    satisfies: pipeline,
    eq: wrap(_equals2.default),
    is: wrap(_identical2.default),
    match: wrap(_test2.default), // rename test?

    gte: wrap(_lte2.default), // lte = flip(gte)
    lte: wrap(_gte2.default), // gte = flip(lte)
    gt: wrap(_lt2.default), // lt = flip(gt)
    lt: wrap(_gt2.default), // gt = flip(lt)

    type: wrap0(_type2.default),
    typeof: function _typeof(_) {
      return pipeline(_type2.default, (0, _equals2.default)(_));
    },

    isNil: wrap0(_isNil2.default),
    exists: wrap0(_isNil2.default, _not2.default),

    order: function order(_) {
      return (0, _comparator2.default)((0, _useWith2.default)(_, [_value, _value]));
    },
    asc: function asc() {
      return (0, _comparator2.default)((0, _useWith2.default)(_lt2.default, [_value, _value]));
    },
    desc: function desc() {
      return (0, _comparator2.default)((0, _useWith2.default)(_gt2.default, [_value, _value]));
    },

    both: function both(a, b) {
      return (0, _both3.default)((0, _pipe2.default)(_value, a), (0, _pipe2.default)(_value, b));
    },
    either: function either(a, b) {
      return (0, _either3.default)((0, _pipe2.default)(_value, a), (0, _pipe2.default)(_value, b));
    },
    between: function between(a, b) {
      return (0, _both3.default)((0, _pipe2.default)(_value, (0, _lt2.default)(a)), (0, _pipe2.default)(_value, (0, _gt2.default)(b)));
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