var node_uuid = require('node-uuid');

exports.makeUUID = function(options){    
    var uuid = node_uuid();
    var output = [];

    if (options.prefix) {
	output.push(options.prefix);
    }

    output.push(uuid);

    return output.join("-");
};