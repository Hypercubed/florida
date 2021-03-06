# `florida`

Pure functional accessor factories in js.

**Warning: This library is not ready.**

**Some parts of the documentation are based on a previous [incarnation](https://github.com/Hypercubed/_F).**

**Work in progress**

## Install (TBD)

`npm install florida`

## Testing

Install npm and bower dependencies:

```bash
npm install
npm test
```

## Summary of API

Hypercubed/florida is a shortcut for composable data accessors functions. For example:

### Import


#### ES6
```js
import * as F from 'florida';
import {keys as FK} from 'florida';
```

#### CJS

```js
var F = require('florida');
var FK = F.keys;
```

### Accessors

| FK                                | Pure JS equivalent                             |
| --------------------------------- | ---------------------------------------------- |
| `FK().$`                          | `function(d)    { return d; }`                 |
| `FK('prop').$`                    | `function(d)    { return d.prop; }`            |
| `FK('prop.prop').$`               | `function(d)    { return d.prop.prop; }`       |
| `FK('prop.prop.prop').$`          | `function(d)    { return d.prop.prop.prop; }`  |
| `FK(number).$`                    | `function(d)    { return d[number]; }`         |
| `FK('$index').$`                  | `function(d, i) { return i; }`                 |
| `FK('$this').$`                   | `function()     { return this; }`              |
| `FK(['prop', 0, 'prop']).$`       | `function(d)    { return d.prop[0].prop; }`    |

_Example_
```js
var data = [ { firstname: 'John', lastname: 'Smith', age: 51 }, /* ... */ ];
var firstname = FK('firstname');

data.map(_firstname.get());  // Returns a list of first names
```

### Operators

| FK                            | Pure JS equivalent                                    |
| ----------------------------- | ----------------------------------------------------- |
| `FK('prop').eq(value)`        | `function(d) { return  d.prop  == value; }`           |
| `FK('prop').neq(value)` (TBD) | `function(d) { return  d.prop !== value; }`           |
| `FK('prop').gt(value)`        | `function(d) { return  d.prop >   value; }`           |
| `FK('prop').lt(value)`        | `function(d) { return  d.prop <   value; }`           |
| `FK('prop').gte(value)`       | `function(d) { return  d.prop >=  value; }`           |
| `FK('prop').lte(value)`       | `function(d) { return  d.prop <=  value; }`           |
| `FK('prop').in(array)` (TBD)  | `function(d) { return  array.indexOf(d)      > -1; }` |
| `FK('prop').has(value)` (TBD) | `function(d) { return  d.prop.indexOf(value) > -1; }` |

_Example_
```js
var _johns = _firstname.eq('John');

data.filter(_johns);  // returns a list of John's
```

### Chaining

| FK                                                   | Pure JS equivalent                                                |
| ---------------------------------------------------- | ----------------------------------------------------------------- |
| `F.and(FK('prop').gt(value), fn)`                    | `function(d) { return (d.prop > value) && fn(d); }`              |
| `F.or(FK('prop').gt(value), fn)`                     | `function(d) { return (d.prop > value) || fn(d); }`              |
| `F.not(FK('prop').gt(value), fn)`                    | `function(d) { return (d.prop > value) && !fn(d); }`             |
| `FK('prop').both(FK().gt(value), FK().lt(valueB))`   | `function(d) { return (d.prop > value) && (d.prop < valueB); }`  |
| `FK('prop').either(FK().gt(value), FK().lt(valueB))` | `function(d) { return (d.prop < value) || (d.prop > valueB); }`  |

_Example_
```js
var _age = FK('age');
var _twenties = _age.both(FK().gte(20), FK().lt(30));

data.filter(F.and(_johns, _twenties));  // returns a list of John's in their twenties
```

### Sorting

| FK                        | Pure JS equivalent                            |
| ------------------------- | --------------------------------------------- |
| `FK('prop').order(fn)`    | `function(a,b) { return fn(a.prop,b.prop); }` |
| `FK('prop').asc()`        | `function(a,b) { return fn(ascending); }`     |
| `FK('prop').desc()`       | `function(a,b) { return fn(decending); }`     |

_Example_
```js
data.filter(FK.and(_johns, _twenties)).sort(_age.asc());  // returns a list of John's in their twenties sorted by age in ascending order
```

## Why?

In JavaScript, especially when using d3, we often write accessor functions like this:

```js
function(d) { return d.value; }
```

This simple function returns the value of the `value` key when an object is pass to it.  For example in the `map` function:

```js
values = data.map(function(d) { return d.value; });
```

This is lightweight, simple, and readable.  There is nothing wrong with it.  Sometimes, however, in order to avoid repeating ourselves so we crete a reusable accessor function like this:

```js
var _value = function(d) { return d.value; };
values = data.map(_value);
```

Now imagine the object also has a `year` key whose values are date objects.  We may want to filter like this:

```js
var _value = function(d) { return d.value; };
var _year_filter = function(d) { return d.year >= new Date('1980 Jan 1'); };
values = data.filter(_year_filter).map(_value);
```

However, this has a couple of slight drawbacks.  First of all you will need to create a new filter every time the date changes; also the `Date` constructor is called for every element in the `data` array.  A better approach is an accessor factory:

```js
var _year_filter = function(date) {
  return function(d) { return d.year >= date; };
}

var _filter = _year_filter(new Date('1990 Jan 1'));
values = data.filter(_filter).map(_value);
```

It's a little ugly but here the `Date` constructor is only called once and the `_year_filter` function returns the accessor.  An new accessor can be created any time by calling `_year_filter`

Now what if we want to filter between two dates.  We can do modify our accessor factory:

```js
var _year_filter = function(dateA, dateB) {
  return function(d) { return d.year >= new Date(dateA) && d.year < new Date(dateB); };
}
```

but let's say that you have multidimensional data where `dateA` and `dataB` change independently.  You might be tempted to do something like this:

```js
var _year_gte = function(dateA) {
  return function(d) { return d.year >= dateA; };
}

var _year_lt = function(dateB) {
  return function(d) { return d.year < dateB; };
}

_year_filter1 = _year_gte(new Date('1980 Jan 1'));
_year_filter2 = _year_lt(new Date('1990 Jan 1'));

values = data
  .filter(_year_filter1)
  .filter(_year_filter2)
  .map(_value);
```

Ok, no we are getting ridiculous.  The date constructor is not that expensive.  But you can imagine a situation where the values for filters could be very expensive.  For example based on aggregated statistics or reading from the DOM.

Ok, at this point let me introduce `FK`.  `FK` is simply a shortcut for all this.  For example:

```js
var _value = FK('value');
values = data.map(_value.$);
```

The value returned from `FK('value').$` in this case is simply the accessor function `function(d) { return d.value; }`.

Interesting.  How about this:

```js
var _value = FK('value');
var _year_filter = FK('year').gte(new Date('1980 Jan 1'));
values = data.filter(_year_filter).map(_value.$);
```

`FK('year').gte(somevalue)`  is essentially a shortcut for `function(d) { return d.year >= somevalue; }`.

It gets better:

```js
var _value = FK('value');

var _year_filter =
  FK('year').both(FK().gte(new Date('1980 Jan 1')), FK().lt(new Date('1990 Jan 1')));

values = data.filter(_year_filter).map(_value.$);
```

or how about this:

```js
var _value = FK('value');
var _value_filter = _value.gt(10);

var _year = FK('year');
var _year_filter = _year.both(FK().gte(new Date('1980 Jan 1'), FK().lt(new Date('1990 Jan 1')));

var _filter = F.and(_value_filter, _year_filter);

values = data.filter(_filter).map(_value.$);
```

Pretty neat?

## Acknowledgments

## License
Copyright (c) 2015 Jayson Harshbarger
MIT
