import { strict as assert } from 'assert';
import * as JSON4all from '../../json4all'

class Two{
    constructor(public name:string){
    }
}

JSON4all.addType(Two,{
    construct: JSON4all.nonymizate,
    deconstruct: JSON4all.anonymizate
});


@JSON4all.addClass
class ThreeBase{
    @JSON4all.addProperty(1)
    public id:string
    @JSON4all.addProperty
    public name?:string
    @JSON4all.addProperty
    public age:number = 0
    constructor(id:string){ this.id = id; }
}

@JSON4all.addClass
class Three extends ThreeBase{
    public other:string = "Other"
    public another:string|null = null;
}

describe("---- TYPESCRIPT Referenceable objects", ()=>{
    // @ts-expect-error global
    if(!global.mySpace){ global.mySpace = {}; JSON4all.RefStoreSpace(global.mySpace); }
    // @ts-expect-error global
    var mySpace:any = global.mySpace;
    var collection = JSON4all.RefStore<string, Two|object>(['TheCollection']);
    it("adds element to collection", ()=>{
        collection.one = {name:'the name'};
        assert.equal(mySpace.TheCollection, collection);
        assert.deepEqual(
            // @ts-expect-error RefKey no es parte del objeto original
            collection.one[JSON4all.RefKey], 
            [['TheCollection'],'one']
        );
    });
    it("serializes the reference",()=>{
        var two = new Two('Name');
        collection.two = two;
        var str = JSON4all.stringify(two)
        assert.deepEqual(str, `{"$special":"Two","$value":{"name":"Name"},"$ref":[["TheCollection"],"two"]}`);
        var plain = JSON.parse(str);
        assert.deepEqual(plain, {$special:'Two', $value:{name:'Name'}, $ref:[['TheCollection'],'two']});
    })
    it("deserializes a reference", ()=>{
        var two = JSON4all.parse(`{"$ref":[["TheCollection"],"two"],"$special":"Two","$value":{"name":"Other","more":1}}`);
        assert(two instanceof Two);
        assert.equal(two.name, "Name");
    })
    it("inexistent collection", ()=>{
        assert.throws(()=>{
            JSON4all.parse(`{"$ref":[["InexistentCollection"],"two"],"$special":"Two","$value":{"name":"Other","more":1}}`);
        },"xxx");
    })
    it("inexistent key", ()=>{
        assert.throws(()=>{
            JSON4all.parse(`{"$ref":[["TheCollection"],"no-key"],"$special":"Two","$value":{"name":"Other","more":1}}`);
        },"xxx");
    })
    it("rejects to one instance in two places",()=>{
        var two = new Two('Name');
        collection.two = two;
        collection.two = two;
        assert.throws(()=>{
            collection.dos = two;
        },"xxx");
    })
    it("rejects class without properties", ()=>{
        assert.throws(()=>{
            @JSON4all.addClass
            class NoParams{}
            console.log(!NoParams)
        },"xxx");
    })
})

describe("decorators", ()=>{
    it("has prop list", ()=>{
        assert.deepEqual(
            // @ts-expect-error mirando la intervención:
            ThreeBase.prototype[JSON4all.$props2serialize],
            [
                {name:"id", construct:1},
                {name:"name"},
                {name:"age"},
            ]
        )
    })
    it("serialize only registereds in base", ()=>{
        var threeBase = new ThreeBase('id3');
        var str = JSON4all.stringify(threeBase);
        var plain = JSON.parse(str);
        assert.deepEqual(plain,{
            "$special": "ThreeBase",
            "$value": {
                "id": "id3",
                "age": 0,
                "name": {
                    "$special": "undefined"
                }
            }
        })
        str = JSON4all.toUrl(threeBase);
        assert.deepEqual(str, `!@ThreeBase,id:id3,name:!undefined,age:0`);
        var o = JSON4all.parse(str);
        // console.log('xxxxxxxxxxxxxxx', o)
        assert.ok(o instanceof ThreeBase);
        var str2 = JSON4all.toUrl(o);
        assert.deepEqual(str, str2);
    })
    it("serialize only registereds", ()=>{
        var three = new Three('ID3');
        three.age = 4;
        three.another = "present!";
        var str = JSON4all.stringify(three);
        var plain = JSON.parse(str);
        assert.deepEqual(plain,{
            "$special": "Three",
            "$value": {
                "id": "ID3",
                "age": 4,
                "name": {
                    "$special": "undefined"
                }
            }
        })
        var str = JSON4all.toUrl(three);
        assert.deepEqual(str, `!@Three,id:ID3,name:!undefined,age:4`)
        var o = JSON4all.parse(str);
        assert.ok(o instanceof ThreeBase);
        var str2 = JSON4all.toUrl(o);
        assert.deepEqual(str, str2);
    })
    it("serialize a anonymous object like a registered one", ()=>{
        var threeLike:any = {
            id: "ID3",
            age: 4,
            other: "do not pass this"
        };
        JSON4all.pretendClass(threeLike, Three);
        var str = JSON4all.stringify(threeLike);
        var plain = JSON.parse(str);
        assert.deepEqual(plain,{
            "$special": "Three",
            "$value": {
                "id": "ID3",
                "age": 4,
                "name": {
                    "$special": "undefined"
                }
            }
        })
        var str = JSON4all.toUrl(threeLike);
        assert.deepEqual(str, `!@Three,id:ID3,name:!undefined,age:4`)
        var o = JSON4all.parse(str);
        assert.ok(o instanceof ThreeBase);
        var str2 = JSON4all.toUrl(o);
        assert.deepEqual(str, str2);
    })
})

