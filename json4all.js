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

json4all.nonymizate = function(value, Constructor){
    var typedValue = new Constructor();
    for(var attr in value){
        typedValue[attr] = value[attr];
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
            return {$special: typeDef.specialTag(realValue), $value: typeDef.deconstruct(realValue)};
            // return {$special:'specialTag' in typeDef?typeDef.specialTag(realValue):typeName, $value: typeDef.deconstruct(realValue)};
        }else{
            console.log("JSON4all.stringify unregistered object type", typeName);
            throw new Error("JSON4all.stringify unregistered object type");
        }
    }
};

json4all.reviver = function reviver(key, value){
    var log=false;
    if(key==='$escape'){
        return value;
    }else if(value!==null && value.$special){
        if(value.$special==='undefined'){ 
            if(key===''){
                return undefined;
            }
            return InternalValueForUndefined;
        }else if(value.$special==='unset'){
            return undefined;
        }else{
            var typeDef=types[value.$special];
            if(typeDef){
                return new typeDef.construct(value.$value, typeDef.constructor);
            }else{
                console.log("JSON4all.parse invalid $special", value.$special);
                throw new Error("JSON4all.parse invalid $special");
            }
        }
    }else if(value!==null && value.$escape){
        return value.$escape;
    }
    if(value instanceof Object){
        for(var k in value){
            if(value[k]===InternalValueForUndefined){
                value[k]=undefined;
            }
        }
    }
    return value;
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
        construct: functions.construct || function construct(value){
            return typeConstructor.JSON4reviver(value);
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
    construct: function construct(value){ 
        return new Date(value); 
    }, 
    deconstruct: function deconstruct(o){
        return o.getTime();
    },
});

json4all.addType(RegExp, {
    construct: function construct(value){ 
        return new RegExp(value.source, value.flags); 
    }, 
    deconstruct: function deconstruct(o){
        return {source: o.source, flags: o.toString().substring(o.toString().lastIndexOf('/')+1)};
    }
});

json4all._types = types;

return json4all;

});
