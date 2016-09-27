"use strict";

var epjson = {};

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
            return {source: o.source, flags: o.toString().substring(o.toString().lastIndexOf('/')+1)}
        }
    }
};

var SymbolInternal='394fjasifqwenvnv';

function SymbolInternalx(){
    throw new Error('this is a symbol, not a function');
}

epjson.replacer = function replacer(key, value){
    // if(key==='$special'){
    //     return {$escape: }
    // }
    // if(key && (('$special' in this || '$escape' in this) && this.$escaping!='escaping')){
    //     return JSON.stringify({$escape: value});
    // }
    var realValue=this==null?null:this[key];
    console.log(['xxx replacer'],key,value, typeof value, this[key], '->', realValue, typeof realValue);
    // if(realValue===SymbolInternal){
    //     return undefined;
    // }
    if(realValue===undefined || realValue!==null && realValue instanceof Function){
        console.log('xxx UNDEFINED replacer',key,value, typeof value);
        return {$special: "undefined"};
    }
    if(realValue===null || typeof realValue!=='object'){
        console.log('typeof realValue', typeof realValue, realValue)
        return value;
    }
    if(key==='$escape'){
        return value;
    }
    if('$special' in realValue || '$escape' in realValue /*&& realValue.$internal!==SymbolInternal*/){
        console.log("$$$$SPECIAL", realValue)
        // return JSON.stringify({$escape: value});
        return {$escape: realValue/*, $internal:SymbolInternal*/};
    }
    if(realValue!=null && realValue instanceof Object){
        var typeName = realValue.constructor.name;
        if(types[typeName]){
            console.log('xxx THIS KEY replacer',key,value, typeof value, typeName);
            return {$special:typeName, $value: types[typeName].deconstruct(realValue)/*, $internal:SymbolInternal*/};
        }
    }
    return value;
}

epjson.reviver = function reviver(key, value){
    console.log('xxx reviver',key,value, typeof value);
    if(key==='$escape'){
        return value;
    }else if(value!=null && value.$special){
        if(types[value.$special]){
            return new types[value.$special].construct(value.$value);
        // }else if(value.$special=='Date'){
        //     return new Date(value.$value);
        }else if(value.$special=='undefined'){
            return undefined;
        }
    }else if(value!=null && value.$escape){
        return value.$escape;
    }
    return value;
}

epjson.stringify = function stringify(value){
    console.log('xxx stringify',value);
    return JSON.stringify(value, epjson.replacer);
}

epjson.parse = function parse(text){
    console.log(['xxx parse'],text);
    return JSON.parse(text, epjson.reviver);
}

epjson.addType = function addType(typeConstructor){
    types[typeConstructor.name]={
        construct: function construct(value){
            return typeConstructor.JSON4reviver(value);
        },
        deconstruct: function deconstruct(o){
            return o.toJSON4replacer();
        }
    };
}

module.exports = epjson;
