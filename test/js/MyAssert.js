(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.throws = exports.ok = exports.deepEqual = exports.equal = exports.setBase = void 0;
    var assert;
    var discrepances;
    var code;
    function setBase(newCode) {
        code = newCode;
        if (code == 'assert') {
            assert = require('assert');
        }
        else {
            discrepances = require('discrepances');
            if (discrepances == null) {
                console.log('discrepances', discrepances);
            }
        }
    }
    exports.setBase = setBase;
    function equal(a, b) {
        if (code == 'assert') {
            assert.equal(a, b);
        }
        else {
            discrepances.showAndThrow(a, b);
        }
    }
    exports.equal = equal;
    function deepEqual(a, b) {
        if (code == 'assert') {
            assert.deepEqual(a, b);
        }
        else {
            discrepances.showAndThrow(a, b);
        }
    }
    exports.deepEqual = deepEqual;
    function ok(a, message) {
        if (code == 'assert') {
            assert.ok(a, message);
        }
        else {
            discrepances.showAndThrow(a, true, { showContext: message });
        }
    }
    exports.ok = ok;
    function throws(fun, message) {
        if (code == 'assert') {
            assert.throws(fun, message);
        }
        else {
            var err;
            try {
                fun();
            }
            catch (e) {
                err = e;
            }
            discrepances.showAndThrow(err, message);
        }
    }
    exports.throws = throws;
});