describe("decorators and references", ()=>{
    var threes = JSON4all.RefStore<string, Three>(['Threes']);
    it("serialize a registered object", ()=>{
        var three = new Three("ID4");
        three.name = "Referenced Name"
        three.another = "Grr!"
        threes.x3 = three;
        assert.deepEqual(
            // @ts-expect-error RefKey es interna
            three[JSON4all.RefKey], 
            [['Threes'],'x3']
        )
        assert.equal(threes.x3, three);
        assert.deepEqual(threes.x3, three);
        var str = JSON4all.stringify(three)
        assert.equal(str, `{"$special":"Three","$value":{"id":"ID4","name":"Referenced Name","age":0},"$ref":[["Threes"],"x3"]}`);
    })
    it("deserializa a registered object", ()=>{
        var strFaked = `{"$special":"Three","$value":{"id":"ID5","name":"FAKED!!!!","age":9999,"other":"STOP!"},"$ref":[["Threes"],"x3"]}`
        var three = JSON4all.parse(strFaked);
        assert.equal(threes.x3, three);
        assert.deepEqual(threes.x3, three);
        var str = JSON4all.stringify(three)
        assert.equal(str, `{"$special":"Three","$value":{"id":"ID4","name":"Referenced Name","age":0},"$ref":[["Threes"],"x3"]}`);
        assert.deepEqual(
            // @ts-expect-error RefKey es interna
            three[JSON4all.RefKey], 
            [['Threes'],'x3']
        )
    })
    it("deserializa a registered object without $value field", ()=>{
        var strFaked = `{"$special":"Three","$ref":[["Threes"],"x3"]}`
        var three = JSON4all.parse(strFaked);
        assert.equal(threes.x3, three);
        assert.deepEqual(threes.x3, three);
        var str = JSON4all.stringify(three)
        assert.equal(str, `{"$special":"Three","$value":{"id":"ID4","name":"Referenced Name","age":0},"$ref":[["Threes"],"x3"]}`);
        assert.deepEqual(
            // @ts-expect-error RefKey es interna
            three[JSON4all.RefKey], 
            [['Threes'],'x3']
        )
    })
})

describe("decorators and references in ClientSide", ()=>{
    before(()=>{
        // @ts-expect-error quito el ref como si nunca lo hubiera tenido. 
        JSON4all.RefStoreSpace(undefined); 
    })
    after(()=>{
        // @ts-expect-error global
        if(!global.mySpace){ throw new Error('No existe mySpace')}
        // @ts-expect-error global
        JSON4all.RefStoreSpace(global.mySpace); 
    })
    it("deserializa a registered object in clientSide", ()=>{
        var strFromServer = `{"$special":"Three","$value":{"id":"ID4","name":"Referenced Name","age":0},"$ref":[["Threes"],"x3"]}`
        var three = JSON4all.parse(strFromServer);
        var str = JSON4all.stringify(three)
        assert.equal(str, `{"$special":"Three","$ref":[["Threes"],"x3"]}`);
        assert.deepEqual(
            // @ts-expect-error RefKey es interna
            three[JSON4all.RefKey], 
            [['Threes'],'x3']
        )
    })
    it("serialize a registered object in clientSide", ()=>{
        var three = new Three("ID4");
        three.name = "Referenced Name"
        three.another = "Grr!"
        // @ts-expect-error RefKey es interna
        three[JSON4all.RefKey] = [['Threes'],'x3']
        var str = JSON4all.stringify(three)
        assert.equal(str, `{"$special":"Three","$ref":[["Threes"],"x3"]}`);
    })
})
