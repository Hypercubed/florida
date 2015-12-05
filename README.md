# `florida`

Functional accessors in js.

** Warning: Some parts of the documentation are based on a previous version.  Update is in progress **

## Install

`npm install florida`

## Testing

Install npm and bower dependencies:

```bash
npm install
npm test
```

## Summary of API

Hypercubed/florida is a shortcut for composable "d3 style" data accessors functions. For example:

### Accessors

| FK                          | Pure JS equivalent                             |
| --------------------------- | ---------------------------------------------- |
| `FK().get`                  | `function(d)    { return d; }`                 |
| `FK('prop').get`            | `function(d)    { return d.prop; }`            |
| `FK('prop.prop').get`       | `function(d)    { return d.prop.prop; }`       |
| `FK('prop.prop.prop').get`  | `function(d)    { return d.prop.prop.prop; }`  |
| `FK(number).get`            | `function(d)    { return d[number]; }`         |
| `FK('$index').get`          | `function(d, i) { return i; }`                 |
| `FK('$this').get`           | `function()     { return this; }`              |

_Example_
```js
var data = [ { firstname: 'John', lastname: 'Smith', age: 51 }, /* ... */ ];
var _firstname = FK('firstname');

data.map(_firstname.get);  // Returns a list of first names
```

### Operators

| FK                      | Pure JS equivalent                                    |
| ----------------------- | ----------------------------------------------------- |
| `FK('prop').eq(value)`  | `function(d) { return  d.prop  == value; }`           |
| `FK('prop').neq(value)` | `function(d) { return  d.prop !== value; }`           |
| `FK('prop').gt(value)`  | `function(d) { return  d.prop >   value; }`           |
| `FK('prop').lt(value)`  | `function(d) { return  d.prop <   value; }`           |
| `FK('prop').gte(value)` | `function(d) { return  d.prop >=  value; }`           |
| `FK('prop').lte(value)` | `function(d) { return  d.prop <=  value; }`           |
| `FK('prop').in(array)`  | `function(d) { return  array.indexOf(d)      > -1; }` |
| `FK('prop').has(value)` | `function(d) { return  d.prop.indexOf(value) > -1; }` |

_Example_
```js
var _johns = _firstname.eq('John');

data.filter(_johns);  // returns a list of John's
```

### Chaining (TBR)

| FK                                        | Pure JS equivalent                                                |
| ----------------------------------------- | ----------------------------------------------------------------- |
| `FK('prop').gt(value).and(fn)`            | `function(d) { return (d.prop > value) &&  fn(d); }`              |
| `FK('prop').gt(value).or(fn)`             | `function(d) { return (d.prop > value) ||  fn(d); }`              |
| `FK('prop').gt(value).not(fn)`            | `function(d) { return (d.prop > value) &&  !fn(d); }`             |
| `FK('prop').gt(value).and().lt(valueB)`   | `function(d) { return (d.prop > value) &&  (d.prop < valueB); }`  |
| `FK('prop').lt(value).or().gt(valueB)`    | `function(d) { return (d.prop < value) ||  (d.prop > valueB); }`  |
| `FK('prop').gt(value).not().eq(valueB)`   | `function(d) { return (d.prop > value) && !(d.prop == valueB); }` |

_Example_
```js
var _age = FK('age');
var _twenties = _age.gte(20).and().lt(30);

data.filter(_johns.and(_twenties));  // returns a list of John's in their twenties
```

### Sorting (TBR)

| FK                        | Pure JS equivalent                            |
| ------------------------- | --------------------------------------------- |
| `FK('prop').order(fn)`    | `function(a,b) { return fn(a.prop,b.prop); }` |
| `FK('prop').asc`          | `function(a,b) { return fn(ascending); }`     |
| `FK('prop').desc`         | `function(a,b) { return fn(decending); }`     |

_Example_
```js
data.filter(FK.and(_johns, _twenties)).sort(_age.asc);  // returns a list of John's in their twenties sorted by age in ascending order
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
values = data.filter(_filter).map(_value.get);
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
values = data.map(_value.get);
```

The value returned from `FK('value').get` in this case is simply the accessor function `function(d) { return d.value; }`.

Interesting.  How about this:

```js
var _value = FK('value');
var _year_filter = FK('year').gte(new Date('1980 Jan 1'));
values = data.filter(_year_filter).map(_value.get);
```

`FK('year').gte(somevalue)`  is essentially a shortcut for `function(d) { return d.year >= somevalue; }`.

It gets better:

```js
var _value = FK('value');

var _year_filter =
  FK('year')
    .gte(new Date('1980 Jan 1'))
    .and().lt(new Date('1990 Jan 1'));

values = data.filter(_year_filter).map(_value);
```

or how about this:

```js
var _value = FK('value');
var _value_filter = _value.gt(10);

var _year = FK('year');
var _year_filter = FK.and(_year.gte(new Date('1980 Jan 1'), _year.lt(new Date('1990 Jan 1')));

var _filter = FK.and(_value_filter, _year_filter);

values = data.filter(_filter).map(_value.get);
```

Pretty neat?

## Acknowledgments

## License
Copyright (c) 2015 Jayson Harshbarger
MIT
