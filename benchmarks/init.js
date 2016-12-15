'use strict';

import * as F from '../src/FK';
import _F from 'underline_f';

/**
 * Preparation code.
 */
const FK = F.keys;
const noop = function () {};

require('./suite')('init')
  .add('FK', () => {
    FK();
  })
  .add('new FK', () => {
    new FK();
  })
  .add('FK; fn', () => {
    FK(x => x.a.b);
  })
  .add('FK; key', () => {
    FK('a.b');
  })
  .add('FK; array', () => {
    FK(['a', 'b']);
  })
  .add('_F', () => {
    _F();
  })
  .add('_F; key', () => {
    _F('a.b');
  })
  .add('noop', () => {
    noop();
  })
  .run();
