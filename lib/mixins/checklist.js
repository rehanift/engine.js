var Checklist = function(){
    this.requirements = [];
    
    this.setRequirements = function(requirements) {
        this.requirements = requirements;
    };
    
    this.checkoff = function(requirement, callback){
        for(var i = 0; i < this.requirements.length; i++) {
            if(this.requirements[i] == requirement) {
                this.requirements.splice(i, 1);
                callback(this.requirements);
            }
        }
    };

    return this;
};

exports.Checklist = Checklist;