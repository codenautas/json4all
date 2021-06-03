# json4all
JSON for all purposes and all platforms


![stable](https://img.shields.io/badge/stability-stable-blue.svg)
[![npm-version](https://img.shields.io/npm/v/json4all.svg)](https://npmjs.org/package/json4all)
[![downloads](https://img.shields.io/npm/dm/json4all.svg)](https://npmjs.org/package/json4all)
[![build](https://img.shields.io/travis/codenautas/json4all/master.svg)](https://travis-ci.org/codenautas/json4all)
[![coverage](https://img.shields.io/coveralls/codenautas/json4all/master.svg)](https://coveralls.io/r/codenautas/json4all)
[![dependencies](https://img.shields.io/david/codenautas/json4all.svg)](https://david-dm.org/codenautas/json4all)



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
* have a way to exchange objects between the front-end and the back-end:
  * sending to the front-end only the properties that the front-end must known,
  * sending to the front-end a reference to the instance of that object in the back-end

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
## @JSON4all.addClass


Decorator that registers the class

You must define with `addProperty` with properties you want to serialize.
If a property is in the class main constructor you must use `addProperty(n)`
(startin with 1).


```ts
var JSON4all = require('json4all');

@JSON4all.addClass
class Point {
    @JSON4all.addProperty(1) public x: number
    @JSON4all.addProperty(2) public y: number
    @JSON4all.addProperty(3) public z: number
    @JSON4all.addProperty public color: string | undefined
    public internal: number | undefined
    constructor(x, y, z){
        this.x = x;
        this.y = y;
        this.z = z;
    }
}

var p = new Point(1.1, 2.3, 3.14);
p.internal = 7;

var q = JSON4all.parse(JSON4all.stingify(p));

console.log(q.internal); // undefined
console.log(q instanceof Point); // true
console.log(q.z); // 3.14
```
## JSON4all.RefStore


Registers an object as a repository of referenciable instances in the back-end that can send copies to the front-end.

When a object is serialized in the back-end a reference was added to the sended data. In the front-end the object is revived and the reference conserved.

When the object is serialized to be send back to de back-end,
it serialize only the reference excluding the properity values
(because they don't need id to identified the object in the back-end).



```ts

// in the back-end
import * as JSON4all from 'json4all';
import { Point } from './common/my-classes';

JSON4all.RefStoreSpace(global.mySpace)

var points = JSON4all.RefStore<string, Point>(['points']);

var center = new Point(100,200,-50);
points['x3298484'] = center;

console.log(points[JSON4all.RefKey]) // 'x3298484'
var str = JSON4all.stringify(center);

var center2 = JSON4all.parse(str);

console.log( center === center2 ); // true the same instance!!!!

res.send(JSON4all.stringify(center));

// IN THE FRONT-END:
import * as JSON4all from 'json4all';
import { Point } from './common/my-classes';

var pointStr = await simpleFetch('https://..../center')
var point = JSON4all.parse()

console.log(point.x, point.y, point.z); // 100,200,-50
point.x = 999;

simpleFetch('https://..../set-center?point='+JSON4all.stringify(point));
// only the ref is sended

// IN THE BACK-END:

app.get('/set-center',(req)=>{
    // with the ref the object is retrived from the collection
    var point = JSON4all.parse(req.query('point'));
    console.log(point.x, point.y, point.z); // 100,200,-50
    console.log(points['x3298484'] === point) // the same instance
})

```
## JSON4all.pretendClass(object, classConstructor)


Sets internal properties of a plain object to make the call of `JSON.stringify(object)`
to return the same value that the call aplied to a instance object of that class with the same values
(`JSON.stringify(object) === JSON.object(instance)`).


```ts
var point = new Point({x:7, y:8});
var object = {x:7, y:8};

JSON4all.pretendClass(object, Point);

console.log(JSON4all.stringify(object) == JSON4all.stringify(point)); // true

var restoredPoint = JSON4all.parse(JSON4all.stringify(object));

console.log(restoredPoint instanceof Point); // true

```

## Tests with real devices


NPM version | Device                 | OS            | nav
------------|------------------------|---------------|----------------
0.1.4       | Samsung SM-T560        | Android 4.4.4 | Firefox 49.0.0
0.1.4       | Samsung SM-T560        | Android 4.4.4 | Chrome 53.0.2785
0.1.4       | Samsung SM-T560        | Android 4.4.4 | Opera 37.0.2192
0.1.4       | Samsung S5             | Android 4.4.2 | Firefox 49.0.0
0.1.4       | Samsung S5             | Android 4.4.2 | Opera Mobile 37.1.2192

## License

[MIT](LICENSE)

