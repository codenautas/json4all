"use strict";

var expect = require('expect.js')
var deepEqual = require('deep-equal')
var EPJSON = require('../epjson.js')

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
Point.prototype.typeName=function(){ return "Point";}
Point.prototype.toJSONValue=function(){ return JSON.stringify(this); }
Point.EJSONFactory=function(s){ var o=JSON.parse(s); return new Point(o.x, o.y, o.z); }
EPJSON.addType("Point", Point.EJSONFactory);

var fixtures=[
    {name:'strDate'   ,value: "2012-01-02",              },
    {name:'strStr'    ,value: "hola",                    },
    {name:'parte'     ,value: parte,                     },
    {name:'partes'    ,value: [parte, parte],            },
    {name:'rombo'     ,value: {a:parte, b:parte},        },
    {name:'array'     ,value: [1,"2", false],            },
    {name:'fecha'     ,value: new Date(1969, 5-1, 6)     , expectEncode: '{"$special":"Date","$date":-20725200000}'},
    {name:'{fecha}'   ,value: {a:1, f:new Date(2016,2,2)}},
    {name:'bigNumber' ,value: 12345678901234567890,      },
    {name:'bool'      ,value: true,                      },
    {name:'null'      ,value: null,                      },
    {name:'undef'     ,value: undefined                  , expectedEncode: '{"$undefined": true}'},
    {name:'{undef}'   ,value: {a:undefined}, expected:{} },
    {name:'regex'     ,value: /hola/,                    },
    {name:'fun'       ,value: function(x){ return x+1; } , expected: undefined},
    {name:'{fun}'     ,value: {f:function(x){ return x+1; }}, expected:{} },
    {name:'complex'   ,
        value:{list1:[{one:{two:['the list',32,'33',null,undefined,'}'],'3':33,'length':4,d:new Date()},_:'333'}],f:function(){return 3;}},
     expected:{list1:[{one:{two:['the list',32,'33',null,undefined,'}'],'3':33,'length':4,d:new Date()},_:'333'}]                        },
    },
    {name:'h1-EPJSON' ,value: {d:{$special:'Date',$date:1456887600000},u:{$special:'undefined'}}},
    {name:'h2-EPJSON' ,value: {$escape:{d:{$special:'Date',$date:1456887600000},u:{$special:'undefined'}}}},
    {name:'h3-EPJSON' ,value: {$escape:{$escape:{d:{$special:'Date',$date:1456887600000},u:{$special:'undefined'},e:{$escape:true}}}}},
    {name:'Point'     ,value: new Point(1,2,3.3), 
                       check:function(o){ return o instanceof Point; } , 
                       expectEncode:'{"$type":"Point","$value":"{\"klass\":\"Point\",\"x\":1,\"y\":2,\"z\":3.3}"}'
    },
    {name:'hack-EJSON',value: {"$type":"Point","$value":"{\"klass\":\"Point\",\"x\":1,\"y\":2,\"z\":3.3}"} },
    {name:'hack2EJSON',value: {"$escape":{"$type":"Point","$value":"{\"klass\":\"Point\",\"x\":1,\"y\":2,\"z\":3.3}"}} },
];

describe("epjson",function(){
    fixtures.forEach(function(fixture){
        if(fixture.skip) return;
        var withError=false;
        var dif=false;
        it("fixture: "+JSON.stringify(fixture),function(){
            var encoded=EPJSON.stringify(fixture.value);
            if('expectEncode' in fixture){
                console.log([],encoded)
                expect(encoded).to.eql(fixture.expectEncode);
            }
            var decoded=EPJSON.parse(encoded);
            dif=!deepEqual(decoded,'expected' in fixture?fixture.expected:fixture.value);
            expect(decoded).to.eql('expected' in fixture?fixture.expected:fixture.value);
            if('check' in fixture){
                expect(fixture.check(decoded)).to.ok();
            }
        });
    });
});

