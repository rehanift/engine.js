var htmlparser = require("htmlparser2"),
    assert = require("assert"),
    soupselect = require("../lib/soupselect");

fruits = '"<ul id = "fruits">'+
            '<li id = "apple">Apple</li>'+
            '<li class = "orange">Orange</li>'+
            '<li class = "pear">Pear</li>'+
          '</ul>"';


var handler = new htmlparser.DefaultHandler(); 
    parser = new htmlparser.Parser(handler);

parser.parseComplete(fruits);
var dom = handler.dom;

suite("#select()", function(){
    test("should return the outermost element when asked for it's id", function(){
        assert.deepEqual([dom[1]], soupselect.select(dom, "#fruits"));
    });
});

