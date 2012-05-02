(function(locals) { 

    return {
        count: 3,
        hello: "world",
        incr_global: function(){ 
            this.count+=1;
            return this.count;
        }
        ,incr_local: function(){
            locals.count++;
            return locals.count;
        }
    };
});
