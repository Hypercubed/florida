'use strict';

import * as F from '../src/FK';
import _F from 'underline_f';
import assert from 'assert';

/**
 * Preparation code.
 */
const FK = F.keys;
const unsafeFK = F.unsafeKeys;
const base = x => x.a.b;
const obj = { a: { b: 123 } };

assert(obj.a.b === 123);

const fk_fn = FK(x => x.a.b).$;
const fk_key = FK('a.b').$;
const fk_array = FK(['a', 'b']).$;

const unsafe_fk_fn = unsafeFK(x => x.a.b).$;
const unsafe_fk_key = unsafeFK('a.b').$;
const unsafe_fk_array = unsafeFK(['a', 'b']).$;

const _f_fn = _F(x => x.a.b);
const _f_key = _F('a.b');

require('./suite')('getter')
  .add('base', () => {
    assert(base(obj) === 123);
  })
  .add('FK; fn', () => {
    assert(fk_fn(obj) === 123);
  })
  .add('FK; key', () => {
    assert(fk_key(obj) === 123);
  })
  .add('FK; array', () => {
    assert(fk_array(obj) === 123);
  })
  .add('unsafe_FK; fn', () => {
    assert(unsafe_fk_fn(obj) === 123);
  })
  .add('unsafe_FK; key', () => {
    assert(unsafe_fk_key(obj) === 123);
  })
  .add('unsafe_FK; array', () => {
    assert(unsafe_fk_array(obj) === 123);
  })
  .add('_F; fn', () => {
    assert(_f_fn(obj) === 123);
  })
  .add('_F; key', () => {
    assert(_f_key(obj) === 123);
  })
  .run();
