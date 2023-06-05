"use strict";

var expect = require('expect.js')
var discrepances = require('discrepances')
var JSON4all = require('../../json4all.js');

var ExampleClass = ExampleClass = require('./example-class.js');

var bestGlobals = require('best-globals');
const { strict:assert  } = require('assert');
const json4all = require('../../json4all.js');
const { json } = require('body-parser');
const { Console } = require('console');
var date = bestGlobals.date;
var datetime = bestGlobals.datetime;

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

function compareObjects(obtained, expected, fixture, skipDeepEqual){
    if(!fixture){
        discrepances.showAndThrow(obtained,expected);
        expect(obtained).to.eql(expected);
        if(!skipDeepEqual){
            deepEqual(obtained,expected);
        }
    }else{
        discrepances.showAndThrow(obtained,expected);
        try{
            compareObjects(obtained,expected, null, skipDeepEqual);
        }catch(err){
            try{
                if(fixture.expected2 && false){
                    expected=fixture.expected2;
                    compareObjects(obtained,expected);
                }else{
                    throw err;
                }
            }catch(err){
                try{
                    var obtainedPart=obtained [1];
                    var expectedPart=expected[1];
                    compareObjects(obtainedPart,expectedPart);
                    console.log('--partes iguales');
                }catch(err){
                    console.log('--partes distintas',obtainedPart,expectedPart,obtainedPart==expectedPart,obtainedPart===expectedPart,typeof obtainedPart,typeof expectedPart);
                }
                throw err;
            }
        }
    }
}

describe("maxConsumer", function(){
    var maxConsumer = json4all.maxConsumer;
    it("results 0 if no consuming", function(){
        var max = maxConsumer();
        assert.equal(max.object, null);
    })
    it("returns the first argument", function(){
        var argument = {the:'x'};
        var max = maxConsumer();
        var obtained = max({value:argument});
        assert.equal(obtained, argument);
    })
    it("returns all the arguments, get max", function(){
        var argument1 = {the:'1'};
        var argument2 = {the:'2'};
        var argument3 = {the:'3'};
        var max = maxConsumer();
        var obtained = [
            max({value:argument1, object:3, array:1}), 
            max({value:argument2, object:9, array:1}),
            max({value:argument3, object:2, array:1}),
        ];
        assert.equal(obtained[0], argument1);
        assert.equal(obtained[1], argument2);
        assert.equal(obtained[2], argument3);
        assert.equal(max.object, 9);
        assert.equal(max.array, 1);
    })
})

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

var now = new Date();
var nowIso = now.toISOString();
var hourStrFromToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString().substring(10);

