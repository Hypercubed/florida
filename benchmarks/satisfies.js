'use strict';

import * as F from '../src/FK';
import _F from 'underline_f';
import assert from 'assert';

/**
 * Preparation code.
 */
const FK = F.keys;
const base = x => x.a.b === 123;
const obj = { a: { b: 123 } };

assert(obj.a.b === 123);

const fk_fn = FK(x => x.a.b).satisfies(x => x === 123);
const fk_key = FK('a.b').satisfies(x => x === 123);
const fk_array = FK(['a', 'b']).satisfies(x => x === 123);

const _f_fn = _F(x => x.a.b).eq(123);
const _f_key = _F('a.b').eq(123);

require('./suite')('satisfies')
  .add('FK; fn', () => {
    assert(fk_fn(obj) === true);
  })
  .add('FK; key', () => {
    assert(fk_key(obj) === true);
  })
  .add('FK; array', () => {
    assert(fk_array(obj) === true);
  })
  .add('_F; fn', () => {
    assert(_f_fn(obj) === true);
  })
  .add('_F; key', () => {
    assert(_f_key(obj) === true);
  })
  .add('base', () => {
    assert(base(obj) === true);
  })
  .run();
