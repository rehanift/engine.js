module.exports = function(original, defaults){
    original = original || {};
    original.__proto__ = defaults;
    return original;
};
