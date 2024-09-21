declare namespace json4all{
    type AddTypeFunctions={
        construct:<T>(value:object, Constructor:Function)=>T
        deconstruct?:<T>(object:T)=>object
        specialTag?:<T>(object:T)=>string
    }
    function parse<T>(jsonText:string):T
    function stringify(object:any):string
    function toUrl(object:any):string
    function toUrlLines(object:any, eol?:string):string
    function addType(className:string, functions:AddTypeFunctions, skipIfExists?:boolean):void
    function addType(constructor:Function, functions?:AddTypeFunctions, skipIfExists?:boolean):void
    function anonymizate<T>(classedObject:T):object
    function nonymizate<T>(plainValue:object, Constructor:Function):T
    function RefStoreSpace(globalSpace:object):void
    function RefStore<K extends string|number|symbol, V>(path:(string|number|symbol)[]):{[key in K]: V}
    const RefKey:symbol
    function pretendClass(plainValue:object, Constructor:Function):void
    // DECORATORS SYSTEM:
    const $props2serialize:symbol
    function addClass(constructor:Function):void
    function addProperty(prototype:Object, prop:string):void
    function addProperty(constructorPosition:number):(prototype:Object, prop:string)=>void
}
export = json4all
