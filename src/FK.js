// these are exported
import $identity from 'ramda/src/internal/_identity';

import Rboth from 'ramda/src/both';
import Reither from 'ramda/src/either';
import Rcomplement from 'ramda/src/complement';

// these are internal
import RisNil from 'ramda/src/isNil';
import Rpipe from 'ramda/src/pipe';
import Requals from 'ramda/src/equals';
import Ridentical from 'ramda/src/identical';
import Rtest from 'ramda/src/test';
import Rlte from 'ramda/src/lte';
import Rgte from 'ramda/src/gte';
import Rlt from 'ramda/src/lt';
import Rgt from 'ramda/src/gt';
import Rtype from 'ramda/src/type';
import Rcomparator from 'ramda/src/comparator';
import RuseWith from 'ramda/src/useWith';
import Rnot from 'ramda/src/not';
import RdefaultTo from 'ramda/src/defaultTo';
import Rcompose from 'ramda/src/compose';

// constants
const $$index = '$index';
const $$this = '$this';
const $$fk = '@@FK';

// exported getters
const $this = function () { return this; };
const $index = (d, i) => i;

function prop (key) {
  if (RisNil(key)) return $identity;
  if (typeof key === 'function') return key;
  if (key === $$index) return $index;
  if (key === $$this) return $this;
  if (typeof key === 'number') {
    return (d) => RisNil(d) ? undefined : d[key];
  }
  if (typeof key === 'string' && key.indexOf('.') === -1) {
    return (d) => RisNil(d) ? undefined : d[key];
  }
  if (key.$ && key[$$fk]) {
    return key.$;
  }

  var chain = (Array.isArray(key)) ? key : key.split('.');
  chain = chain.map(prop);
  return Rpipe.apply(null, chain);
}

function FK (...args) {
  const $ = arguments.length > 1 ? prop(args) : prop(args[0]);

  // utilities
  const $pipe = f => v => function () {
    return f(v).call(this, $.apply(this, arguments));
  };

  // fantasyland
  const of = FK.of;                               // Applicative
  const chain = f => FK(x => f($(x)).value(x));   // Chain
  const map = f => chain(a => FK.of(prop(f)(a))); // FK($pipe(prop(fn)));          // Functor
  const ap = a => chain(f => a.map(f));           // fk => FK(x => $(x)(fk.value(x)));    // Apply
  const extend = f => FK(f(FK($)));               // Extend
  const extract = () => $;                        // Comonad

  // const traverse = (f, p) => f($).map(FK.of);
  // const sequence = (p) => traverse($identity, p);  // () => f($).map(FK.of)

  // composition
  const compose = fn => FK(Rcompose($, prop(fn)));

  // values
  const orElse = v => Rpipe($, RdefaultTo(v));

  const satisfies = f => Rpipe($, f);
  const eq = v => Rpipe($, Requals(v));
  const is = v => Rpipe($, Ridentical(v));
  const match = v => Rpipe($, Rtest(v));  // rename test?

  const and = (...f) => Rboth($, prop(f));
  const or = (...f) => Reither($, prop(f));
  const not = () => Rcomplement($);

  const gte = $pipe(Rlte); // lte = flip(gte)
  const lte = v => Rpipe($, Rgte(v));  // gte = flip(lte)
  const gt = v => Rpipe($, Rlt(v));  // lt = flip(gt)
  const lt = v => Rpipe($, Rgt(v));  // gt = flip(lt)

  const type = () => Rpipe($, Rtype);
  const isTypeof = v => Rpipe($, Rtype, Requals(v));

  const isNil = () => Rpipe($, RisNil);
  const exists = () => Rpipe($, RisNil, Rnot);

  // Sorting
  const order = (_) => Rcomparator(RuseWith(_, [$, $]));
  const asc = () => order(Rlt);
  const desc = () => order(Rgt);

  // comparator
  const both = (a, b) => Rboth(satisfies(a), satisfies(b));
  const either = (a, b) => Reither(satisfies(a), satisfies(b));
  const between = (a, b) => both(Rlt(a), Rgt(b));

  return Object.freeze({
    $,
    [$$fk]: true,

    // fantasyland?
    value: $,
    of: of,
    map,
    ap,
    chain,
    extend,
    extract,

    // composition
    andThen: map,
    compose,

    // values
    orElse,

    satisfies,
    eq,
    is,
    match,

    and,
    or,
    not,

    gte,
    lte,
    gt,
    lt,

    type,
    typeof: isTypeof,

    isNil,
    exists,

    order,
    asc,
    desc,

    both,
    either,
    between
  });
}

FK.ask = FK();
FK.of = x => FK(_ => x);
FK.and = Rboth;
FK.or = Reither;
FK.not = Rcomplement;

export function unsafeKeys (...args) {
  var fk = FK.apply(null, args);
  return Object.assign(fk.$, fk);
}

Object.assign(unsafeKeys, FK);

export default FK;

export {
  FK as keys,
  $index,
  $this,
  $identity
};
