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
    var name = fun.name;
    if(!name){
        return fun.toString().replace(/^\s*function\s*([^(]*)\((.|\s)*$/i,'$1');
    }
    return name;
};

function constructorName(obj) {
    return functionName(obj.constructor);
};

var types={
    Date  : {
        construct: function construct(value){ 
            return new Date(value); 
        }, 
        deconstruct: function deconstruct(o){
            return o.getTime();
        }
    },
    RegExp: {
        construct: function construct(value){ 
            return new RegExp(value.source, value.flags); 
        }, 
        deconstruct: function deconstruct(o){
            return {source: o.source, flags: o.toString().substring(o.toString().lastIndexOf('/')+1)};
        }
    }
};

var thisPlatformSkipsUndefinedInArrays = true;

JSON.stringify([undefined],function(key, value){
    if(key==='0'||key===0){
        thisPlatformSkipsUndefinedInArrays = false;
    }
    return value;
})

/* istanbul ignore next */
function InternalValueForUndefined(){ 
    /* istanbul ignore next */
    throw new Error('this is not a function'); 
}

json4all.replacer = function replacer(key, value){
    var realValue = this[key];
    if(realValue===InternalValueForUndefined){
        this[key]=undefined;
    }
    if(realValue===undefined || typeof realValue === "undefined" || realValue!==null && realValue instanceof Function){
        return {$special: "undefined"};
    }
    if(realValue===null || typeof realValue!=='object'){
        return value;
    }
    if(key==='$escape'){
        return value;
    }
    if('$special' in realValue || '$escape' in realValue){
        return {$escape: realValue};
    }
    if(thisPlatformSkipsUndefinedInArrays && realValue!==null){
        if(realValue instanceof Array){
            for(var i=0; i<realValue.length; i++){
                if(typeof realValue[i] === 'undefined'){
                    realValue[i] = InternalValueForUndefined;
                }
            }
            return realValue;
        }
    }
    var typeName = constructorName(realValue);
    if(typeName==="Object" || typeName==="Array"){
        return value;
    }else if(types[typeName]){
        return {$special:typeName, $value: types[typeName].deconstruct(realValue)};
    }else{
        throw new Error("JSON4all.stringify unregistered object type");
    }
};

json4all.reviver = function reviver(key, value){
    if(key==='$escape'){
        return value;
    }else if(value!=null && value.$special){
        if(types[value.$special]){
            return new types[value.$special].construct(value.$value);
        }else if(value.$special=='undefined'){
            return undefined;
        }else{
            throw new Error("JSON4all.parse invalid $special");
        }
    }else if(value!=null && value.$escape){
        return value.$escape;
    }
    return value;
};

json4all.stringify = function stringify(value){
    return JSON.stringify(value, json4all.replacer);
};

json4all.parse = function parse(text){
    return JSON.parse(text, json4all.reviver);
};

json4all.addType = function addType(typeConstructor){
    types[functionName(typeConstructor)]={
        construct: function construct(value){
            return typeConstructor.JSON4reviver(value);
        },
        deconstruct: function deconstruct(o){
            return o.JSON4replacer();
        }
    };
};

return json4all;

});