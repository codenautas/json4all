"use strict";

var epjson = {};

epjson.replacer = function replacer(key, value){
    console.log(['xxx replacer'],key,value, typeof value, this[key]);
    if(key && (/*'$escape' in this || */ '$date' in this || '$undefined' in this || '$type' in this)){
        return {$escape: value};
    }
    if(this[key]===undefined || this[key]!==null && this[key] instanceof Function){
        console.log('xxx UNDEFINED replacer',key,value, typeof value);
        return {"$undefined": true};
    }
    if(this[key]!=null && this[key] instanceof Date){
        console.log('xxx THIS KEY replacer',key,value, typeof value);
        return {$date: this[key].getTime()};
    }
    return value;
}

epjson.reviver = function reviver(key, value){
    console.log('xxx reviver',key,value, typeof value);
    if(value!=null && value.$date){
        return new Date(value.$date);
    }
    if(value!=null && value.$undefined){
        return undefined;
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
