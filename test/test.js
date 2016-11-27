"use strict";

var expect = require('expect.js')
var selfExplain = require('self-explain')
var discrepances = require('discrepances')
var JSON4all = require('../json4all.js')

var bestGlobals = require('best-globals');
var date = bestGlobals.date;

var deepEqual;

var runningInBrowser = typeof window !== 'undefined';

if(runningInBrowser){
    deepEqual = function(){};
}else{
    deepEqual = require('assert').deepStrictEqual;
    if(!deepEqual){
        deepEqual = function(){};
    }
}

function compareObjects(obtained, expected){
    if(discrepances(obtained,expected)){
        console.log('discrepances', discrepances(obtained,expected));
        expect(obtained).to.eql(expected);
    }else{
        deepEqual(obtained,expected);
    }
}

var seeAll = false;

var parte={
    parteA: "A"
};

function Point(x, y, z) {
    this.klass = 'Point';
    this.x     = x;
    this.y     = y;
    this.z     = z;
}
// For EJSON
Point.prototype.JSON4replacer=function(){ return {x:this.x, y:this.y, z:this.z}; }
Point.JSON4reviver=function(o){ return new Point(o.x, o.y, o.z); }

JSON4all.addType(Point);

var today = new Date();

var data = new function(){
    this.one=1;
    this.alpha='α';
}();

describe("common JSON behavior", function(){
    it("JSON [undefined]", function(){
        var arr=[undefined];
        var j=JSON.stringify(arr);
        compareObjects(j, "[null]"); // not as expected
    });
});

var fixtures=[
    {name:'strDate'   ,value: "2012-01-02"                 },
    {name:'strStr'    ,value: "hola"                       },
    {name:'parte'     ,value: parte                        },
    {name:'partes'    ,value: [parte, parte]               },
    {name:'rombo'     ,value: {a:parte, b:parte}           },
    {name:'array'     ,value: [1,"2", false]               },
    {name:'fecha'     ,value: new Date(-20736000000)        , expectEncode: '{"$special":"Date","$value":-20736000000}', check:function(o){ return o instanceof Date; }},
    {name:'{fecha}'   ,value: {a:1, f:new Date(2016,2,2)}   , check:function(o){ return o.f instanceof Date; }},
    {bg:true, name:'fech',value: date.iso("1999-12-31")     , expectEncode: '{"$special":"date","$value":"1999-12-31"}', check:function(o){ return o instanceof Date && o.isRealDate; }},
    {bg:true, name:'{fech}',value: {a:1, f:date.ymd(2016,2,2)}, check:function(o){ return o.f.isRealDate; }},
    {name:'bigNumber' ,value: 12345678901234567890         },
    {name:'bool'      ,value: true                         },
    {name:'null'      ,value: null                         },
    {name:'undef'     ,value: undefined                     , expectEncode: '{"$special":"undefined"}'},
    {name:'{undef}'   ,value: {a:undefined}                 , expectEncode: '{"a":{"$special":"undefined"}}'},
    {name:'[undef]'   ,value: [0,undefined,"0",null,false] , expectEncode: '[0,{"$special":"undefined"},"0",null,false]', 
                   expected2: [0,          "0",null,false] },
    {name:'regex'     ,value: /hola/ig                     },
    {name:'{regex}'   ,value: {r:/hola/}                    , check:function(o){ return o.r instanceof RegExp; }},
    {name:'fun'       ,value: function(x){ return x+1; }    , expectEncode: '{"$special":"undefined"}', expected: undefined},
    {name:'{fun}'     ,value: {f:function(x){ return x+1; }}, expectEncode: '{"f":{"$special":"unset"}}', expected:{} },
    {name:'complex'   ,
        value:    {list1:[{one:{two:['the list',32,'33',null,undefined,'}'],'3':33,'length':4,d:today},_:'333'}],f:function(){return 3;}},
        expected: {list1:[{one:{two:['the list',32,'33',null,undefined,'}'],'3':33,'length':4,d:today},_:'333'}]                        },
        expected2:{list1:[{one:{two:['the list',32,'33',null,          '}'],'3':33,'length':4,d:today},_:'333'}]                        },
    },
    {name:'h1-JSON4all' ,value: {d:{$special:'Date',$value:1456887600000},u:{$special:'undefined'}}, 
        expectEncode: JSON.stringify({d:{$escape:{$special:'Date',$value:1456887600000}},u:{$escape:{$special:'undefined'}}}),
        /* expected2:runningInBrowser */
    },
    {name:'h2-JSON4all' ,value: {$escape:{d:{$special:'Date',$value:1456887600000},u:{$special:'undefined'}}},
        expectEncode: JSON.stringify({$escape:{$escape:{d:{$escape:{$special:'Date',$value:1456887600000}},u:{$escape:{$special:'undefined'}}}}}),
        /* expected2: */
    },
    {name:'h3-JSON4all' ,value: {$escape:{$escape:{d:{$special:'Date',$value:1456887600000},u:{$special:'undefined'},e:{$escape:true}}}}},
    {name:'Point'     ,value: new Point(1,2,3.3), 
        check:function(o){ return o instanceof Point; } , 
        expectEncode:'{"$special":"Point","$value":{"x":1,"y":2,"z":3.3}}'
    },
    {name:'hack-EJSON',value: {"$special":"Point","$value":{"x":1,"y":2,"z":3.3}} },
    {name:'hack2EJSON',value: {$escape:{"$special":"Point","$value":{"x":1,"y":2,"z":3.3}}} },
    {name:'hack3EJSON',value: {$escape:{$escape:{$escape:{"$special":"Point","$value":{"x":1,"y":2,"z":3.3}}}}} },
    {name:'anonymous' ,value: data, expected:{one:1, alpha:'α'} } 
];

