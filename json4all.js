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

function functionName(fun) {
    /* istanbul ignore next */
    if('name' in fun){
        return fun.name;
    }else{
        return fun.toString().replace(/^\s*function\s*([^(]*)\((.|\s)*$/i,'$1');
    }
}

function constructorName(obj) {
    return functionName(obj.constructor);
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
            console.log('********* json4all ref collection invalid', plainValue, json4all.$RefStoreSpace)
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
        console.log('**********', plainValue, result)
    }
    return result;
};

json4all.stringify = function stringify(value){
    return JSON.stringify(value, json4all.replacer);
};

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

/* istanbul ignore next */ // For IE compatibility
if(thisPlatformHasReplacerBug){
    console.log('thisPlatformHasReplacerBug', window.navigator.userAgent)
    json4all.parse = function parse(text){
        var parsed=JSON.parse(text);
        return json4all.convertPlain2$special(parsed);
    };
}else{
    json4all.parse = function parse(text){
        return JSON.parse(text, json4all.reviver);
    };
}

json4all.addType = function addType(typeConstructor, functions, skipIfExists){
    functions = functions || {};
    var constructorName = typeof typeConstructor === 'string'? typeConstructor: functionName(typeConstructor);
    if(skipIfExists && types[constructorName]){
        return;
    }
    types[constructorName]={
        construct: functions.construct || function construct(plainValue, constructor){
            return typeConstructor.JSON4reviver(plainValue, constructor);
        },
        deconstruct: functions.deconstruct || function deconstruct(o){
            return o.JSON4replacer();
        },
        specialTag: functions.specialTag || function specialTag(value){
            return constructorName;
        }
    };
    if(typeof typeConstructor === 'function'){
        types[constructorName].constructor = typeConstructor;
    }
};

json4all.addType(Date,{
    construct: function construct(plainValue){ 
        return new Date(plainValue); 
    }, 
    deconstruct: function deconstruct(o){
        return o.getTime();
    },
}, true);

json4all.addType(RegExp, {
    construct: function construct(plainValue){ 
        return new RegExp(plainValue.source, plainValue.flags); 
    }, 
    deconstruct: function deconstruct(o){
        return {source: o.source, flags: o.toString().substring(o.toString().lastIndexOf('/')+1)};
    }
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
                value[RefKey][0] != key
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
        console.log('////////////////////////// addProperty',classPrototype, prop, index)
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

json4all.replacerFromProps2serialize = function(){
    var propList = this[json4all.$props2serialize];
    var o = {};
    for(var prop of propList){
        o[prop.name] = this[prop.name]
    }
    return o;
}

json4all.addClass = (constructor)=>{
    console.log(constructor);
    if(!(json4all.$props2serialize in constructor.prototype)){
        throw new Error("must add parameters or properties")
    }
    var propList = constructor.prototype[json4all.$props2serialize];
    constructor.prototype.JSON4replacer = json4all.replacerFromProps2serialize;
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