var fixtures=[
    {name:'strDate'   ,value: "2012-01-02"                 , expectedV2:`"2012-01-02"`},
    {name:'strStr'    ,value: "hola"                       , expectedV2:`hola`},
    {name:'parte'     ,value: parte                        , expectedV2:`*,parteA:A`},
    {name:'partes'    ,value: [parte, parte]               , expectedV2:`*;*,parteA:A;*,parteA:A`},
    {name:'rombo'     ,value: {a:parte, b:parte}           , expectedV2:`*,,a:*,parteA:A,,b:*,parteA:A`, alterV2:`*,a:{"parteA":"A"},b:{"parteA":"A"}`},
    {name:'array'     ,value: [1,"2", false]               , expectedV2:`*;1;"2";false`},
    {name:'fecha'     ,value: new Date(-20736000000)       , expectedV2:`*1969-05-06T00:00:00.000Z`, expectEncode: '{"$special":"Date","$value":-20736000000}', check:function(o){ return o instanceof Date; }},
    {name:'{fecha}'   ,value: {a:1, f:new Date(2016,2,2)}  , expectedV2:`*,a:1,f:*2016-03-02`+hourStrFromToday, check:function(o){ return o.f instanceof Date; }},
    {name:'{{fecha}}' ,value: {a:{f:new Date(2016,2,2)}}   , expectedV2:false, check:function(o){ return o.a.f instanceof Date; }},
    {bg:true, name:'fech',value: date.iso("1999-12-31")    , expectedV2:`*1999-12-31`, expectEncode: '{"$special":"date","$value":"1999-12-31"}', check:function(o){ return o instanceof Date && o.isRealDate; }, skipDeepEqual:true},
    {bg:true, name:'{fech}',value: {a:1, f:date.ymd(2016,2,2)}, expectedV2:`*,a:1,f:*2016-02-02`, check:function(o){ return o.f.isRealDate; }, skipDeepEqual:true},
    {bg:true, name:'datetime',value: datetime.iso("1999-12-31"), expectedV2:`*1999-12-31 00:00`, expectEncode: '{"$special":"Datetime","$value":"1999-12-31"}', check:function(o){ return o instanceof bestGlobals.Datetime; }},
    {bg:true, name:'{datetime}',value: {a:1, f:datetime.ymdHms(2016,2,2,12,1,2)}, expectedV2:`*,a:1,f:*2016-02-02 12:01:02`, check:function(o){ return o.f instanceof bestGlobals.Datetime; }},
    {name:'bigNumber' ,value: 12345678901234567890         , expectedV2:`12345678901234567000`},
    {name:'bool'      ,value: true                         , expectedV2:`true`},
    {name:'null'      ,value: null                         , expectedV2:`null`},
    {name:'undef'     ,value: undefined                     , expectedV2:`*!undefined`, expectEncode: '{"$special":"undefined"}'},
    {name:'{undef}'   ,value: {a:undefined}                 , expectedV2:`*,a:*!undefined`, expectEncode: '{"a":{"$special":"undefined"}}'},
    {name:'[undef]'   ,value: [0,undefined,"0",null,false]  , expectedV2:`*;0;*!undefined;"0";null;false`, expectEncode: '[0,{"$special":"undefined"},"0",null,false]', 
                   expected2: [0,          "0",null,false] },
    {name:'{}'        ,value: {}                           , expectedV2:'{}', expectEncode:'{}'},
    {name:'{{{}}}'    ,value: {a:{d:{},e:{}},b:2,c:{}}     , expectedV2:'*,,a:*,d:{},e:{},,b:2,,c:{}'},
    {name:'[]'        ,value: []                           , expectedV2:'[]', expectEncode:'[]'},
    {name:'regex'     ,value: /hola/gi                     , expectedV2:`*/hola/gi`},
    {name:'regex_no_attr',value: /[a-z]/                   , expectedV2:`*/[a-z]/`},
    {name:'{regex}'   ,value: {r:/hola/}                   , expectedV2:`*,r:*/hola/`    , check:function(o){ return o.r instanceof RegExp; }},
    {name:'{{regex}}' ,value: {a:{r:/hola/}}               , expectedV2:`*,,a:*,r:*/hola/` ,alterV2:`{"a":{"r":{"$special":"RegExp","$value":{"source":"hola","flags":""}}}}` , check:function(o){ return o.a.r instanceof RegExp; }},
    {name:'*star'     ,value: '*star'                      , expectedV2:'**star', expectEncode:'"*star"'},
    {name:'{*star}'   ,value: {r:'*star'}                  , expectedV2:'*,r:**star', expectEncode:'{"r":"*star"}'},
    {name:'{{*alfa}}' ,value: {a:{r:'*alfa'},r:'*beta'}    , expectedV2:'*,,a:*,r:**alfa,,r:**beta', alterV2:'*a:{"r":"*alfa"},r:**beta', expectEncode:'{"a":{"r":"*alfa"},"r":"*beta"}'},
    {name:'{{",,,"}}' ,value: {a:{r:',,,'}}                , expectedV2:'*,,,,,a:*,,,,r:",,,"' },
    {name:'fun'       ,value: function(x){ return x+1; }   , expectedV2:`*!unset` , expectEncode: '{"$special":"undefined"}', expected: undefined},
    {name:'{fun}'     ,value: {f:function(x){ return x+1; }}, expectedV2:`*,f:*!unset`, expectEncode: '{"f":{"$special":"unset"}}', expected:{} },
    {name:'complex'   ,
        value:    {list1:[{one:{two:['the list',32,'33',null,undefined,'}'],'3':33,'length':4,d:now},_:'333'}],f:function(){return 3;}},
        expected: {list1:[{one:{two:['the list',32,'33',null,undefined,'}'],'3':33,'length':4,d:now},_:'333'}]                        },
        expected2:{list1:[{one:{two:['the list',32,'33',null,          '}'],'3':33,'length':4,d:now},_:'333'}]                        },
        expectedV2:`*,,,list1:*;;*,,one:*,"3":33,two:*;"the list";32;"33";null;*!undefined;"}",length:4,d:*${nowIso},,_:"333",,,f:*!unset`
    },
    {name:'h1-JSON4all' ,value: {d:{$special:'Date',$value:1456887600000},u:{$special:'undefined'}}, 
        expectEncode: JSON.stringify({d:{$escape:{$special:'Date',$value:1456887600000}},u:{$escape:{$special:'undefined'}}}),
        expectedV2:`*,,d:*,\"$special\":Date,\"$value\":1456887600000,,u:*,\"$special\":undefined`,
        /* expected2:runningInBrowser */
    },
    {name:'h2-JSON4all' ,value: {$escape:{d:{$special:'Date',$value:1456887600000},u:{$special:'undefined'}}},
        expectEncode: JSON.stringify({$escape:{$escape:{d:{$escape:{$special:'Date',$value:1456887600000}},u:{$escape:{$special:'undefined'}}}}}),
        expectedV2:`*,,,"$escape":*,,d:*,"$special":Date,"$value":1456887600000,,u:*,"$special":undefined`
        /* expected2: */
    },
    {name:'h3-JSON4all' ,value: {$escape:{$escape:{d:{$special:'Date',$value:1456887600000},u:{$special:'undefined'},e:{$escape:true}}}},expectedV2:false},
    {name:'Point'     ,value: new Point(1,2,3.3), 
        check:function(o){ return o instanceof Point; } , 
        expectedV2: `*@Point,x:1,y:2,z:3.3`,
        expectEncode:'{"$special":"Point","$value":{"x":1,"y":2,"z":3.3}}'
    },
    {name:'hack-EJSON',expectedV2:false,value: {"$special":"Point","$value":{"x":1,"y":2,"z":3.3}} },
    {name:'hack2EJSON',expectedV2:false,value: {$escape:{"$special":"Point","$value":{"x":1,"y":2,"z":3.3}}} },
    {name:'hack3EJSON',expectedV2:false,value: {$escape:{$escape:{$escape:{"$special":"Point","$value":{"x":1,"y":2,"z":3.3}}}}} },
    {name:'anonymous' ,value: data, expectedV2:`*,one:1,alpha:"α"`, expected:{one:1, alpha:'α'} },
    {name:'colon' ,value: {"a:b":{"b:c":"x:::j"}}, expectedV2:`*,,"a\\u003ab":*,"b\\u003ac":"x:::j"`},
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
            var expected = 'expected' in fixture?fixture.expected:fixture.value;
            var decoded=JSON4all.parse(encoded);
            compareObjects(decoded, expected, fixture, fixture.skipDeepEqual);
            decoded=JSON.parse(encoded);
            decoded=JSON4all.convertPlain2$special(decoded);
            compareObjects(decoded, expected, fixture, fixture, fixture.skipDeepEqual);
            var encodedV2 = JSON4all.toUrl(fixture.value);
            if (fixture.expectedV2) {
                compareObjects(encodedV2, fixture.expectedV2, fixture, fixture.skipDeepEqual);
            } else if (fixture.expectedV2 !== false) {
                compareObjects(encodedV2, encoded, fixture, fixture.skipDeepEqual);
            }
            var decoded = JSON4all.parse(encodedV2);
            compareObjects(decoded, expected, fixture, fixture.skipDeepEqual);
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
    it("rejects unregistered classes parsing URL", function(){
        expect(function(){
            JSON4all.toUrl(new OtherClass());
        }).to.throwError(/JSON4all.*registered.*type/);
    });
    it("rejects errored URLS", function(){
        expect(function(){
            JSON4all.parse(`*,a,b:7`);
        }).to.throwError(/JSON4all.*Lack of colon.*/);
    });
    it("rejects errored bad !", function(){
        expect(function(){
            JSON4all.parse(`*!cuack!`);
        }).to.throwError(/JSON4all.*unrecognize.*token/);
    });
    it("bugy condition in some IE", function(){
        var encoded='{"3":33}';
        var expected={"3":33};
        var obtained = JSON4all.parse(encoded);
        discrepances.showAndThrow(obtained,expected);
        compareObjects(obtained,expected);
    });
    it("very bugy condition in some IE", function(){
        var encoded='{"3":{"$special":"Date","$value":-20736000000}}';
        var expected={"3":new Date(-20736000000)};
        var obtained = JSON4all.parse(encoded);
        compareObjects(obtained,expected);
        discrepances.showAndThrow(obtained,expected); 
        compareObjects(obtained,expected);
    });
});

