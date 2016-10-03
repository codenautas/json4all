# json4all
JSON for all purposes and all platforms


![extending](https://img.shields.io/badge/stability-extending-orange.svg)
[![npm-version](https://img.shields.io/npm/v/json4all.svg)](https://npmjs.org/package/json4all)
[![downloads](https://img.shields.io/npm/dm/json4all.svg)](https://npmjs.org/package/json4all)
[![build](https://img.shields.io/travis/codenautas/json4all/master.svg)](https://travis-ci.org/codenautas/json4all)
[![coverage](https://img.shields.io/coveralls/codenautas/json4all/master.svg)](https://coveralls.io/r/codenautas/json4all)
[![climate](https://img.shields.io/codeclimate/github/codenautas/json4all.svg)](https://codeclimate.com/github/codenautas/json4all)
[![dependencies](https://img.shields.io/david/codenautas/json4all.svg)](https://david-dm.org/codenautas/json4all)
[![qa-control](http://codenautas.com/github/codenautas/json4all.svg)](http://codenautas.com/github/codenautas/json4all)



language: ![English](https://raw.githubusercontent.com/codenautas/multilang/master/img/lang-en.png)
also available in:
[![Spanish](https://raw.githubusercontent.com/codenautas/multilang/master/img/lang-es.png)](LEEME.md)

# Install
```sh
$ npm install json4all
```

# Main goal

Replace **JSON** by a function that
* can encode/decode:
  * **Date**
  * **Regexp**
  * Objects and Arrays that contains **undefined**
  * User defined types
* be sure, ie dont encode **Function**

```js
var JSON4all = require('json4all');

var today = new Date();
var tansDate = JSON4all.parse(JSON4all.stringify(today));
console.log(transDate.constructor.name); // Date
```

## JSON4all.addType(Constructor)


Registers the class constructor

Te class must have these functions:
* JSON4replacer (at prototype level) thats returns a *recreate value*
* JSON4reviver (at class level) that receives the *recreate value* and returns the recreated object.


```js
var JSON4all = require('json4all');

function Point(x, y, z) {
    this.klass = 'Point';
    this.x     = x;
    this.y     = y;
    this.z     = z;
}

Point.prototype.JSON4replacer=function(){ return {x:this.x, y:this.y, z:this.z}; }
Point.JSON4reviver=function(o){ return new Point(o.x, o.y, o.z); }

JSON4all.addType(Point);

var p = new Point();
var q = JSON4all.parse(JSON4all.stingify(p));

console.log(q instanceof Point); // true
```

## Tests with real devices


NPM version | Device                 | OS            | nav
------------|------------------------|---------------|----------------
0.1.4       | Samsung SM-T560        | Android 4.4.4 | Firefox 49.0.0
0.1.4       | Samsung SM-T560        | Android 4.4.4 | Chrome 53.0.2785
0.1.4       | Samsung S5             | Android 4.4.2 | Firefox 49.0.0

## License

[MIT](LICENSE)