describe("JSON4all",function(){
  [false, true].forEach(function(forBestGlobals){ describe(forBestGlobals?'4 best-globals':'normal',function(){
    fixtures.forEach(function(fixture){
        if(forBestGlobals){
            before(function(){
                bestGlobals.registerJson4All(JSON4all);
            });
        }
        if(fixture.skip) return;
        if(!forBestGlobals && fixture.bg) return;
        var withError=false;
        it("fixture "+fixture.name+": "+JSON.stringify(fixture),function(){
            //if(runningInBrowser) { console.log("FIXTURE", fixture.name); }
            var encoded=JSON4all.stringify(fixture.value);
            if('expectEncode' in fixture){
                compareObjects(encoded,fixture.expectEncode);
            }
            var decoded=JSON4all.parse(encoded);
            var expected = 'expected' in fixture?fixture.expected:fixture.value;
            if(selfExplain){
                var diffs = selfExplain.assert.allDifferences(decoded,expected);
                var eql=!diffs;
                if(!eql){ console.log("--- DIFFS", diffs); console.log('[both]',decoded,expected); }
                if(!eql){ console.log("--- DISC", discrepances(decoded, expected)); }
                expect(eql).to.be.ok();
            }
            try{
                compareObjects(decoded,expected);
            }catch(err){
                try{
                    if(fixture.expected2 && false){
                        expected=fixture.expected2;
                        compareObjects(decoded,expected);
                    }else{
                        throw err;
                    }
                }catch(err){
                    try{
                        var obtainedPart=decoded [1];
                        var expectedPart=expected[1];
                        compareObjects(obtainedPart,expectedPart);
                        console.log('--partes iguales');
                    }catch(err){
                        console.log('--partes distintas',obtainedPart,expectedPart,obtainedPart==expectedPart,obtainedPart===expectedPart,typeof obtainedPart,typeof expectedPart);
                    }
                    throw err;
                }
            }
            if('check' in fixture){
                expect(fixture.check(decoded)).to.ok();
            }
        });
    });
  }); });
});

function OtherClass(){
}

describe("JSON4all error conditions",function(){
    it("rejects invalid $specials", function(){
        expect(function(){
            JSON4all.parse('{"$special":"ugh!"}');
        }).to.throwError(/JSON4all.*invalid.*\$special/);
    });
    it("rejects unregistered classes", function(){
        expect(function(){
            JSON4all.stringify(new OtherClass());
        }).to.throwError(/JSON4all.*registered.*type/);
    });
    it("bugy condition in some IE", function(){
        var encoded='{"3":33}';
        var expected={"3":33};
        var obtained = JSON4all.parse(encoded);
        if(selfExplain){
            var diffs = selfExplain.assert.allDifferences(obtained,expected);
            if(diffs){
                console.log(diffs)
            };
            expect(diffs).to.not.be.ok();
        }
        compareObjects(obtained,expected);
    });
    it("very bugy condition in some IE", function(){
        var encoded='{"3":{"$special":"Date","$value":-20736000000}}';
        var expected={"3":new Date(-20736000000)};
        var obtained = JSON4all.parse(encoded);
        compareObjects(obtained,expected);
        if(selfExplain){
            var diffs = selfExplain.assert.allDifferences(obtained,expected);
            if(diffs){
                console.log(diffs)
            };
            expect(diffs).to.not.be.ok();
        }
        compareObjects(obtained,expected);
    });
});