JSON4all.addType(ExampleClass,{
    construct: JSON4all.nonymizate,
    deconstruct: JSON4all.anonymizate
})

JSON4all.addType(ExampleClass,{
    construct: JSON4all.nonymizate,
    deconstruct: JSON4all.anonymizate
},true)

describe("addType", function(){
    describe("ExampleClass", function(){
        [
            {text: "1 day", o:{days: 1}, expectedJson: 
                ExampleClass["4client"] ? '{"$special":"ExampleClass","$value":{"days":1}}'
                : '{"$special":"ExampleClass","$value":{"days":1,"toISO":{"$special":"unset"}}}',
                expectedV2: `*@ExampleClass,days:1`
            },
            {text: "1 year 2 month 3 days 4:05:06", o:{years:1, months:2, days:3, hours:4, minutes:5, seconds:6}, 
                expectedV2: `*@ExampleClass,years:1,months:2,days:3,hours:4,minutes:5,seconds:6`},
            {text: "10:30", o:{hours: 10, minutes:30}, expectedV2: `*@ExampleClass,hours:10,minutes:30`},
        ].forEach(function(fixture){
            it("handles interval "+fixture.text, function(){
                if(ExampleClass["4client"]){
                    var interval = new ExampleClass();
                    for(var attr in fixture.o){
                        interval[attr] = fixture.o[attr];
                    }
                }else{
                    var interval = ExampleClass(fixture.text);
                }
                var intervalJson = JSON4all.stringify(interval);
                if(fixture.expectedJson){
                    expect(intervalJson).to.eql(fixture.expectedJson);
                }
                var resurrected = JSON4all.parse(intervalJson);
                expect(resurrected).to.eql(interval);
                expect(resurrected instanceof interval.constructor);
                if(fixture.expectedV2){
                    var intervalJson = JSON4all.toUrl(interval);
                    expect(intervalJson).to.eql(fixture.expectedV2);
                    var resurrected = JSON4all.parse(intervalJson);
                    expect(resurrected).to.eql(interval);
                    expect(resurrected instanceof interval.constructor);
                }
            });
        });
    });
});

