import type * as assertExternal from 'assert';
import type * as discrepancesExternal from 'discrepances';

var assert: typeof assertExternal;
var discrepances: typeof discrepancesExternal;
var code: string

export function setBase(newCode:string){
    code = newCode;
    if (code == 'assert') {
        assert = require('assert')
    } else {
        discrepances = require('discrepances')
        if (discrepances == null) {
            console.log('discrepances', discrepances)
        }
    }
}

export function equal<T>(a:T, b:T){
    if (code == 'assert') {
        assert.equal(a,b);
    } else {
        discrepances.showAndThrow(a,b);
    }
}

export function deepEqual<T>(a:T, b:T){
    if (code == 'assert') {
        assert.deepEqual(a,b);
    } else {
        discrepances.showAndThrow(a,b);
    }
}

export function ok(a:boolean, message?:string){
    if (code == 'assert') {
        assert.ok(a, message);
    } else {
        discrepances.showAndThrow(a,true,{showContext:message});
    }
}

export function throws(fun:()=>void, info:{message:string}){
    if (code == 'assert') {
        assert.throws(fun, info);
    } else {
        var err: any;
        try {
            fun()
        } catch (e) {
            err = e;
        }
        discrepances.showAndThrow(err, message);
    }
}
