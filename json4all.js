"use strict";

var JSON4all = {};

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

JSON4all.replacer = function replacer(key, value){
    var realValue=this==null?null:this[key];
    if(realValue===undefined || realValue!==null && realValue instanceof Function){
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
    if(realValue!=null && realValue instanceof Object){
        var typeName = realValue.constructor.name;
        if(types[typeName]){
            return {$special:typeName, $value: types[typeName].deconstruct(realValue)};
        }
    }
    return value;
}

JSON4all.reviver = function reviver(key, value){
    if(key==='$escape'){
        return value;
    }else if(value!=null && value.$special){
        if(types[value.$special]){
            return new types[value.$special].construct(value.$value);
        }else if(value.$special=='undefined'){
            return undefined;
        }
    }else if(value!=null && value.$escape){
        return value.$escape;
    }
    return value;
}

JSON4all.stringify = function stringify(value){
    return JSON.stringify(value, JSON4all.replacer);
}

JSON4all.parse = function parse(text){
    return JSON.parse(text, JSON4all.reviver);
}

JSON4all.addType = function addType(typeConstructor){
    types[typeConstructor.name]={
        construct: function construct(value){
            return typeConstructor.JSON4reviver(value);
        },
        deconstruct: function deconstruct(o){
            return o.toJSON4replacer();
        }
    };
}

module.exports = JSON4all;
