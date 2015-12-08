'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.$identity = exports.$this = exports.$index = exports.not = exports.or = exports.and = exports.keys = undefined;

var _rindex = require('./rindex');

var _rindex2 = _interopRequireDefault(_rindex);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var $$index = '$index';
var $$this = '$this';

var keys = FK;
var and = _rindex2.default.both;
var or = _rindex2.default.either;
var not = _rindex2.default.compliment;

// const $noop = function () { };
// const $undef = function () { return; }
var $identity = _rindex2.default.identity;
var $this = function $this() {
  return this;
};
var $index = function $index(d, i) {
  return i;
};

function prop(key) {
  if (_rindex2.default.isNil(key)) return $identity;
  if (typeof key === 'function') return key;
  if (key === $$index) return $index;
  if (key === $$this) return $this;
  if (typeof key === 'number') {
    return function (d) {
      return _rindex2.default.isNil(d) ? undefined : d[key];
    };
  }
  if (typeof key === 'string' && key.indexOf('.') === -1) {
    return function (d) {
      return _rindex2.default.isNil(d) ? undefined : d[key];
    };
  }

  var chain = Array.isArray(key) ? key : key.split('.');
  chain = chain.map(prop);
  return _rindex2.default.pipe.apply(null, chain);
}

function FK() {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  var _getter = arguments.length > 1 ? prop(args) : prop(args[0]);

  return {
    get: function get() {
      return _getter;
    },

    satisfies: function satisfies(_) {
      return _rindex2.default.pipe(_getter, _);
    },
    eq: function eq(_) {
      return _rindex2.default.pipe(_getter, _rindex2.default.equals(_));
    },
    is: function is(_) {
      return _rindex2.default.pipe(_getter, _rindex2.default.identical(_));
    },
    match: function match(_) {
      return _rindex2.default.pipe(_getter, _rindex2.default.test(_));
    }, // rename test?

    gte: function gte(_) {
      return _rindex2.default.pipe(_getter, _rindex2.default.lte(_));
    }, // lte = flip(gte)
    lte: function lte(_) {
      return _rindex2.default.pipe(_getter, _rindex2.default.gte(_));
    }, // gte = flip(lte)
    gt: function gt(_) {
      return _rindex2.default.pipe(_getter, _rindex2.default.lt(_));
    }, // lt = flip(gt)
    lt: function lt(_) {
      return _rindex2.default.pipe(_getter, _rindex2.default.gt(_));
    }, // gt = flip(lt)

    type: function type() {
      return _rindex2.default.pipe(_getter, _rindex2.default.type);
    },
    typeof: function _typeof(_) {
      return _rindex2.default.pipe(_getter, _rindex2.default.type, _rindex2.default.equals(_));
    },

    nil: function nil() {
      return _rindex2.default.pipe(_getter, _rindex2.default.isNil);
    },
    exists: function exists() {
      return _rindex2.default.pipe(_getter, _rindex2.default.isNil, _rindex2.default.not);
    },

    order: function order(_) {
      return _rindex2.default.comparator(_rindex2.default.useWith(_, [_getter, _getter]));
    },

    asc: function asc() {
      return _rindex2.default.comparator(_rindex2.default.useWith(_rindex2.default.lt, [_getter, _getter]));
    },
    desc: function desc() {
      return _rindex2.default.comparator(_rindex2.default.useWith(_rindex2.default.gt, [_getter, _getter]));
    },

    both: function both(a, b) {
      return _rindex2.default.both(_rindex2.default.pipe(_getter, a), _rindex2.default.pipe(_getter, b));
    },

    either: function either(a, b) {
      return _rindex2.default.either(_rindex2.default.pipe(_getter, a), _rindex2.default.pipe(_getter, b));
    },

    between: function between(a, b) {
      return _rindex2.default.both(_rindex2.default.pipe(_getter, _rindex2.default.lt(a)), _rindex2.default.pipe(_getter, _rindex2.default.gt(b)));
    }
  };
}

exports.keys = keys;
exports.and = and;
exports.or = or;
exports.not = not;
exports.$index = $index;
exports.$this = $this;
exports.$identity = $identity;