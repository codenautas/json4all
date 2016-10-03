
console.log('window', window.expect, window.require);

if(!window.require.definedModules){
    window.require.definedModules={};
}

[{name:'expect.js', alias:'expect'}].forEach(function(moduleDef){
    console.log('moduleDef',moduleDef);
    if(window[moduleDef.alias]){
        window.require.definedModules[moduleDef.name] = window[moduleDef.alias];
    }
});

console.log('aca avanza',window.require.definedModules)