import test from 'tape';
import * as F from '../src/FK';
const FK = F.keys;

import R from 'ramda';

const rows = [
  [1977, 0],      // 0
  [1978, 0],
  [1979, 0],
  [1980, 43.7],
  [1981, 38.47],
  [1982, 26.87],
  [1983, 21.16],
  [1984, 14.88],
  [1985, 11.31],
  [1986, 13.51],
  [1987, 12.99],  // 10
  [1988, 13.13],
  [1989, 13.84],
  [1990, 8.89],
  [1991, 8.89],
  [1992, 5.65],
  [1993, 3.06],
  [1994, 3.35],
  [1995, 6.04],
  [1996, 6.32],
  [1997, 5.64],  // 20
  [1998, 4.71],
  [1999, 4.61],
  [2000, 3.96],
  [2001, 2.64],
  [2002, 2.34],
  [2003, 2],
  [2004, 2.28],
  [2005, 2.69]  // 28
];

const data = rows.map((d) => {
  return {
    year: +d[0],
    value: +d[1]
  };
});

const people = [
  { firstname: 'John', lastname: 'Smith', age: 51 },
  { firstname: 'John', lastname: 'Hawley', age: 16 },
  { firstname: 'Janet', lastname: 'Howell', age: 23 },
  { firstname: 'John', lastname: 'Jones', age: 29 },
  { firstname: 'John', lastname: 'Hernandez', age: 22 },
  { firstname: 'Maurice', lastname: 'Hall', age: 22 }
];

const place = {
  name: 'Whitehouse',
  location: {
    number: 1600,
    street: 'Pennsylvania Avenue',
    postcode: 20006
  }
};

test('map?', function (t) {
  var location = FK('location');
  var number = FK('number');
  var value = location.map(f => R.pipe(f, number.$)).$(place);

  t.equal(value, 1600);
  t.end();
});

/* test('ap?', function (t) {
  var location = FK('location');
  var number = FK('number');
  var value = location.ap(place);

  t.equal(value, 1600);
  t.end();
}); */

test('chain?', function (t) {
  var location = FK('location');
  var number = FK('number');
  var value = location.andThen(number).chain(x => x)(place);

  t.equal(value, 1600);
  t.end();
});

test('andThen', function (t) {
  var location = FK('location');
  var number = FK('number');
  var value = location.andThen(number).$(place);

  t.equal(value, 1600);
  t.end();
});

test('compose', function (t) {
  var location = FK('location');
  var number = FK('number');
  var value = number.compose(location).$(place);

  t.equal(value, 1600);
  t.end();
});

var calender = [{ event: { date: { year: 1990 } } }];

const newDate = (d) => {
  newDate.called++;
  return +d;
};

const d3_number = (x) => x !== null && !isNaN(x);

/* istanbul ignore next */
function d3_mean (array, f) {
  var s = 0;
  var n = array.length;
  var a;
  var i = -1;
  var j = n;
  if (arguments.length === 1) {
    while (++i < n) if (d3_number(a = array[i])) s += a; else --j;
  } else {
    while (++i < n) if (d3_number(a = f.call(array, array[i], i))) s += a; else --j;
  }
  return j ? s / j : undefined;
}

