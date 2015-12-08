import R from './rindex';

const $$index = '$index';
const $$this = '$this';

const keys = FK;
const and = R.both;
const or = R.either;
const not = R.compliment;

// const $noop = function () { };
// const $undef = function () { return; }
const $identity = R.identity;
const $this = function () { return this; };
const $index = (d, i) => i;

function prop (key) {
  if (R.isNil(key)) return $identity;
  if (typeof key === 'function') return key;
  if (key === $$index) return $index;
  if (key === $$this) return $this;
  if (typeof key === 'number') {
    return (d) => R.isNil(d) ? undefined : d[key];
  }
  if (typeof key === 'string' && key.indexOf('.') === -1) {
    return (d) => R.isNil(d) ? undefined : d[key];
  }

  var chain = (Array.isArray(key)) ? key : key.split('.');
  chain = chain.map(prop);
  return R.pipe.apply(null, chain);
}

function FK (...args) {
  var _getter = arguments.length > 1 ? prop(args) : prop(args[0]);

  return {
    get: () => _getter,

    satisfies: (_) => R.pipe(_getter, _),
    eq: (_) => R.pipe(_getter, R.equals(_)),
    is: (_) => R.pipe(_getter, R.identical(_)),
    match: (_) => R.pipe(_getter, R.test(_)),  // rename test?

    gte: (_) => R.pipe(_getter, R.lte(_)), // lte = flip(gte)
    lte: (_) => R.pipe(_getter, R.gte(_)),  // gte = flip(lte)
    gt: (_) => R.pipe(_getter, R.lt(_)),  // lt = flip(gt)
    lt: (_) => R.pipe(_getter, R.gt(_)),  // gt = flip(lt)

    type: () => R.pipe(_getter, R.type),
    typeof: (_) => R.pipe(_getter, R.type, R.equals(_)),

    nil: () => R.pipe(_getter, R.isNil),
    exists: () => R.pipe(_getter, R.isNil, R.not),

    order: (_) => R.comparator(R.useWith(_, [_getter, _getter])),

    asc: () => R.comparator(R.useWith(R.lt, [_getter, _getter])),
    desc: () => R.comparator(R.useWith(R.gt, [_getter, _getter])),

    both: (a, b) => {
      return R.both(R.pipe(_getter, a), R.pipe(_getter, b));
    },

    either: (a, b) => {
      return R.either(R.pipe(_getter, a), R.pipe(_getter, b));
    },

    between: (a, b) => R.both(R.pipe(_getter, R.lt(a)), R.pipe(_getter, R.gt(b)))
  };
}

export {
  keys,
  and,
  or,
  not,
  $index,
  $this,
  $identity
};
