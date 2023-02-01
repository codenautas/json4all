"use strict";

(function codenautasModuleDefinition(root, name, factory) {
    /* global define */
    /* istanbul ignore next */
    if(typeof root.globalModuleName !== 'string'){
        root.globalModuleName = name;
    }
    /* istanbul ignore next */
    if(typeof exports === 'object' && typeof module === 'object'){
        module.exports = factory();
    }else if(typeof define === 'function' && define.amd){
        define(factory);
    }else if(typeof exports === 'object'){
        exports[root.globalModuleName] = factory();
    }else{
        root[root.globalModuleName] = factory();
    }
    root.globalModuleName = null;
})(/*jshint -W040 */this, 'json4all', function() {
/*jshint +W040 */

/*jshint -W004 */
var json4all = {};
/*jshint +W004 */

json4all.PretendedClass = Symbol("Pretended Class");

function functionName(fun) {
    /* istanbul ignore next */
    if('name' in fun){
        return fun.name;
    }else{
        return fun.toString().replace(/^\s*function\s*([^(]*)\((.|\s)*$/i,'$1');
    }
}

function constructorName(obj) {
    return functionName(obj[json4all.PretendedClass] || obj.constructor);
}

var root;

/* istanbul ignore next */
if(typeof window !== 'undefined'){
    root = window;
}else{
    root = global;
}

root.json4allRegisteredTypes = root.json4allRegisteredTypes || {};
var types = root.json4allRegisteredTypes;

var thisPlatformSkipsUndefinedInArrays = true;

JSON.stringify([undefined],function(key, value){
    if(key==='0'||key===0){
        thisPlatformSkipsUndefinedInArrays = false;
    }
    return value;
});


var thisPlatformHasReplacerBug = false;

/* istanbul ignore next */ // For IE compatibility
JSON.parse('{"3":"33"}',function(key, value){
    if(value===undefined){
        thisPlatformHasReplacerBug = true;
    }
    return value;
});

/* istanbul ignore next */
function InternalValueForUndefined(){ 
    /* istanbul ignore next */
    throw new Error('this is not a function'); 
}

/* istanbul ignore next */
function InternalValueForUnset(){ 
    /* istanbul ignore next */
    throw new Error('this is not a function'); 
}

json4all.directTypes={
    "Object"   : true,
    "Array"    : true,
    "anonymous": true,
    ""         : true
};

json4all.anonymizate = function(classedObject){
    var plainObject={};
    for(var attr in classedObject){
        plainObject[attr] = classedObject[attr];
    }
    return plainObject;
};

json4all.nonymizate = function(plainValue, Constructor){
    var typedValue = new Constructor();
    for(var attr in plainValue){
        typedValue[attr] = plainValue[attr];
    }
    return typedValue;
};

json4all.replacer = function replacer(key, value){
    var realValue = this[key];
    /* istanbul ignore next */ // For IE compatibility
    if(realValue===InternalValueForUndefined){
        this[key]=undefined;
        return {$special: "undefined"};
    }
    if(key!=='' && (!(key in this) || realValue!==null && realValue instanceof Function)){
        return {$special: "unset"};
    }
    if(realValue===undefined || typeof realValue === "undefined" || realValue!==null && realValue instanceof Function){
        return {$special: "undefined"};
    }
    if(realValue===null || typeof realValue!=='object' || key==='$escape'){
        return value;
    }
    if('$special' in realValue || '$escape' in realValue){
        return {$escape: realValue};
    }
    /* istanbul ignore next */ // For IE compatibility
    if(thisPlatformSkipsUndefinedInArrays && realValue instanceof Array){
        for(var i=0; i<realValue.length; i++){
            if(typeof realValue[i] === 'undefined'){
                realValue[i] = InternalValueForUndefined;
            }
        }
        return realValue;
    }
    var typeName = constructorName(realValue);
    if(json4all.directTypes[typeName]){
        return value;
    }else{
        var typeDef=types[typeName];
        if(typeDef){
            var replaced = {$special: typeDef.specialTag(realValue), $value: typeDef.deconstruct(realValue)};
            var ref = realValue[RefKey];
            if(ref!==undefined){
                replaced.$ref = ref;
                if(json4all.$RefStoreSpace == null){
                    delete replaced.$value;
                }
            }
            return replaced;
            // return {$special:'specialTag' in typeDef?typeDef.specialTag(realValue):typeName, $value: typeDef.deconstruct(realValue)};
        }else{
            console.log("JSON4all.stringify unregistered object type", typeName);
            throw new Error("JSON4all.stringify unregistered object type");
        }
    }
};

json4all.reviver = function reviver(key, plainValue){
    var log=false;
    var result;
    if(key==='$escape'){
        return plainValue;
    }else if(plainValue!==null && plainValue.$ref && json4all.$RefStoreSpace){
        var collection = json4all.$RefStoreSpace[plainValue.$ref[0][0]]
        if(!collection){
            throw new Error("json4all ref collection invalid");
        }
        var object = collection[plainValue.$ref[1]];
        if(!object){
            throw new Error("json4all ref key invalid");
        }
        return object;
    }else if(plainValue!==null && plainValue.$special){
        if(plainValue.$special==='undefined'){ 
            if(key===''){
                return undefined;
            }
            return InternalValueForUndefined;
        }else if(plainValue.$special==='unset'){
            return undefined;
        }else{
            var typeDef=types[plainValue.$special];
            if(typeDef){
                result = new typeDef.construct(plainValue.$value, typeDef.constructor);
            }else{
                console.log("JSON4all.parse invalid $special", plainValue.$special);
                throw new Error("JSON4all.parse invalid $special");
            }
        }
    }else if(plainValue!==null && plainValue.$escape){
        return plainValue.$escape;
    }else{
        result = plainValue;
        if(plainValue instanceof Object){
            for(var k in plainValue){
                if(plainValue[k]===InternalValueForUndefined){
                    plainValue[k]=undefined;
                }
            }
        }
    }
    if(plainValue !=null && plainValue.$ref){
        result[RefKey] = plainValue.$ref
    }
    return result;
};

var directRegExp = /^((null|true|false)$|[-\]\[{}".0-9])/;
var directStringRegExp  = /^[a-zA-ZÑñáéíóúüÁÉÍÓÚÜ_@-][0-9a-zA-ZÑñáéíóúüÁÉÍÓÚÜ_@-]{0,32}$/;
var AttributeNameRegExp = /^[a-zA-ZÑñáéíóúüÁÉÍÓÚÜ_@-][0-9a-zA-ZÑñáéíóúüÁÉÍÓÚÜ_@-]*($|,)/;

json4all.stringifyAnyPlace = function stringifyAnyPlace(value){
    return JSON.stringify(value, json4all.replacer);
};

var SEPARATOR = {',':true}

function maxConsumer(){
    var fun = function([value, length]){
        if (length > fun.result) fun.result = length;
        return value
    }
    fun.result = null;
    return fun;
}

json4all.maxConsumer = maxConsumer;

json4all.mesureString = function mesureString(value, mesuringAlso){
    var currentSeparator = null;
    var currentLength = 0;
    var maxLenght = 0;
    for (var char of value) {
        if (SEPARATOR[char] || char === mesuringAlso) {
            if (currentSeparator != char) {
                currentLength = 0
                currentSeparator = char
            }
            currentLength++
            if (currentLength > maxLenght) maxLenght = currentLength
        } else {
            currentSeparator = null;
        }
    }
    return [value, maxLenght]
}

json4all.quoteString = function quoteString(text, mesuringAlso){
    var value = directStringRegExp.test(text) ? text : JSON.stringify(text);
    return json4all.mesureString(value,mesuringAlso);
}

var STAR = '*';

json4all.toUrl = function toUrl(value){
    return json4all.toUrlConstruct(value)[0];
}

var repeat = (str, count) => Array.prototype.concat(new Array(count +1)).join(str);

json4all.toUrlConstruct = function toUrlConstruct(value){
    if(value === null) return ["null",0];
    if(value === undefined) return ["*!undefined",0];
    if(value instanceof Function) return ["*!unset",0];
    var typeName = constructorName(value);
    if(typeof value === "string"){ 
        if(value[0] === STAR){
            return json4all.mesureString(STAR + value);
        }else{
            return json4all.quoteString(value);
        }
    } else if (value && typeof value === "object" && !value[RefKey] && !(value instanceof Array) ) {
        if(!json4all.directTypes[typeName]){
            var typeDef=types[typeName];
            if(typeDef /* && (!onlyValues || typeDef.valueLike)*/){
                var serializedValue = typeDef.serialize(value)
                if(typeof serializedValue === "string") return json4all.mesureString(STAR + serializedValue);
                var [serializedValue, ...serializedRest] = serializedValue
                return [STAR + serializedValue, ...serializedRest]
            }else{
                console.log("JSON4all.stringify unregistered object type", typeName);
                throw new Error("JSON4all.stringify unregistered object type");
            }
        } else {
            var result = []
            var cantSimplify = false;
            var max = maxConsumer();
            for (var attr in value) {
                var pair = [max(json4all.toUrlConstruct(attr, ':')), max(json4all.toUrlConstruct(value[attr]))]
                result.push(pair);
            }
            var lengthSep = max.result + 1;
            var PairSep = repeat(':',lengthSep);
            var ListSep = repeat(',',lengthSep);
            if (!cantSimplify && result.length){
                return [STAR + ListSep + result.map(pair=>pair.join(PairSep)).join(ListSep), lengthSep];
            }
        }
    }
    return json4all.mesureString(JSON.stringify(value, json4all.replacer));
};

json4all.stringify = json4all.stringifyAnyPlace;

json4all.convertPlain2$special = function convertPlain2$special(o, internally){
    if(o!=null && o instanceof Object){
        for(var key in o){
            /* istanbul ignore next */
            var realKey = o[key]===undefined && !isNaN(key)?Number(key):key;
            json4all.convertPlain2$special(o[key], true);
            var newValue = json4all.reviver(key, o[key]); 
            if(newValue===undefined && !(o instanceof Array)){
                delete o[key];
            }else{
                o[key] = newValue;
            }
        }
    }
    if(!internally){
        return json4all.reviver('', o);
    }
};

json4all.isTesting = true;

json4all.getPlainObject = function getPlainObject(payload){
    var i = 0;
    var PairSep = '';
    var ListSep = '';
    while (i < payload.length && payload[i] === ',') { i++; ListSep += ','; PairSep += ':' }
    var result = {}
    var parts = payload.substring(i).split(ListSep);
    for (var part of parts) {
        var pos = part.indexOf(PairSep);
        if (pos < 0) {
            throw new Error('JSON4all.parse error. Lack of colon "' + PairSep + '" in object');
        }
        var value = json4all.parse(part.substr(pos + i), true);
        if (value !== InternalValueForUnset) {
            result[json4all.parse(part.substr(0, pos))] = value
        }
    }
    return result;
}

json4all.parse = function parse(text, inner){
    if (text[0] === STAR) {
        var payload = text.substring(1);
        if (payload[0] === STAR) return payload;
        if (payload[0] === '!') {
            if (payload === '!undefined') return undefined;
            if (payload === '!unset') {
                console.log('********************* UNSET',text, inner)
                return inner ? InternalValueForUnset : undefined;
            }
            throw new Error('JSON4all.parse unrecognize *! token')
        }
        if (payload[0] === ',') {
            return json4all.getPlainObject(payload);
        }
        for (var typeName in types) {
            var typeDef = types[typeName];
            var okDetected = null;
            /* istanbul ignore next */
            if(!typeDef.deserialize){
                throw new Error("JSON4all.parse type without deserialize: "+typeName)
            }
            var valueOk = null;
            var {ok, value} = typeDef.deserialize(payload);
            if(ok){
                valueOk = value;
                if(json4all.isTesting){
                    if (okDetected) {
                        console.log("More than one way",typeName,okDetected,text,value,valueOk);
                        throw Error("")
                    }
                    okDetected = typeName;
                }
                break;
            }
        }
        if (okDetected) return valueOk;
    }else if (typeof text === "string" && !directRegExp.test(text)) {
        return text;
    }
    /* istanbul ignore next */ // For IE compatibility
    if(thisPlatformHasReplacerBug){
        var parsed=JSON.parse(text);
        return json4all.convertPlain2$special(parsed);
    } else {
        return JSON.parse(text, json4all.reviver);
    }
};

json4all.addType = function addType(typeConstructor, functions, skipIfExists){
    functions = functions || {};
    var constructorName = typeof typeConstructor === 'string'? typeConstructor: functionName(typeConstructor);
    if(skipIfExists && types[constructorName]){
        return;
    }
    var prefix = '@' + constructorName
    types[constructorName]={
        construct: functions.construct || function construct(plainValue, constructor){
            return typeConstructor.JSON4reviver(plainValue, constructor);
        },
        deconstruct: functions.deconstruct || function deconstruct(o){
            return o.JSON4replacer();
        },
        specialTag: functions.specialTag || function specialTag(value){
            return constructorName;
        },
        serialize: functions.serialize ?? function serialize(o){
            var plainObject = 'JSON4replacer' in typeConstructor.prototype ? o.JSON4replacer() : functions.deconstruct(o);
            var [value, max] =  json4all.toUrlConstruct(plainObject)
            return [prefix + value.substring(1), max];
        },
        deserialize: functions.deserialize || function deserialize(plainValue){
            if (plainValue.startsWith(prefix + ',')) {
                var plainObject = json4all.parse(STAR + plainValue.substring(prefix.length),constructor);
                return {
                    ok:true, 
                    value:'JSON4replacer' in typeConstructor.prototype ? typeConstructor.JSON4reviver(plainObject, typeConstructor) : functions.construct(plainObject, typeConstructor)
                }
            }
            return {ok:false}
        },
        valueLike: functions.valueLike || typeConstructor.JSON4valueLike
    };
    if(typeof typeConstructor === 'function'){
        types[constructorName].constructor = typeConstructor;
    }
};

var NativeDateRegExp = /^\d\d\d\d-\d\d-\d\dT\d\d:\d\d:\d\d(\.\d*)?Z$/;

json4all.DateFunctions = {
    construct: function construct(plainValue){ 
        return new Date(plainValue); 
    }, 
    deconstruct: function deconstruct(o){
        return o.getTime();
    },
    serialize: function serialize(o){
        return o.toISOString();
    },
    deserialize: function deserialize(plainValue){
        var ok = NativeDateRegExp.test(plainValue);
        var value = ok && new Date(plainValue) || null;
        return {ok, value};
    },
    valueLike: true
}

json4all.addType(Date, json4all.DateFunctions, true);

json4all.addType(RegExp, {
    construct: function construct(plainValue){ 
        return new RegExp(plainValue.source, plainValue.flags); 
    }, 
    deconstruct: function deconstruct(o){
        return {source: o.source, flags: o.toString().substring(o.toString().lastIndexOf('/')+1)};
    },
    serialize: function serialize(o){
        return '/' + o.source + '/' + o.flags;
    },
    deserialize: function deserialize(plainValue){
        var ok = false
        var value = null;
        plainValue.replace(/^\/(.+)\/(\w*)$/, function(_, pattern, flags){
            value = new RegExp(pattern, flags)
            ok = true;
        });
        return {ok, value};
    },
    valueLike: true
});

json4all._types = types;

const RefKey = Symbol("RefKey for RefMap")

json4all.RefKey = RefKey;
// export class RefMap<K extends keyof object, V extends any> extends Map<K, V>{

json4all.RefStoreSpace = (myCollection)=>{
    json4all.$RefStoreSpace = myCollection;
}


/** 
 * @type {<K extends string|number|symbol, V extends {}> (path:(string|number|symbol)[]) => Partial<{[key in V]:v}} 
 * */
json4all.RefStore = (path)=>{
    var myCollection = json4all.$RefStoreSpace;
    /** @type {Partial<{[key in K]:V}>}  */
    var o = {}
    var p= new Proxy(o, {
        /*
        get:function(target, prop, _receiver) {
            return target[prop];
        },
        */
        /** @param {Partial<{[key in K]:V}>} target */
        /** @param {K} prop */
        /** @param {V} value */
        set:function(target, prop, value){
            if(
                // @ts-expect-error RefKey no está en el tipo original
                value[RefKey] == null 
            ){
                // @ts-expect-error RefKey no está en el tipo original
                value[RefKey] = [path, prop];
            }else if(
                // @ts-expect-error RefKey no está en el tipo original
                value[RefKey][1] != prop
            ){
                console.log("This value was stored in another place", path, prop)
                throw new Error("This value was stored in another place")
            }
            return Reflect.set(target, prop, value);
        }
    });
    myCollection[path[0]] = p;
    return p;
}

json4all.$props2serialize = Symbol("props2serialize")

json4all.addProperty = function(constructorPosition){
    var innerFunction = (classPrototype, prop, index)=>{
        if(!(json4all.$props2serialize in classPrototype)){
            classPrototype[json4all.$props2serialize] = []
        }
        var info={name:prop}
        if(typeof constructorPosition === "number") info.construct = constructorPosition
        classPrototype[json4all.$props2serialize].push(info)
    }
    if(typeof constructorPosition === "number"){
        return innerFunction
    }else{
        return innerFunction(...arguments)
    }
}

json4all.pretendClass = function(object, Constructor){
    object[json4all.PretendedClass] = Constructor
    // @ts-expect-error
    object.JSON4replacer = Constructor.prototype.JSON4replacer;
    // @ts-expect-error
    // object[JSON4all.$props2serialize] = Constructor.prototype[JSON4all.$props2serialize];
}

json4all.addClass = (constructor)=>{
    if(!(json4all.$props2serialize in constructor.prototype)){
        throw new Error("must add parameters or properties")
    }
    var propList = constructor.prototype[json4all.$props2serialize];
    constructor.prototype.JSON4replacer = function(){
        var o = {};
        for(var prop of propList){
            o[prop.name] = this[prop.name]
        }
        return o;
    };
    constructor.JSON4reviver = function(value, constructor){
        var constructParams = propList.filter(p=>p.construct!=null).map(p=>value[p.name])
        var o = new constructor(...constructParams);
        for(var p of propList){
            if(!p.construct){
                o[p.name] = value[p.name]
            }
        }
        return o;
    }
    json4all.addType(constructor)
}

return json4all;

});
