import R from 'ramda';

const $$index = '$index';
const $$this = '$this';

const keys = FK;
const and = R.both;
const or = R.either;
const not = R.compliment;

const $identity = R.identity;
const $this = function () { return this; };
const $index = (d, i) => i;

function prop (key) {
  if (R.isNil(key)) return $identity;
  if (typeof key === 'function') return function () { return key.apply(this, arguments); };
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

function FK (key) {
  var _getter = prop(key);
  var _fn = {};

  _fn.get = () => _getter;

  _fn.satisfies = _ => R.pipe(_getter, _);

  _fn.eq = _ => R.pipe(_getter, R.equals(_));
  // _fn.eq = _ => _fn.satisfies(R.equals(_));
  // _fn.eq = R.curry((v, o) => R.equals(v, _getter(o)));

  _fn.is = _ => R.pipe(_getter, R.identical(_));
  _fn.match = _ => R.pipe(_getter, R.test(_));  // rename test?

  _fn.gte = _ => R.pipe(_getter, R.lte(_)); // lte = flip(gte)
  _fn.lte = _ => R.pipe(_getter, R.gte(_));  // gte = flip(lte)
  _fn.gt = _ => R.pipe(_getter, R.lt(_));  // lt = flip(gt)
  _fn.lt = _ => R.pipe(_getter, R.gt(_));  // gt = flip(lt)

  _fn.type = () => R.pipe(_getter, R.type);
  _fn.typeof = _ => R.pipe(_getter, R.type, R.equals(_));

  _fn.nil = () => R.pipe(_getter, R.isNil);
  _fn.exists = () => R.pipe(_getter, R.isNil, R.not);

  _fn.order = _ => R.comparator(R.useWith(_, [_getter, _getter]));

  _fn.asc = () => _fn.order(R.lt);
  _fn.desc = () => _fn.order(R.gt);

  _fn.both = (a, b) => {
    return R.both(R.pipe(_getter, a), R.pipe(_getter, b));
  };

  _fn.either = (a, b) => {
    return R.either(R.pipe(_getter, a), R.pipe(_getter, b));
  };

  _fn.between = (a, b) => R.both(_fn.gt(a), _fn.lt(b));

  return _fn;
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
