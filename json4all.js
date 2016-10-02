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
    if('name' in fun){
        return fun.name;
    }else{
        return fun.toString().replace(/^\s*function\s*([^(]*)\((.|\s)*$/i,'$1');
    }
}

function constructorName(obj) {
    return functionName(obj.constructor);
}

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
});

var thisPlatformHasReplacerBug = false;

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
    if(typeName==="Object" || typeName==="Array" || !typeName){
        return value;
    }else if(types[typeName]){
        return {$special:typeName, $value: types[typeName].deconstruct(realValue)};
    }else{
        console.log("JSON4all.stringify unregistered object type", typeName);
        throw new Error("JSON4all.stringify unregistered object type");
    }
};

json4all.reviver = function reviver(key, value){
    var log=false;
    if(key==='$escape'){
        return value;
    }else if(value!==null && value.$special){
        if(value.$special==='undefined'){
            return undefined;
        }else if(types[value.$special]){
            return new types[value.$special].construct(value.$value);
        }else{
            console.log("JSON4all.parse invalid $special", value.$special);
            throw new Error("JSON4all.parse invalid $special");
        }
    }else if(value!==null && value.$escape){
        return value.$escape;
    }
    return value;
};

json4all.stringify = function stringify(value){
    return JSON.stringify(value, json4all.replacer);
};

if(thisPlatformHasReplacerBug){
    var reviveAll = function reviveAll(o){
        if(o!=null && o instanceof Object){
            for(var key in o){
                /* istanbul ignore next */
                var realKey = o[key]===undefined && !isNaN(key)?Number(key):key;
                // if(o.hasOwnProperty(key)){
                    var newValue = json4all.reviver(key, o[key]); 
                    if(newValue===undefined/* && !(o instanceof Array)*/){
                        delete o[key];
                    }else{
                        o[key] = newValue;
                    }
                // }
            }
        }
    };
    json4all.parse = function parse(text){
        var parsed=JSON.parse(text);
        reviveAll(parsed);
        return json4all.reviver('', parsed);
    };
}else{
    json4all.parse = function parse(text){
        return JSON.parse(text, json4all.reviver);
    };
}

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