// these are exported
import $identity from 'ramda/src/identity';
import both from 'ramda/src/both';
import either from 'ramda/src/either';
import complement from 'ramda/src/complement';

// these are internal
import isNil from 'ramda/src/isNil';
import pipe from 'ramda/src/pipe';
import equals from 'ramda/src/equals';
import identical from 'ramda/src/identical';
import test from 'ramda/src/test';
import lte from 'ramda/src/lte';
import gte from 'ramda/src/gte';
import lt from 'ramda/src/lt';
import gt from 'ramda/src/gt';
import type from 'ramda/src/type';
import comparator from 'ramda/src/comparator';
import useWith from 'ramda/src/useWith';
import not from 'ramda/src/not';
import defaultTo from 'ramda/src/defaultTo';
// import curry from 'ramda/src/curry';

// constants
const $$index = '$index';
const $$this = '$this';

// exported getters
const $this = function () { return this; };
const $index = (d, i) => i;

function prop (key) {
  if (isNil(key)) return $identity;
  if (typeof key === 'function') return key;
  if (key === $$index) return $index;
  if (key === $$this) return $this;
  if (typeof key === 'number') {
    return (d) => isNil(d) ? undefined : d[key];
  }
  if (typeof key === 'string' && key.indexOf('.') === -1) {
    return (d) => isNil(d) ? undefined : d[key];
  }

  var chain = (Array.isArray(key)) ? key : key.split('.');
  chain = chain.map(prop);
  return pipe.apply(null, chain);
}

function FK (...args) {
  const _getter = arguments.length > 1 ? prop(args) : prop(args[0]);

  /* function apply (thisArg, args) {
    var length = args ? args.length : 0;
    switch (length) {
      case 0: return _getter.call(thisArg);
      case 1: return _getter.call(thisArg, args[0]);
      case 2: return _getter.call(thisArg, args[0], args[1]);
      case 3: return _getter.call(thisArg, args[0], args[1], args[2]);
    }
    return _getter.apply(thisArg, args);
  } */

  const wrapper = (_) => function () {
    return _(_getter.apply(this, arguments));
  };

  const wrap = (f) => {
    return (_) => wrapper(f(_));
  };

  const wrap0 = (f) => {
    return () => wrapper(f);
  };

  return {
    get: wrap(defaultTo),

    satisfies: wrapper,
    eq: wrap(equals),
    is: wrap(identical),
    match: wrap(test),  // rename test?

    gte: wrap(lte), // lte = flip(gte)
    lte: wrap(gte),  // gte = flip(lte)
    gt: wrap(lt),  // lt = flip(gt)
    lt: wrap(gt),  // gt = flip(lt)

    type: wrap0(type),
    typeof: (_) => pipe(_getter, type, equals(_)),

    isNil: wrap0(isNil),
    exists: wrap0(pipe(isNil, not)),

    order: (_) => comparator(useWith(_, [_getter, _getter])),
    asc: () => comparator(useWith(lt, [_getter, _getter])),
    desc: () => comparator(useWith(gt, [_getter, _getter])),

    both: (a, b) => both(pipe(_getter, a), pipe(_getter, b)),
    either: (a, b) => either(pipe(_getter, a), pipe(_getter, b)),
    between: (a, b) => both(pipe(_getter, lt(a)), pipe(_getter, gt(b)))
  };
}

export {
  FK as keys,
  both as and,
  either as or,
  complement as not,
  $index,
  $this,
  $identity
};
