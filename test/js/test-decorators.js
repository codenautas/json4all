var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "assert", "../../json4all"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const assert_1 = require("assert");
    const JSON4all = require("../../json4all");
    class Two {
        constructor(name) {
            this.name = name;
        }
    }
    JSON4all.addType(Two, {
        construct: JSON4all.nonymizate,
        deconstruct: JSON4all.anonymizate
    });
    let ThreeBase = class ThreeBase {
        constructor(id) {
            this.age = 0;
            this.id = id;
        }
    };
    __decorate([
        JSON4all.addProperty(1)
    ], ThreeBase.prototype, "id", void 0);
    __decorate([
        JSON4all.addProperty
    ], ThreeBase.prototype, "name", void 0);
    __decorate([
        JSON4all.addProperty
    ], ThreeBase.prototype, "age", void 0);
    ThreeBase = __decorate([
        JSON4all.addClass
    ], ThreeBase);
    let Three = class Three extends ThreeBase {
        constructor() {
            super(...arguments);
            this.other = "Other";
            this.another = null;
        }
    };
    Three = __decorate([
        JSON4all.addClass
    ], Three);
    describe("---- TYPESCRIPT Referenceable objects", () => {
        // @ts-expect-error global
        if (!global.mySpace) {
            global.mySpace = {};
            JSON4all.RefStoreSpace(global.mySpace);
        }
        // @ts-expect-error global
        var mySpace = global.mySpace;
        var collection = JSON4all.RefStore(['TheCollection']);
        it("adds element to collection", () => {
            collection.one = { name: 'the name' };
            assert_1.strict.equal(mySpace.TheCollection, collection);
            assert_1.strict.deepEqual(
            // @ts-expect-error RefKey no es parte del objeto original
            collection.one[JSON4all.RefKey], [['TheCollection'], 'one']);
        });
        it("serializes the reference", () => {
            var two = new Two('Name');
            collection.two = two;
            var str = JSON4all.stringify(two);
            assert_1.strict.deepEqual(str, `{"$special":"Two","$value":{"name":"Name"},"$ref":[["TheCollection"],"two"]}`);
            var plain = JSON.parse(str);
            assert_1.strict.deepEqual(plain, { $special: 'Two', $value: { name: 'Name' }, $ref: [['TheCollection'], 'two'] });
        });
        it("deserializes a reference", () => {
            var two = JSON4all.parse(`{"$ref":[["TheCollection"],"two"],"$special":"Two","$value":{"name":"Other","more":1}}`);
            (0, assert_1.strict)(two instanceof Two);
            assert_1.strict.equal(two.name, "Name");
        });
        it("inexistent collection", () => {
            assert_1.strict.throws(() => {
                JSON4all.parse(`{"$ref":[["InexistentCollection"],"two"],"$special":"Two","$value":{"name":"Other","more":1}}`);
            }, "xxx");
        });
        it("inexistent key", () => {
            assert_1.strict.throws(() => {
                JSON4all.parse(`{"$ref":[["TheCollection"],"no-key"],"$special":"Two","$value":{"name":"Other","more":1}}`);
            }, "xxx");
        });
        it("rejects to one instance in two places", () => {
            var two = new Two('Name');
            collection.two = two;
            collection.two = two;
            assert_1.strict.throws(() => {
                collection.dos = two;
            }, "xxx");
        });
        it("rejects class without properties", () => {
            assert_1.strict.throws(() => {
                let NoParams = class NoParams {
                };
                NoParams = __decorate([
                    JSON4all.addClass
                ], NoParams);
                console.log(!NoParams);
            }, "xxx");
        });
    });
    describe("decorators", () => {
        it("has prop list", () => {
            assert_1.strict.deepEqual(
            // @ts-expect-error mirando la intervención:
            ThreeBase.prototype[JSON4all.$props2serialize], [
                { name: "id", construct: 1 },
                { name: "name" },
                { name: "age" },
            ]);
        });
        it("serialize only registereds in base", () => {
            var threeBase = new ThreeBase('id3');
            var str = JSON4all.stringify(threeBase);
            var plain = JSON.parse(str);
            assert_1.strict.deepEqual(plain, {
                "$special": "ThreeBase",
                "$value": {
                    "id": "id3",
                    "age": 0,
                    "name": {
                        "$special": "undefined"
                    }
                }
            });
            str = JSON4all.toUrl(threeBase);
            assert_1.strict.deepEqual(str, `*@ThreeBase,id:id3,name:*!undefined,age:0`);
            var o = JSON4all.parse(str);
            assert_1.strict.ok(o instanceof ThreeBase);
            var str2 = JSON4all.toUrl(o);
            assert_1.strict.deepEqual(str, str2);
        });
        it("serialize only registereds", () => {
            var three = new Three('ID3');
            three.age = 4;
            three.another = "present!";
            var str = JSON4all.stringify(three);
            var plain = JSON.parse(str);
            assert_1.strict.deepEqual(plain, {
                "$special": "Three",
                "$value": {
                    "id": "ID3",
                    "age": 4,
                    "name": {
                        "$special": "undefined"
                    }
                }
            });
            var str = JSON4all.toUrl(three);
            assert_1.strict.deepEqual(str, `*@Three,id:ID3,name:*!undefined,age:4`);
            var o = JSON4all.parse(str);
            assert_1.strict.ok(o instanceof ThreeBase);
            var str2 = JSON4all.toUrl(o);
            assert_1.strict.deepEqual(str, str2);
        });
        it("serialize a anonymous object like a registered one", () => {
            var threeLike = {
                id: "ID3",
                age: 4,
                other: "do not pass this"
            };
            JSON4all.pretendClass(threeLike, Three);
            var str = JSON4all.stringify(threeLike);
            var plain = JSON.parse(str);
            assert_1.strict.deepEqual(plain, {
                "$special": "Three",
                "$value": {
                    "id": "ID3",
                    "age": 4,
                    "name": {
                        "$special": "undefined"
                    }
                }
            });
            var str = JSON4all.toUrl(threeLike);
            assert_1.strict.deepEqual(str, `*@Three,id:ID3,name:*!undefined,age:4`);
            var o = JSON4all.parse(str);
            assert_1.strict.ok(o instanceof ThreeBase);
            var str2 = JSON4all.toUrl(o);
            assert_1.strict.deepEqual(str, str2);
        });
    });
    describe("decorators and references", () => {
        var threes = JSON4all.RefStore(['Threes']);
        it("serialize a registered object", () => {
            var three = new Three("ID4");
            three.name = "Referenced Name";
            three.another = "Grr!";
            threes.x3 = three;
            assert_1.strict.deepEqual(
            // @ts-expect-error RefKey es interna
            three[JSON4all.RefKey], [['Threes'], 'x3']);
            assert_1.strict.equal(threes.x3, three);
            assert_1.strict.deepEqual(threes.x3, three);
            var str = JSON4all.stringify(three);
            assert_1.strict.equal(str, `{"$special":"Three","$value":{"id":"ID4","name":"Referenced Name","age":0},"$ref":[["Threes"],"x3"]}`);
        });
        it("deserializa a registered object", () => {
            var strFaked = `{"$special":"Three","$value":{"id":"ID5","name":"FAKED!!!!","age":9999,"other":"STOP!"},"$ref":[["Threes"],"x3"]}`;
            var three = JSON4all.parse(strFaked);
            assert_1.strict.equal(threes.x3, three);
            assert_1.strict.deepEqual(threes.x3, three);
            var str = JSON4all.stringify(three);
            assert_1.strict.equal(str, `{"$special":"Three","$value":{"id":"ID4","name":"Referenced Name","age":0},"$ref":[["Threes"],"x3"]}`);
            assert_1.strict.deepEqual(
            // @ts-expect-error RefKey es interna
            three[JSON4all.RefKey], [['Threes'], 'x3']);
        });
        it("deserializa a registered object without $value field", () => {
            var strFaked = `{"$special":"Three","$ref":[["Threes"],"x3"]}`;
            var three = JSON4all.parse(strFaked);
            assert_1.strict.equal(threes.x3, three);
            assert_1.strict.deepEqual(threes.x3, three);
            var str = JSON4all.stringify(three);
            assert_1.strict.equal(str, `{"$special":"Three","$value":{"id":"ID4","name":"Referenced Name","age":0},"$ref":[["Threes"],"x3"]}`);
            assert_1.strict.deepEqual(
            // @ts-expect-error RefKey es interna
            three[JSON4all.RefKey], [['Threes'], 'x3']);
        });
    });
    describe("decorators and references in ClientSide", () => {
        before(() => {
            // @ts-expect-error quito el ref como si nunca lo hubiera tenido. 
            JSON4all.RefStoreSpace(undefined);
        });
        after(() => {
            // @ts-expect-error global
            if (!global.mySpace) {
                throw new Error('No existe mySpace');
            }
            // @ts-expect-error global
            JSON4all.RefStoreSpace(global.mySpace);
        });
        it("deserializa a registered object in clientSide", () => {
            var strFromServer = `{"$special":"Three","$value":{"id":"ID4","name":"Referenced Name","age":0},"$ref":[["Threes"],"x3"]}`;
            var three = JSON4all.parse(strFromServer);
            var str = JSON4all.stringify(three);
            assert_1.strict.equal(str, `{"$special":"Three","$ref":[["Threes"],"x3"]}`);
            assert_1.strict.deepEqual(
            // @ts-expect-error RefKey es interna
            three[JSON4all.RefKey], [['Threes'], 'x3']);
        });
        it("serialize a registered object in clientSide", () => {
            var three = new Three("ID4");
            three.name = "Referenced Name";
            three.another = "Grr!";
            // @ts-expect-error RefKey es interna
            three[JSON4all.RefKey] = [['Threes'], 'x3'];
            var str = JSON4all.stringify(three);
            assert_1.strict.equal(str, `{"$special":"Three","$ref":[["Threes"],"x3"]}`);
        });
    });
});
