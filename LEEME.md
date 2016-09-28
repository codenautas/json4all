<!--multilang v0 es:LEEME.md en:README.md -->
# json4all
<!--lang:es-->
JSON para todos los propósitos y todas las plataformas
<!--lang:en--]
JSON for all purposes and all platforms

[!--lang:*-->

<!-- cucardas -->
![designing](https://img.shields.io/badge/stability-designing-red.svg)
[![npm-version](https://img.shields.io/npm/v/json4all.svg)](https://npmjs.org/package/json4all)
[![downloads](https://img.shields.io/npm/dm/json4all.svg)](https://npmjs.org/package/json4all)
[![build](https://img.shields.io/travis/codenautas/json4all/master.svg)](https://travis-ci.org/codenautas/json4all)
[![coverage](https://img.shields.io/coveralls/codenautas/json4all/master.svg)](https://coveralls.io/r/codenautas/json4all)
[![climate](https://img.shields.io/codeclimate/github/codenautas/json4all.svg)](https://codeclimate.com/github/codenautas/json4all)
[![dependencies](https://img.shields.io/david/codenautas/json4all.svg)](https://david-dm.org/codenautas/json4all)
[![qa-control](http://codenautas.com/github/codenautas/json4all.svg)](http://codenautas.com/github/codenautas/json4all)


<!--multilang buttons-->

idioma: ![castellano](https://raw.githubusercontent.com/codenautas/multilang/master/img/lang-es.png)
también disponible en:
[![inglés](https://raw.githubusercontent.com/codenautas/multilang/master/img/lang-en.png)](README.md)

<!--lang:es-->
# Instalación
<!--lang:en--]
# Install
[!--lang:*-->
```sh
$ npm install json4all
```

<!--lang:es-->
# Objetivo

Reemplazar **JSON** por una función que 
* pueda codificar/decodificar:
  * Fechas del tipo nativo **Date**
  * Expresiones regulares del tipo **Regexp**
  * Objetos y arreglos que contengan *undefined*
  * Tipos definidos por el usuario
* sea seguro, o sea no codifique funciones (**Function**)

<!--lang:en--]
# Main goal

Replace **JSON** by a function that
* can encode/decode:
  * **Date**
  * **Regexp**
  * Objects and Arrays that contains **undefined**
  * User defined types
* be sure, ie dont encode **Function**

[!--lang:*-->
```js
var JSON4all = require('json4all');

var today = new Date();
var tansDate = JSON4all.parse(JSON4all.stringify(today));
console.log(transDate.constructor.name); // Date
```

## JSON4all.addType(Constructor)

<!--lang:es-->

Registra la clase definida por el constructor.

La clase debe tener definidas las funciones:
* JSON4replacer (a nivel de la instancia de objeto o del prototipo) que devuelve un valor que sirve para recrear el objeto
* JSON4reviver (a nivel de la clase) que recive el valor para recrear el objeto y devuelve el nuevo objeto recreado

<!--lang:en--]

Registers the class constructor

Te class must have these functions:
* JSON4replacer (at prototype level) thats returns a *recreate value*
* JSON4reviver (at class level) that receives the *recreate value* and returns the recreated object.

[!--lang:*-->

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

<!--lang:es-->
## Licencia
<!--lang:en--]
## License
[!--lang:*-->

[MIT](LICENSE)

