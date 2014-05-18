(function(locals){

    var self = this;

    return {
        search_twitter: function(query, cb){
            var http = require("http");
            var results = "";

            var req = http.request({
                host:"search.twitter.com",
                path:"/search.json?q=" + query
            }, function(res){
                res.on('data', function(chunk){
                    results += chunk;
                });

                res.on('end', function(){                    
                    var parsed_results = JSON.parse(results);
                    cb.call(null,parsed_results.results);
                });
            });

            req.end();
        },
        save_for_later:function(item){
            this.state.push(item);
        },
        get_saved: function(){
            return this.state;
        },
        state:["hello"],
        async_do: function(cb){
            process.nextTick(cb);
        }
    };
})