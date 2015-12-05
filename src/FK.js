
import R from 'ramda';

const compose = R.compose;
// const _ = R.__;
const isNil = R.isNil;

function prop (key) {
  if (isNil(key)) return R.identity;
  if (typeof key === 'function') return function () { return key.apply(this, arguments); };
  if (key === '$index') return (d, i) => i;
  if (key === '$this') return function () { return this; };
  if (typeof key === 'number') {
    return (d) => isNil(d) ? undefined : d[key];
  }
  if (typeof key === 'string' && key.indexOf('.') === -1) {
    return (d) => isNil(d) ? undefined : d[key];
  }

  var chain = (Array.isArray(key)) ? key : key.split('.');
  var f = prop(chain.shift());
  var g = prop(chain.join('.'));
  return compose(g, f);
}

function FK (key) {
  var _getter = prop(key);
  var _fn = _getter;

  _fn.get = _getter;

  _fn.eq = (v) => compose(R.equals(v), _getter);
  _fn.is = (v) => compose(R.identical(v), _getter);
  _fn.match = (v) => compose(R.test(v), _getter);  // rename test?

  _fn.gte = (v) => compose(R.flip(R.gte)(v), _getter);
  _fn.lte = (v) => compose(R.flip(R.lte)(v), _getter);
  _fn.gt = (v) => compose(R.flip(R.gt)(v), _getter);
  _fn.lt = (v) => compose(R.flip(R.lt)(v), _getter);

  _fn.type = () => compose(R.type, _getter);
  _fn.typeof = (v) => compose(R.equals(v), _fn.type());

  _fn.nil = () => compose(isNil, _getter);
  _fn.exists = () => compose(R.not, _fn.nil());

  // const _fn_order = function (c) {  // todo compose
  //  return R.comparator(c);
  // };

  _fn.asc = R.comparator((a, b) => _getter(a) < _getter(b));
  _fn.desc = R.comparator((a, b) => _getter(a) > _getter(b));

  _fn.both = (a, b) => {
    return R.both(compose(a, _getter), compose(b, _getter));
  };

  _fn.either = (a, b) => {
    return R.either(compose(a, _getter), compose(b, _getter));
  };

  _fn.between = (a, b) => R.both(_fn.gt(a), _fn.lt(b));

  return _fn;
}

FK.and = R.both;
FK.not = R.compliment;
FK.or = R.either;

export default FK;
