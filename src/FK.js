// these are exported
import $identity from 'ramda/src/internal/_identity';

import and from 'ramda/src/both';
import or from 'ramda/src/either';
import not from 'ramda/src/complement';

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
  const $compose = (...f) => Rcompose($, ...f);
  const $pipe = (...f) => Rpipe($, ...f);
  const $wrap = f => (...v) => $pipe(f(...v));
  const $wrap0 = (...f) => () => $pipe(...f);

  // fantasyland
  // const of = FK.of;  // Applicative
  const map = fn => FK($pipe(prop(fn)));
  const ap = fk => FK(x => $(x)(fk.value(x)));    // Apply
  const chain = fn => FK(x => fn($(x)).value(x)); // Chain
  const extract = () => $;                        // Comonad
  // const extend = fn => FK(fn(fk));

  // composition
  const compose = fn => FK($compose(prop(fn)));

  // values
  const orElse = $wrap(RdefaultTo);

  const satisfies = $pipe;
  const eq = $wrap(Requals);
  const is = $wrap(Ridentical);
  const match = $wrap(Rtest);  // rename test?

  const gte = $wrap(Rlte); // lte = flip(gte)
  const lte = $wrap(Rgte);  // gte = flip(lte)
  const gt = $wrap(Rlt);  // lt = flip(gt)
  const lt = $wrap(Rgt);  // gt = flip(lt)

  const type = $wrap0(Rtype);
  const isTypeof = _ => $pipe(Rtype, Requals(_));

  const isNil = $wrap0(RisNil);
  const exists = $wrap0(RisNil, Rnot);

  // Sorting
  const order = (_) => Rcomparator(RuseWith(_, [$, $]));
  const asc = () => order(Rlt);
  const desc = () => order(Rgt);

  // comparator
  const both = (a, b) => and($pipe(a), $pipe(b));
  const either = (a, b) => or($pipe(a), $pipe(b));
  const between = (a, b) => both(Rlt(a), Rgt(b));

  return Object.freeze({
    $,
    [$$fk]: true,

    // fantasyland?
    value: $,
    of: FK.of,
    map,
    ap,
    chain,
    extract,
    // extend,

    // composition
    andThen: map,
    compose,

    // values
    orElse,

    satisfies,
    eq,
    is,
    match,

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

FK.of = x => FK(_ => x);
FK.and = and;
FK.or = or;
FK.not = not;

export default FK;

export {
  FK as keys,
  $index,
  $this,
  $identity
};