test('FK', (t) => {
  t.test('example', (t) => {
    t.test('should run', (t) => {
      var _firstname = FK('firstname');
      var _age = FK('age');
      var _johns = _firstname.eq('John');
      var _twenties = F.and(_age.gte(20), _age.lt(30)); // _age.gte(20).and().lt(30);

      t.deepEqual(people.map(_firstname.$), ['John', 'John', 'Janet', 'John', 'John', 'Maurice']);  // Returns a list of first names
      t.equal(people.filter(_johns).length, 4);  // returns a list of John's
      t.equal(people.filter(_twenties).length, 4);  // returns a list of johns in their twenties
      t.equal(people.filter(F.and(_johns, _twenties)).length, 2);  // returns a list of johns in their twenties

      var f = people.filter(F.and(_johns, _twenties)).sort(_age.asc()); // .sort(_age.order().asc);  // returns a list of John's in their twenties sorted by age
      t.equal(f.length, 2);
      t.equal(f[0].age, 22);
      t.equal(f[1].age, 29);

      t.end();
    });
  });

  t.test('FK()', (t) => {
    t.test('should be a function', (t) => {
      t.equal(typeof FK, 'function');
      t.end();
    });

    t.test('should be invokable', (t) => {
      t.equal(typeof FK(), 'object', 'can be invoked with "new"');
      t.equal(typeof new FK(), 'object', 'can be invoked without "new"');
      // t.ok(FK() instanceof FK);
      // t.ok(new FK() instanceof FK);
      t.end();
    });
  });

  t.test('implement the Functor specification, #map', (t) => {
    t.test('should implement map method', (t) => {
      var f = FK();
      t.equal(typeof f.map, 'function', 'A value which has a Functor must provide a map method.');
      t.end();
    });

    t.test('should compose accessor function', (t) => {
      var f = FK('year').andThen(String);
      t.equal(f.$(data[0]), '1977');
      t.end();
    });

    /* t.test('should work with deep nested data', (t) => {
      var data = calender[0];
      var f = FK('event').map('date').map('year');
      t.equal(f.$(data), 1990);
      t.end();
    }); */

    t.test('identity', (t) => {
      var data = calender[0];
      var f = FK('event.date.year');
      t.equal(f.$(data), 1990);
      t.equal(f.map(a => a).$(data[0]), f.$(data[0]));
      t.end();
    });

    t.test('composition', (t) => {
      var data = calender[0];
      var g = d => 1;
      var f = d => 2;
      var F = FK('event');
      var f1 = F.map(g).map(f);
      var f2 = F.map(x => f(g(x)));

      // t.deepEqual(f1.$(data), 1990);
      t.deepEqual(f1.$(data), f2.$(data));
      t.end();
    });
  });

  t.test('implement the Apply specification, #ap', (t) => {
    t.test('should implement ap method', (t) => {
      var data = calender[0].event;
      var a = FK('date');
      var b = FK('year');
      t.equal(typeof a.ap, 'function', 'A value which has a Apply must provide a ap method.');
      // t.equal(b.ap(a).$(data), 1990);
      t.end();
    });

    /* t.test('should compose accessor function', (t) => {
      var f = FK('year');
      t.deepEqual(f.ap(data)[0], 1977);
      t.deepEqual(f.ap(data), data.map(f.$));
      t.end();
    }); */

    /* t.test('composition', (t) => {
      var data = { event: { year: 1990 } };
      var v = [data];
      var a = FK('year');
      var u = FK('event');

      t.deepEqual(a.ap(u.ap(v)), [1990]);
      t.deepEqual(a.map(f => g => x => f(g(x))).ap(u).ap(v), [1990]);
      t.end();
    }); */
  });

  t.test('implement the Applicative specification, #of', (t) => {
    t.test('should implement of method', (t) => {
      var a = FK();
      t.equal(typeof a.ap, 'function', 'A value which has a Applicative must provide a of method.');
      t.end();
    });

    t.test('should compose accessor function', (t) => {
      var f = FK().of(FK.$identity);
      t.equal(typeof f, 'object');
      // t.ok(f instanceof FK);
      t.equal(typeof f.$, 'function');
      t.end();
    });

    /* t.test('identity', (t) => {
      var a = FK();
      t.deepEqual(a.of(FK.$identity).ap([123]), [123]);
      t.end();
    }); */

    /* t.test('homomorphism', (t) => {
      var data = { date: { year: 1990 } };

      var a = FK();
      var f = _ => 'date.' + _;
      var x = 'year';

      // console.log(a.of(f(x)).$(data));
      // process.exit();
      t.equal(a.of(f(x)).$(data), 1990);
      t.equal(a.of(f).ap(a.of(x)).$(data), 1990);
      t.end();
    }); */
  });

  t.test('implement the Chain specification, #chain', (t) => {
    t.test('should implement chain method', (t) => {
      var data = { year: 1990 };
      var f = _ => 1;
      var m = FK('year');
      var a = m.chain(f);

      t.equal(typeof m.chain, 'function', 'A value which has a Chain must provide a chain method.');
      // t.equal(typeof a, 'function', 'chain must return a value of the same Chain');
      // t.equal(a(data), 1991);

      t.end();
    });
  });

  /* t.test('implement the Monad specification', (t) => {
    t.test('should implement chain method', (t) => {
      var m = FK();
      var a = 'a';

      console.log(m.of(a).$({a: 123}));

      process.exit();
      t.end();
    });
  }); */

  t.test('#get', (t) => {
    t.test('should return identity function', (t) => {
      var f = FK();
      t.equal(f.$(5), 5);
      t.end();
    });

    t.test('should return identity function when passsed null', (t) => {
      var f = FK(null);
      t.equal(f.$(5), 5);
      t.end();
    });

    t.test('should return an accessor function', (t) => {
      var f = FK('year');
      t.equal(f.$(data[0]), 1977);
      t.end();
    });

    t.test('should compose accessor function', (t) => {
      var f = FK(['year', String]);
      t.equal(f.$(data[0]), '1977');
      t.end();
    });

    t.test('should compose accessor function', (t) => {
      var f = FK('year', String);
      t.equal(f.$(data[0]), '1977');
      t.end();
    });

    t.test('should return an accessor function', (t) => {
      var f = FK(d => d.year);
      t.equal(f.$(data[0]), 1977);
      t.end();
    });

    t.test('should return an index accessor function', (t) => {
      var f = FK('$index');

      t.equal(data.map(f.$).length, data.length);
      t.equal(data.map(f.$)[0], 0);
      t.equal(data.map(f.$)[5], 5);
      t.end();
    });

    t.test('should return an index accessor function', (t) => {
      var f = F.$index;

      t.equal(data.map(f).length, data.length);
      t.equal(data.map(f)[0], 0);
      t.equal(data.map(f)[5], 5);
      t.end();
    });

    t.test('should have access to this', (t) => {
      var f = FK(function (d) {
        return this.name;
      });

      var _this = { name: 'thisName' };
      t.equal(data.map(f.$, _this).length, data.length);

      t.equal(data.map(f.$, _this)[0], 'thisName');
      t.equal(data.map(f.$, _this)[5], 'thisName');
      t.end();
    });

    t.test('should return a this accessor function', (t) => {
      var f = FK('$this');

      var _this = { name: 'thisName' };
      t.equal(data.map(f.$, _this)[0], _this);
      t.equal(data.map(f.$, _this)[5], _this);
      t.end();
    });

    t.test('should return a this accessor function', (t) => {
      var f = F.$this;

      var _this = { name: 'thisName' };
      t.equal(data.map(f, _this)[0], _this);
      t.equal(data.map(f, _this)[5], _this);
      t.end();
    });

    /* t.test('should work with nested data', (t) => {
      var data = { 'date': { 'year': 1990 } };
      var f = FK('date', FK('year'));
      t.equal(f.get(data), data.date.year);
      t.end();
    }); */

    t.test('should work with nested data, with chained keys', (t) => {
      var data = calender[0].event;
      t.equal(FK('date.year').$(data), data.date.year);
      t.end();
    });

    t.test('should work with nested data, with chained keys in array', (t) => {
      var data = calender[0].event;
      t.equal(FK(['date', 'year']).$(data), 1990);
      t.end();
    });

    t.test('should work with nested data, with chained keys in array', (t) => {
      var data = { date: { year: 1990 } };
      t.equal(FK('date', 'year').$(data), 1990);
      t.end();
    });

    t.test('should work with nested data, with chained keys in array', (t) => {
      var data = calender[0].event;
      t.equal(FK(['date', d => d.year]).$(data), 1990);
      t.end();
    });

    t.test('should work with deep nested data', (t) => {
      var data = calender[0];
      t.equal(FK('event.date.year').$(data), 1990);
      t.end();
    });

    t.test('should work with very deep nested data', (t) => {
      var data = { events: calender };
      t.equal(FK(['events', 0, 'event.date.year']).$(data), 1990);
      t.end();
    });

    t.test('should return undefined with missing key very deep nested data', (t) => {
      var data = { events: calender };
      t.equal(FK(['events', 1, 'event.date.year']).$(data), undefined);
      t.end();
    });

    t.test('should return undefined with missing key very deep nested data', (t) => {
      var data = { events: [ { event: { date: { year: 1990 } } } ] };
      t.equal(FK('events', 1, 'event.date.year').$(data), undefined);
      t.end();
    });

    t.test('should work with numeric keys', (t) => {
      var _secondElement = FK(1);
      t.equal(_secondElement.$([1978, 0]), 0);
      t.deepEqual(_secondElement.$(rows), [1978, 0]);
      t.equal(_secondElement.eq(rows[0])(rows), false);
      t.equal(_secondElement.eq(rows[1])(rows), true);
      t.end();
    });

    t.test('should work with numeric keys, including zero', (t) => {
      var _firstElement = FK(0);
      t.equal(_firstElement.$([1977, 0]), 1977);
      t.deepEqual(_firstElement.$(rows), [1977, 0]);
      t.equal(_firstElement.eq(1977)([1977, 0]), true);
      t.equal(_firstElement.eq(0)([1977, 0]), false);
      t.end();
    });

    t.test('should work with numeric keys, returns undefined if out of bounds', (t) => {
      var _missingElement = FK(rows.length);
      t.equal(_missingElement.$(rows), undefined);
      t.end();
    });

    t.test('should return undefined with missing key', (t) => {
      var data = calender[0].event;
      t.equal(FK('year').$(data), undefined);
      t.equal(FK('date.day').$(data), undefined);
      t.equal(FK('year.day').$(data), undefined);
      t.equal(FK('date.year.value').$(data), undefined);
      t.end();
    });

    t.test('should return default with missing key', (t) => {
      var data = calender[0].event;
      t.equal(FK('year').get(2000)(data), 2000);
      t.equal(FK('date.day').get(5)(data), 5);
      t.equal(FK('year.day').get(6)(data), 6);
      t.equal(FK('date.year.value').get(7)(data), 7);
      t.end();
    });
  });

  t.test('#satisfies', (t) => {
    t.test('should work', (t) => {
      var a = [[1, 2]];
      var b = [[3, 4]];

      var f = FK([0, 1]).satisfies(_ => _ % 2 === 0);
      t.equal(f(a), true);
      t.equal(f(b), true);
      t.end();
    });
  });

  t.test('#is', (t) => {
    t.test('should work', (t) => {
      var a = [[1, 2]];
      var b = [[1, 2]];

      var f = FK(0).is(a[0]);
      t.equal(f(a), true);
      t.equal(f(b), false);
      t.end();
    });
  });

  t.test('#eq', (t) => {
    t.test('should work', (t) => {
      var f = FK('year').eq(1977);

      t.equal(f(data[0]), true);
      t.equal(f(data[1]), false);
      t.equal(data.filter(f).length, 1);
      t.end();
    });

    t.test('should not interfere', (t) => {
      var f = FK('year').eq(1977);

      t.equal(f(data[0]), true);
      t.equal(f(data[1]), false);
      t.equal(data.filter(f).length, 1);
      t.end();
    });
  });

  t.test('#lt', (t) => {
    t.test('should work with key', (t) => {
      var f = FK('year').lt(newDate(1990));

      t.equal(f(data[0]), true);
      t.equal(data.filter(f).length, 13);
      t.end();
    });

    t.test('should work with $index', (t) => {
      var F = FK('$index').lt(10);

      t.equal(data.filter(F).length, 10);
      t.equal(data.filter(F)[9], data[9]);
      t.end();
    });
  });

  t.test('#lte', (t) => {
    t.test('should work with key', (t) => {
      var f = FK('year').lte(newDate(1989));

      t.equal(f(data[0]), true);
      t.equal(data.filter(f).length, 13);
      t.end();
    });

    t.test('should work with $index', (t) => {
      var F = FK('$index').lte(10);

      t.equal(data.filter(F).length, 11);
      t.equal(data.filter(F)[9], data[9]);
      t.end();
    });
  });

  t.test('#gt', (t) => {
    t.test('should work with key', (t) => {
      var f = FK('year').gt(newDate(1979));

      t.equal(f(data[0]), false);
      t.equal(data.filter(f).length, 26);
      t.end();
    });

    t.test('should work with $index', (t) => {
      var F = FK('$index').gt(10);

      t.equal(data.filter(F).length, data.length - 11);
      t.equal(data.filter(F)[0], data[11]);
      t.end();
    });
  });

  t.test('#gte', (t) => {
    t.test('should work with key', (t) => {
      var f = FK('year').gte(newDate('1980'));

      t.equal(f(data[0]), false);
      t.equal(data.filter(f).length, 26);
      t.end();
    });

    t.test('should work with $index', (t) => {
      var F = FK('$index').gte(10);

      t.equal(data.filter(F).length, data.length - 10);
      t.equal(data.filter(F)[0], data[10]);
      t.end();
    });
  });

  t.test('#between', (t) => {
    t.test('should work with key', (t) => {
      var f = FK('year').between(newDate('1980'), newDate('1990'));

      t.equal(f(data[0]), false);
      t.equal(data.filter(f).length, 9);
      t.end();
    });

    t.test('should work with $index', (t) => {
      var F = FK('$index').between(10, 20);

      t.equal(data.filter(F).length, 9);
      t.equal(data.filter(F)[0], data[11]);
      t.end();
    });
  });

  t.test('#isNil', (t) => {
    t.test('should work', (t) => {
      var f = FK('year').isNil();

      t.equal(f({ year: 123 }), false);
      t.equal(f({ }), true);
      t.equal(f({ year: null }), true);
      t.equal(data.filter(f).length, 0);
      t.end();
    });
  });

  t.test('#exists', (t) => {
    t.test('should work with key', (t) => {
      var f = FK('year').exists();

      t.equal(f({year: 1990, value: 8.89}), true);
      t.equal(f({value: 8.89}), false);
      t.equal(f({year: null}), false);
      t.equal(f({}), false);
      t.equal(data.filter(f).length, 29);
      t.end();
    });
  });

  t.test('#type', (t) => {
    t.test('should work with key', (t) => {
      var f = FK('year').type();

      t.equal(f({year: 1990, value: 8.89}), 'Number');
      t.equal(f({year: '1990', value: 8.89}), 'String');
      t.equal(data.filter(f).length, 29);
      t.end();
    });
  });

  t.test('#typeof', (t) => {
    t.test('should work with key', (t) => {
      var f = FK('year').typeof('Number');

      t.equal(f({year: 1990, value: 8.89}), true);
      t.equal(f({year: '1990', value: 8.89}), false);
      t.equal(data.filter(f).length, 29);
      t.end();
    });
  });

  t.test('#match', (t) => {
    t.test('should work with regex', (t) => {
      var f = FK('year').match(/19[89]./);

      t.equal(f(data[0]), false);
      t.equal(data.filter(f).length, 20);  // TODO: check
      t.end();
    });

    t.test('should work with string', (t) => {
      var f = FK('year').match(new RegExp('19[89].'));  // todo: fix

      t.equal(f(data[0]), false);
      t.equal(data.filter(f).length, 20);  // TODO: check
      t.end();
    });
  });

  t.test('#and', (t) => {
    t.test('should work with simple accessor function', (t) => {
      newDate.called = 0;

      var F1 = FK('value').gt(0);
      var F2 = function (d) {
        return d.year < newDate(1990);
      };
      var f = F.and(F1, F2);

      t.equal(f(data[0]), false);
      t.equal(data.filter(f).length, 10);

      // t.equal(newDate.called, 26);  // todo: check and fix

      var mean = d3_mean(data.filter(f), d => d.value);
      t.equal(mean, 20.986);
      t.end();
    });

    t.test('should work with FK, new key', (t) => {
      newDate.called = 0;

      var F1 = FK('value').gt(0);
      var F2 = FK('year').lt(newDate(1990));
      var f = F.and(F1, F2);

      t.equal(f(data[0]), false);
      t.equal(data.filter(f).length, 10);

      t.equal(newDate.called, 1);

      var mean = d3_mean(data.filter(f), d => d.value);
      t.equal(mean, 20.986);
      t.end();
    });

    /* t.test('should work with identity function', (t) => {
      var f = _F('year').gt(newDate(1979)).and(_F().lt(newDate(1990)));

      t.equal(f(data[0]), false);
      t.equal(data.filter(f).length, 10);

      var mean = d3_mean(data.filter(f), _F('value'));
      t.equal(mean, 20.986);
      t.end();
    });

    t.test('chaining should not interfere', (t) => {
      var F1 = _F('year').gt(newDate(1979));
      var f = F1.and().lt(newDate(1990));

      _F('year').lt(newDate(1979));
      F1.and().gt(newDate(1990));

      t.equal(f(data[0]), false);
      t.equal(data.filter(f).length, 10);

      var mean = d3_mean(data.filter(f), _F('value'));
      t.equal(mean, 20.986);
      t.end();
    });

    t.test('should be chainable, alternate form', (t) => {
      var F1 = _F('year').gt(newDate(1979));
      var f = F1.and().lt(newDate(1990));

      t.equal(f(data[0]), false);
      t.equal(data.filter(f).length, 10);

      var mean = d3_mean(data.filter(f), _F('value'));
      t.equal(mean, 20.986);
      t.end();
    }); */

    t.test('should be chainable with simple accessor', (t) => {
      newDate.called = 0;

      var F2 = function (d) {
        return d.year > newDate(1979);
      };
      var f = F.and(FK('year').lt(newDate(1990)), F2);

      t.equal(f(data[0]), false);
      t.equal(data.filter(f).length, 10);

      // t.equal(newDate.called, 15);  // todo: check and fix

      var mean = d3_mean(data.filter(f), d => d.value);
      t.equal(mean, 20.986);
      t.end();
    });
  });

  /* t.test('#not', (t) => {
    t.test('should work with simple accessor function', (t) => {
      newDate.called = 0;

      var F1 = _F('value');
      var F2 = function (d) {
        return d.year < newDate(1990);
      };
      var f = F1.not(F2);

      t.equal(f(data[0]), false);
      t.equal(data.filter(f).length, 16);

      t.equal(newDate.called, 30);

      var mean = d3_mean(data.filter(f), F1);
      t.equal(mean, 4.5668750000000005);
      t.end();
    });

    t.test('should work with _F, new key', (t) => {
      newDate.called = 0;
      var F1 = _F('value');
      var F2 = _F('year').lt(newDate(1990));
      var f = F1.not(F2);

      t.equal(f(data[0]), false);
      t.equal(data.filter(f).length, 16);

      t.equal(newDate.called, 1);

      var mean = d3_mean(data.filter(f), _F('value'));
      t.equal(mean, 4.5668750000000005);
      t.end();
    });

    t.test('should work with identity function', (t) => {
      var F1 = _F('year');
      var F2 = _F().lt(newDate(1990));
      var f = F1.not(F2);

      t.equal(f(data[0]), false);
      t.equal(data.filter(f).length, 16);

      var mean = d3_mean(data.filter(f), _F('value'));
      t.equal(mean, 4.5668750000000005);
      t.end();
    });

    t.test('should be chainable, alternate form', (t) => {
      var F1 = _F('year');
      var f = F1.not().lt(newDate(1980));

      t.equal(f(data[0]), false);
      t.equal(data.filter(f).length, 26);

      var mean = d3_mean(data.filter(f), _F('value'));
      t.equal(mean, 10.881923076923073);
      t.end();
    });
  }); */

  t.test('#both', (t) => {
    t.test('should work with accessor functions', (t) => {
      var year = FK('year');
      var f = year.both(a => a > newDate(1979), b => b < newDate(1990));

      t.equal(f(data[0]), false);
      t.equal(data.filter(f).length, 10);

      var mean = d3_mean(data.filter(f), d => d.value);
      t.equal(mean, 20.986);
      t.end();
    });

    t.test('should work with identity function', (t) => {
      var year = FK('year');
      var f = year.both(FK().gt(newDate(1979)), FK().lt(newDate(1990)));

      t.equal(f(data[0]), false);
      t.equal(data.filter(f).length, 10);

      var mean = d3_mean(data.filter(f), d => d.value);
      t.equal(mean, 20.986);
      t.end();
    });
  });

  t.test('#either', (t) => {
    t.test('should work with accessor functions', (t) => {
      var year = FK('year');
      var f = year.either(a => a > newDate(1989), b => b < newDate(1980)); // gt(newDate(1989)).or(_F().lt(newDate(1980)));

      t.equal(f(data[0]), true);
      t.equal(data.filter(f).length, 19);

      var mean = d3_mean(data.filter(f), d => d.value);
      t.equal(mean, 3.845789473684211);
      t.end();
    });

    t.test('should work with identity function', (t) => {
      var year = FK('year');
      var f = year.either(FK().gt(newDate(1989)), FK().lt(newDate(1980))); // gt(newDate(1989)).or(_F().lt(newDate(1980)));

      t.equal(f(data[0]), true);
      t.equal(data.filter(f).length, 19);

      var mean = d3_mean(data.filter(f), d => d.value);
      t.equal(mean, 3.845789473684211);
      t.end();
    });
  });

  t.test('#or', (t) => {
    t.test('should work with simple accessor function', (t) => {
      newDate.called = 0;

      var F1 = FK('value').gt(15);
      var F2 = function (d) {
        return d.year >= newDate(2000);
      };
      var f = F.or(F1, F2);

      t.equal(f(data[0]), false);
      t.equal(data.filter(f).length, 10);

      // t.equal(newDate.called, 26);  // Todo fix and Check

      var mean = d3_mean(data.filter(f), d => d.value);
      t.equal(mean, 14.611);
      t.end();
    });

    t.test('should work with FK, new key', (t) => {
      newDate.called = 0;

      var F1 = FK('value').gt(15);
      var F2 = FK('year').gt(newDate(1999));
      var f = F.or(F1, F2);

      t.equal(f(data[0]), false);
      t.equal(data.filter(f).length, 10);

      t.equal(newDate.called, 1);

      var mean = d3_mean(data.filter(f), d => d.value);
      t.equal(mean, 14.611);
      t.end();
    });

    /* t.test('should work with identity function', (t) => {
      var f = _F('year').gt(newDate(1989)).or(_F().lt(newDate(1980)));

      t.equal(f(data[0]), true);
      t.equal(data.filter(f).length, 19);

      var mean = d3_mean(data.filter(f), _F('value'));
      t.equal(mean, 3.845789473684211);
      t.end();
    });

    t.test('should be chainable, alternate form', (t) => {
      var f = _F('year').gt(newDate(1989)).or().lt(newDate(1980));

      t.equal(f(data[0]), true);
      t.equal(data.filter(f).length, 19);

      var mean = d3_mean(data.filter(f), _F('value'));
      t.equal(mean, 3.845789473684211);
      t.end();
    }); */
  });

  t.test('#order', (t) => {
    t.test('should sort by defined order', (t) => {
      var value = FK('value');

      var d = data.slice().sort(value.order((a, b) => a < b));
      t.equal(d.shift().value, 0);
      t.equal(d.pop().value, 43.7);
      t.end();
    });
  });

  t.test('#asc', (t) => {
    t.test('should sort ascending', (t) => {
      var valueKey = FK('value');
      var value = valueKey.$;

      var d = data.slice().sort(valueKey.asc());
      t.equal(value(d.shift()), 0);
      t.equal(value(d.pop()), 43.7);
      t.end();
    });
  });

  t.test('#desc', (t) => {
    t.test('should sort ascending', (t) => {
      var valueKey = FK('value');
      var value = valueKey.$;

      var d = data.slice().sort(valueKey.desc());
      t.equal(value(d.pop()), 0);
      t.equal(value(d.shift()), 43.7);
      t.end();
    });
  });
});
