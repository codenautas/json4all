"use strict";

var expect = require('expect.js')
var selfExplain = require('self-explain')
var JSON4all = require('../json4all.js')

var seeAll = false;

var parte={
    parteA: "A",
}

function Point(x, y, z) {
    this.klass = 'Point';
    this.x     = x;
    this.y     = y;
    this.z     = z;
}
// For EJSON
Point.prototype.toJSON4replacer=function(){ return {x:this.x, y:this.y, z:this.z}; }
Point.JSON4reviver=function(o){ return new Point(o.x, o.y, o.z); }

JSON4all.addType(Point);

var today = new Date();
var runningInBrowser = typeof window !== 'undefined';

var fixtures=[
    {name:'strDate'   ,value: "2012-01-02",                },
    {name:'strStr'    ,value: "hola",                      },
    {name:'parte'     ,value: parte,                       },
    {name:'partes'    ,value: [parte, parte],              },
    {name:'rombo'     ,value: {a:parte, b:parte},          },
    {name:'array'     ,value: [1,"2", false],              },
    {name:'fecha'     ,value: new Date(1969, 5-1, 6)        , expectEncode: '{"$special":"Date","$value":-20725200000}', check:function(o){ return o instanceof Date; }},
    {name:'{fecha}'   ,value: {a:1, f:new Date(2016,2,2)}   , check:function(o){ return o.f instanceof Date; }},
    {name:'bigNumber' ,value: 12345678901234567890,        },
    {name:'bool'      ,value: true,                        },
    {name:'null'      ,value: null,                        },
    {name:'undef'     ,value: undefined                     , expectEncode: '{"$special":"undefined"}'},
    {name:'{undef}'   ,value: {a:undefined}, expected:{}   },
    {name:'[undef]'   ,value: [0,undefined,"0",null,false]  , expectEncode: '[0,{"$special":"undefined"},"0",null,false]', skipExpectedJsInBrowser:runningInBrowser},
    {name:'regex'     ,value: /hola/ig,                    },
    {name:'{regex}'   ,value: {r:/hola/}                    , check:function(o){ return o.r instanceof RegExp; }},
    {name:'fun'       ,value: function(x){ return x+1; }    , expected: undefined},
    {name:'{fun}'     ,value: {f:function(x){ return x+1; }}, expected:{} },
    {name:'complex'   ,
        value:{list1:[{one:{two:['the list',32,'33',null,undefined,'}'],'3':33,'length':4,d:today},_:'333'}],f:function(){return 3;}},
        expected:{list1:[{one:{two:['the list',32,'33',null,undefined,'}'],'3':33,'length':4,d:today},_:'333'}]                        },
        skipExpectedJsInBrowser:runningInBrowser
    },
    {name:'h1-JSON4all' ,value: {d:{$special:'Date',$value:1456887600000},u:{$special:'undefined'}}, 
        expectEncode: JSON.stringify({d:{$escape:{$special:'Date',$value:1456887600000}},u:{$escape:{$special:'undefined'}}}),
        skipExpectedJsInBrowser:runningInBrowser
    },
    {name:'h2-JSON4all' ,value: {$escape:{d:{$special:'Date',$value:1456887600000},u:{$special:'undefined'}}},
        expectEncode: JSON.stringify({$escape:{$escape:{d:{$escape:{$special:'Date',$value:1456887600000}},u:{$escape:{$special:'undefined'}}}}}),
        skipExpectedJsInBrowser:runningInBrowser
    },
    {name:'h3-JSON4all' ,value: {$escape:{$escape:{d:{$special:'Date',$value:1456887600000},u:{$special:'undefined'},e:{$escape:true}}}}},
    {name:'Point'     ,value: new Point(1,2,3.3), 
        check:function(o){ return o instanceof Point; } , 
        expectEncode:'{"$special":"Point","$value":{"x":1,"y":2,"z":3.3}}'
    },
    {name:'hack-EJSON',value: {"$special":"Point","$value":{"x":1,"y":2,"z":3.3}} },
    {name:'hack2EJSON',value: {$escape:{"$special":"Point","$value":{"x":1,"y":2,"z":3.3}}} },
    {name:'hack3EJSON',value: {$escape:{$escape:{$escape:{"$special":"Point","$value":{"x":1,"y":2,"z":3.3}}}}} },
];

describe("JSON4all",function(){
    fixtures.forEach(function(fixture){
        if(fixture.skip) return;
        var withError=false;
        it("fixture "+fixture.name+": "+JSON.stringify(fixture),function(){
            //if(runningInBrowser) { console.log("FIXTURE", fixture.name); }
            var encoded=JSON4all.stringify(fixture.value);
            //console.log(fixture.name+": DEC", JSON.stringify(decoded)); console.log(fixture.name+": EXP", JSON.stringify(expected));
            if('expectEncode' in fixture){
                expect(encoded).to.eql(fixture.expectEncode);
            }
            var decoded=JSON4all.parse(encoded);
            var expected = 'expected' in fixture?fixture.expected:fixture.value;
            var diffs = selfExplain.assert.allDifferences(decoded,expected);
            var eql=!diffs;
            if(!eql){ console.log("--- DIFFS", diffs); }
            expect(eql).to.be.ok();
            if(! fixture.skipExpectedJsInBrowser) {
                try{
                    expect(decoded).to.eql(expected);
                }catch(err){
                    try{
                        var obtainedPart=decoded .list1[0].one.two;
                        var expectedPart=expected.list1[0].one.two;
                        expect(obtainedPart).to.eql(expectedPart);
                        console.log('--partes iguales');
                    }catch(err){
                        console.log('--partes distintas',expectedPart,expectedPart);
                    }
                    throw err;
                }
            }
            if('check' in fixture){
                expect(fixture.check(decoded)).to.ok();
            }
        });
    });
});

