var vm = require("vm");
var node_vm = function(){};

node_vm.make = function(){
    var strategy = new node_vm();
    return strategy;
};

node_vm.prototype.execute = function(code, sandbox){
    var last_eval;
    try {
        last_eval = vm.runInNewContext(code,sandbox);
    } catch (e) {
        last_eval = e.name + ': ' + e.message;
    }

    return last_eval;
};

exports.node_vm = node_vm;