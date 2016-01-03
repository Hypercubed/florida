'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.$identity = exports.$this = exports.$index = exports.keys = undefined;

var _identity = require('ramda/src/internal/_identity');

var _identity2 = _interopRequireDefault(_identity);

var _both = require('ramda/src/both');

var _both2 = _interopRequireDefault(_both);

var _either = require('ramda/src/either');

var _either2 = _interopRequireDefault(_either);

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

var _compose = require('ramda/src/compose');

var _compose2 = _interopRequireDefault(_compose);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; } // these are exported

// these are internal

// constants
var $$index = '$index';
var $$this = '$this';
var $$fk = '@@FK';

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
  if (key.$ && key[$$fk]) {
    return key.$;
  }

  var chain = Array.isArray(key) ? key : key.split('.');
  chain = chain.map(prop);
  return _pipe2.default.apply(null, chain);
}

function FK() {
  var _Object$freeze;

  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  var $ = arguments.length > 1 ? prop(args) : prop(args[0]);

  // utilities
  var $compose = function $compose() {
    for (var _len2 = arguments.length, f = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      f[_key2] = arguments[_key2];
    }

    return _compose2.default.apply(undefined, [$].concat(f));
  };
  var $pipe = function $pipe() {
    for (var _len3 = arguments.length, f = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
      f[_key3] = arguments[_key3];
    }

    return _pipe2.default.apply(undefined, [$].concat(f));
  };
  var $wrap = function $wrap(f) {
    return function () {
      return $pipe(f.apply(undefined, arguments));
    };
  };
  var $wrap0 = function $wrap0() {
    for (var _len4 = arguments.length, f = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
      f[_key4] = arguments[_key4];
    }

    return function () {
      return $pipe.apply(undefined, f);
    };
  };

  // fantasyland
  // const of = FK.of;  // Applicative
  var map = function map(fn) {
    return FK($pipe(prop(fn)));
  };
  var ap = function ap(fk) {
    return FK(function (x) {
      return $(x)(fk.value(x));
    });
  }; // Apply
  var chain = function chain(fn) {
    return FK(function (x) {
      return fn($(x)).value(x);
    });
  }; // Chain
  var extract = function extract() {
    return $;
  }; // Comonad
  // const extend = fn => FK(fn(fk));

  // composition
  var compose = function compose(fn) {
    return FK($compose(prop(fn)));
  };

  // values
  var orElse = $wrap(_defaultTo2.default);

  var satisfies = $pipe;
  var eq = $wrap(_equals2.default);
  var is = $wrap(_identical2.default);
  var match = $wrap(_test2.default); // rename test?

  var gte = $wrap(_lte2.default); // lte = flip(gte)
  var lte = $wrap(_gte2.default); // gte = flip(lte)
  var gt = $wrap(_lt2.default); // lt = flip(gt)
  var lt = $wrap(_gt2.default); // gt = flip(lt)

  var type = $wrap0(_type2.default);
  var isTypeof = function isTypeof(_) {
    return $pipe(_type2.default, (0, _equals2.default)(_));
  };

  var isNil = $wrap0(_isNil2.default);
  var exists = $wrap0(_isNil2.default, _not2.default);

  // Sorting
  var order = function order(_) {
    return (0, _comparator2.default)((0, _useWith2.default)(_, [$, $]));
  };
  var asc = function asc() {
    return order(_lt2.default);
  };
  var desc = function desc() {
    return order(_gt2.default);
  };

  // comparator
  var both = function both(a, b) {
    return (0, _both2.default)($pipe(a), $pipe(b));
  };
  var either = function either(a, b) {
    return (0, _either2.default)($pipe(a), $pipe(b));
  };
  var between = function between(a, b) {
    return both((0, _lt2.default)(a), (0, _gt2.default)(b));
  };

  return Object.freeze((_Object$freeze = {
    $: $
  }, _defineProperty(_Object$freeze, $$fk, true), _defineProperty(_Object$freeze, 'value', $), _defineProperty(_Object$freeze, 'of', FK.of), _defineProperty(_Object$freeze, 'map', map), _defineProperty(_Object$freeze, 'ap', ap), _defineProperty(_Object$freeze, 'chain', chain), _defineProperty(_Object$freeze, 'extract', extract), _defineProperty(_Object$freeze, 'andThen', map), _defineProperty(_Object$freeze, 'compose', compose), _defineProperty(_Object$freeze, 'orElse',

  // values
  orElse), _defineProperty(_Object$freeze, 'satisfies', satisfies), _defineProperty(_Object$freeze, 'eq', eq), _defineProperty(_Object$freeze, 'is', is), _defineProperty(_Object$freeze, 'match', match), _defineProperty(_Object$freeze, 'gte', gte), _defineProperty(_Object$freeze, 'lte', lte), _defineProperty(_Object$freeze, 'gt', gt), _defineProperty(_Object$freeze, 'lt', lt), _defineProperty(_Object$freeze, 'type', type), _defineProperty(_Object$freeze, 'typeof', isTypeof), _defineProperty(_Object$freeze, 'isNil', isNil), _defineProperty(_Object$freeze, 'exists', exists), _defineProperty(_Object$freeze, 'order', order), _defineProperty(_Object$freeze, 'asc', asc), _defineProperty(_Object$freeze, 'desc', desc), _defineProperty(_Object$freeze, 'both', both), _defineProperty(_Object$freeze, 'either', either), _defineProperty(_Object$freeze, 'between', between), _Object$freeze));
}

FK.of = function (x) {
  return FK(function (_) {
    return x;
  });
};
FK.and = _both2.default;
FK.or = _either2.default;
FK.not = _complement2.default;

exports.default = FK;
exports.keys = FK;
exports.$index = $index;
exports.$this = $this;
exports.$identity = _identity2.default;