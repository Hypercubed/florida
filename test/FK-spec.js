import test from 'tape';
import * as F from '../src/FK';
const FK = F.keys;

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

test('_F', (t) => {
  t.test('example', (t) => {
    t.test('should run', (t) => {
      var people = [
        { firstname: 'John', lastname: 'Smith', age: 51 },
        { firstname: 'John', lastname: 'Hawley', age: 16 },
        { firstname: 'Janet', lastname: 'Howell', age: 23 },
        { firstname: 'John', lastname: 'Jones', age: 29 },
        { firstname: 'John', lastname: 'Hernandez', age: 22 },
        { firstname: 'Maurice', lastname: 'Hall', age: 22 }
      ];

      var _firstname = FK('firstname');
      var _age = FK('age');
      var _johns = _firstname.eq('John');
      var _twenties = F.and(_age.gte(20), _age.lt(30)); // _age.gte(20).and().lt(30);

      t.deepEqual(people.map(_firstname.get()), ['John', 'John', 'Janet', 'John', 'John', 'Maurice']);  // Returns a list of first names
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
      //  t.equal(typeof FK(), 'object');
      t.end();
    });

    t.test('should return identity function', (t) => {
      var f = FK().get();
      t.equal(f(5), 5);
      t.end();
    });

    t.test('should return identity function when passsed null', (t) => {
      var f = FK(null).get();
      t.equal(f(5), 5);
      t.end();
    });

    t.test('should return an accessor function', (t) => {
      var f = FK('year').get();
      t.equal(f(data[0]), 1977);
      t.end();
    });

    t.test('should compose accessor function', (t) => {
      var f = FK(['year', String]).get();
      t.equal(f(data[0]), '1977');
      t.end();
    });

    t.test('should compose accessor function', (t) => {
      var f = FK('year', String).get();
      t.equal(f(data[0]), '1977');
      t.end();
    });

    t.test('should return an accessor function', (t) => {
      var f = FK(d => d.year).get();
      t.equal(f(data[0]), 1977);
      t.end();
    });

    t.test('should return an index accessor function', (t) => {
      var f = FK('$index').get();

      t.equal(data.map(f).length, data.length);
      t.equal(data.map(f)[0], 0);
      t.equal(data.map(f)[5], 5);
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
      }).get();

      var _this = { name: 'thisName' };
      t.equal(data.map(f, _this).length, data.length);

      t.equal(data.map(f, _this)[0], 'thisName');
      t.equal(data.map(f, _this)[5], 'thisName');
      t.end();
    });

    t.test('should return a this accessor function', (t) => {
      var f = FK('$this').get();

      var _this = { name: 'thisName' };
      t.equal(data.map(f, _this)[0], _this);
      t.equal(data.map(f, _this)[5], _this);
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
      var data = { date: { year: 1990 } };
      t.equal(FK('date.year').get()(data), data.date.year);
      t.end();
    });

    t.test('should work with nested data, with chained keys in array', (t) => {
      var data = { date: { year: 1990 } };
      t.equal(FK(['date', 'year']).get()(data), 1990);
      t.end();
    });

    t.test('should work with nested data, with chained keys in array', (t) => {
      var data = { date: { year: 1990 } };
      t.equal(FK('date', 'year').get()(data), 1990);
      t.end();
    });

    t.test('should work with nested data, with chained keys in array', (t) => {
      var data = { date: { year: 1990 } };
      t.equal(FK(['date', d => d.year]).get()(data), 1990);
      t.end();
    });

    t.test('should work with deep nested data', (t) => {
      var data = { event: { date: { year: 1990 } } };
      t.equal(FK('event.date.year').get()(data), 1990);
      t.end();
    });

    t.test('should work with very deep nested data', (t) => {
      var data = { events: [ { event: { date: { year: 1990 } } } ] };
      t.equal(FK(['events', 0, 'event.date.year']).get()(data), 1990);
      t.end();
    });

    t.test('should work with very deep nested data', (t) => {
      var data = { events: [ { event: { date: { year: 1990 } } } ] };
      t.equal(FK('events', 0, 'event.date.year').get()(data), 1990);
      t.end();
    });

    t.test('should return undefined with missing key', (t) => {
      var data = { date: { year: 1990 } };
      t.equal(FK('year').get()(data), undefined);
      t.equal(FK('date.day').get()(data), undefined);
      t.equal(FK('year.day').get()(data), undefined);
      t.equal(FK('date.year.value').get()(data), undefined);
      t.end();
    });

    t.test('should return undefined with missing key very deep nested data', (t) => {
      var data = { events: [ { event: { date: { year: 1990 } } } ] };
      t.equal(FK(['events', 1, 'event.date.year']).get()(data), undefined);
      t.end();
    });

    t.test('should return undefined with missing key very deep nested data', (t) => {
      var data = { events: [ { event: { date: { year: 1990 } } } ] };
      t.equal(FK('events', 1, 'event.date.year').get()(data), undefined);
      t.end();
    });

    t.test('should work with numeric keys', (t) => {
      var _secondElement = FK(1);
      t.equal(_secondElement.get()([1978, 0]), 0);
      t.deepEqual(_secondElement.get()(rows), [1978, 0]);
      t.equal(_secondElement.eq(rows[0])(rows), false);
      t.equal(_secondElement.eq(rows[1])(rows), true);
      t.end();
    });

    t.test('should work with numeric keys, including zero', (t) => {
      var _firstElement = FK(0);
      t.equal(_firstElement.get()([1977, 0]), 1977);
      t.deepEqual(_firstElement.get()(rows), [1977, 0]);
      t.equal(_firstElement.eq(1977)([1977, 0]), true);
      t.equal(_firstElement.eq(0)([1977, 0]), false);
      t.end();
    });

    t.test('should work with numeric keys, returns undefined if out of bounds', (t) => {
      var _missingElement = FK(rows.length);
      t.equal(_missingElement.get()(rows), undefined);
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

  t.test('#exists', (t) => {
    t.test('should work with key', (t) => {
      var f = FK('year').exists();

      t.equal(f({year: 1990, value: 8.89}), true);
      t.equal(f({value: 8.89}), false);
      t.equal(f({year: null}), false);
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

    t.test('should work with _F, new key', (t) => {
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

    t.test('should work with _F, new key', (t) => {
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

  t.test('#asc', (t) => {
    t.test('should sort ascending', (t) => {
      var valueKey = FK('value');
      var value = valueKey.get();

      var d = data.slice().sort(valueKey.asc());
      t.equal(value(d.shift()), 0);
      t.equal(value(d.pop()), 43.7);
      t.end();
    });
  });

  t.test('#desc', (t) => {
    t.test('should sort ascending', (t) => {
      var valueKey = FK('value');
      var value = valueKey.get();

      var d = data.slice().sort(valueKey.desc());
      t.equal(value(d.pop()), 0);
      t.equal(value(d.shift()), 43.7);
      t.end();
    });
  });
});
