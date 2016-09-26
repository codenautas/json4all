"use strict";

var epjson = {};

epjson.replacer = function replacer(key, value){
    // if(key==='$special'){
    //     return {$escape: }
    // }
    // if(key && (('$special' in this || '$escape' in this) && this.$escaping!='escaping')){
    //     return JSON.stringify({$escape: value});
    // }
    var realValue=this==null?null:this[key];
    console.log(['xxx replacer'],key,value, typeof value, this[key], '->', realValue, typeof realValue);
    if(realValue===undefined || realValue!==null && realValue instanceof Function){
        console.log('xxx UNDEFINED replacer',key,value, typeof value);
        return {$special: "undefined"};
    }
    if(realValue===null || typeof realValue!=='object'){
        console.log('typeof realValue', typeof realValue, realValue)
        return value;
    }
    if('$special' in realValue){
        console.log("$$$$SPECIAL")
        return JSON.stringify({$escape: value});
    }
    if(realValue!=null && realValue instanceof Date){
        console.log('xxx THIS KEY replacer',key,value, typeof value);
        return {$special:'Date', $date: realValue.getTime()};
    }
    return value;
}

epjson.reviver = function reviver(key, value){
    console.log('xxx reviver',key,value, typeof value);
    if(value!=null && value.$special){
        if(value.$special=='Date'){
            return new Date(value.$date);
        }else if(value.$special=='undefined'){
            return undefined;
        }
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
