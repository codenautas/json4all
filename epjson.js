"use strict";

var epjson = {};

var SymbolInternal='394fjasifqwenvnv';

function SymbolInternalx(){
    throw new Error('this is a symbol, not a function');
}

var tooMuch=10;

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
        if(!tooMuch--){
            throw new Error('too much');
        }
        return {$escape: realValue/*, $internal:SymbolInternal*/};
    }
    if(realValue!=null && realValue instanceof Date){
        console.log('xxx THIS KEY replacer',key,value, typeof value);
        return {$special:'Date', $date: realValue.getTime()/*, $internal:SymbolInternal*/};
    }
    return value;
}

epjson.reviver2 = function reviver(key, value){
    const prefix = '{"$special":';
    console.log(['xxx reviver'],key,value, typeof value, '==>', typeof value === 'string'?value.substring(0,prefix.length):'');
    if(typeof value === 'string' && value.substring(0,prefix.length)===prefix){
        var specialObject = epjson.parse(value);
        console.log('ZZZZZ special',specialObject)
        if(specialObject.$special=='Date'){
            return new Date(value.$date);
        }else if(specialObject.$special=='undefined'){
            return undefined;
        }
        return specialObject;
    }
    return value;
}

epjson.reviver = function reviver(key, value){
    console.log('xxx reviver',key,value, typeof value);
    if(key==='$escape'){
        // value.$internal='true';
        return value;
    }else if(value!=null && value.$special){
        if(value.$special=='Date'){
            return new Date(value.$date);
        }else if(value.$special=='undefined'){
            return undefined;
        }
    }else if(value!=null && value.$escape){
        if(value.$escape.$internal || true ){
            delete value.$escape.$internal;
            return value.$escape;
        }
        return value;
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

epjson.addType = function addType(typeName, factory){
    
}

module.exports = epjson;
