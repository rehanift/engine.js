(function(locals){

  return {
    get_repos_for: function(handle, cb){
      async.start(); // tell engine.js that this function expects an asynchronous callback
      var http = require("https");
      var results = "";

      var req = http.request({
        host:"api.github.com",
        path:"/users/" + handle + "/repos",
        headers:{"User-Agent":"Engine.JS"}
      }, function(res){
        res.on('data', function(chunk){
          results += chunk;
        });

        res.on('end', function(){                    
          var parsed_results = JSON.parse(results);
          cb(parsed_results);
          async.end(); // tell engine.js that an asynchronous callback has finished
        });
      });

      req.end();
      
    }
  };
});