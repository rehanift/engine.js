(function(locals){
    return {
        someAsyncFunc: function(cb){
            async.start();
            process.nextTick(function(){
                cb();
                async.end();
            });
        }
    };
})