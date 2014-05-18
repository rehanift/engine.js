/*
 * Port of Simon Willison's Soup Select http://code.google.com/p/soupselect/
 * http://www.opensource.org/licenses/mit-license.php
 *
 * MIT licensed http://www.opensource.org/licenses/mit-license.php
 */

var domUtils = require("htmlparser2").DomUtils,
    ins = require("util").inspect;

/*
 *  Export the version
 */

exports.version = '0.1.0';

/*
 Selecting the tag and attribute(s):

 /^([a-z0-9_]+)?((?:\[(?:[a-z0-9_-]+)(?:[=~\|\^\$\*]?)=?["']?(?:[^\]"']*)["']?\])+)?$/i;
    \------/
       |
      Tag

 Parsing the attribute(s):

 /\[([a-z0-9_-]+)([=~\|\^\$\*]?)=?["']?([^\]"']*)["']?\]/ig;
     \--------/    \----------/         \------/
         |              |                  |
         |              |                Value
         |        ~,|,^,$,* or =
     Attribute

 Parsing the filter:

 /^([a-z0-9\s=~\|\^\$\*'"\[\]\(\)\.#]+?)?:([-a-z0-9_]+)(?:\(["']?(.+?)?["']?\))?$/i;
    \-------------------------------/       \--------/           \---/
                    |                           |                  |
                 Context                      Filter            Argument
*/

var attrSelectRe = /^([a-z0-9_]+)?((?:\[(?:[-a-z0-9_]+)(?:[=~\|\^\$\*]?)=?["']?(?:[^\]"']*)["']?\])+)?$/i;
var attrParseRe = /\[([-a-z0-9_]+)([=~\|\^\$\*]?)=?["']?([^\]"']*)["']?\]/ig;
var filterParseRe = /^([a-z0-9\s=~\|\^\$\*'"\[\]\(\)\.#]+?)?:([-a-z0-9_]+)(?:\(["']?(.+?)?["']?\))?$/i;

/*
 * Takes a dom tree or part of one from htmlparser and applies
 * the provided selector against. The returned value is also
 * a valid dom tree, so can be passed by into
 * htmlparser.DomUtil.* calls
 */

exports.select = function(dom, selector){

    var subsels = selector.split(/(?:\s*)?,(?:\s*)?/),
        ctxs = [];

    for(var i = 0; i < subsels.length; i++){
        ctxs = ctxs.concat(_select(dom, subsels[i]));
    }

    return ctxs;
};

/*
 * Provides filters for select()
 *
 * The filters return values are also valid dom trees
 * and valid arrays, so they can be iterated or passed
 * to other calls that require a dom context.
 */

// TODO: Loop-optimization-foo required
// FIXME: :has() and :not() are very slow

var filters = {
    // Content filters
    "contains": function(ctx, val){
        var found = [],
            valRe = new RegExp(val);

        var recurse = function(node){
            if(node.children){
                for(var j = 0; j < node.children.length; j++){
                    var child = node.children[j];
                    if(child.children)
                        recurse(child);
                    else if(child.data)
                        if(valRe.test(child.data))
                            found.push(node);
                }
            }
        }

        for(var i = 0; i < ctx.length; i++){
            for(var p = 0; p < ctx[i].length; p++){
                recurse(ctx[i][p]);
            }
        }

        return found;
    },
    "empty": function(ctx){
        var found = [];

        var recurse = function(node){
            if(typeof node.children === "undefined")
                if(node.type === "tag") found.push(node);
            else{
                for(var g = 0; g < node.children.length; g++){
                    recurse(node.children[g]);
                }
            }
        }

        for(var i = 0; i < ctx.length; i++){
            for(var p = 0; p < ctx[i].length; p++){
                recurse(ctx[i][p]);
            }
        }

        return found;
    },
    "parent": function(ctx, val){
        var found = [];

        var recurse = function(node){
            if(node.children && node.children !== []){
                found.push(node)
                for(var g = 0; g < node.children.length; g++){
                    recurse(node.children[g]);
                }
            }
        }

        for(var i = 0; i < ctx.length; i++){
            for(var p = 0; p < ctx[i].length; p++){
                recurse(ctx[i][p]);
            }
        }

        return found;
    },
    "has": function(ctx, val){
        // NOTE: There is a small, small probability that a hash collision
        // could occur. If you experiance any errors, please note it might be a collision
        // and completely my fault
        var key = Math.round(Math.random()*1000) << 16,
            found = [];

        // Modified from a hash found on http://pmav.eu/stuff/javascript-hashing-functions/source.html
        var hash = function(s){
            var i, hash = 0;
            for (i = 0; i < s.length; i++){ hash ^= (s[i].charCodeAt() * (i+1)) }

            return Math.abs(hash) % key;
        }

        var needs = exports.select(ctx, val).map(function(e){ return hash(ins(e, false, null)) });

        var cmp = function(obj){
            var hashObj = hash(ins(obj, false, null)),
                match = false;

            for(var t = 0; t < needs.length; t++){
                if(hashObj === needs[t]){
                    match = true;
                    break;
                }
            }

            return match;
        }

        var recurse = function(node){
            if(node.children){
                for(var c = 0; c < node.children.length; c++){
                    recurse(node.children[c]);
                    if(cmp(node.children[c])){
                        found.push(node);
                        break;
                    }
                }
            }
        }

        for(var j = 0; j < ctx.length; j++){
            for(var p = 0; p < ctx[j].length; p++){
                recurse(ctx[j][p]);
            }
        }

        return found;
    },
    // Basic filters
    "header": function(ctx, val){
        var found = [],
            sort = function(name){ return /^h[1-9]+$/.test(name) };

        for(var i = 0; i < ctx.length; i++){
            found = found.concat(domUtils.getElements({ tag_name : sort }, ctx[i], true));
        }

        return found;
    },
    "not": function(ctx, val){
        // See NOTE on :has()
        var key = Math.round(Math.random()*1000) << 16,
            found = [];

        var hash = function(s){
            var i, hash = 0;
            for (i = 0; i < s.length; i++){ hash ^= (s[i].charCodeAt() * (i+1)) }

            return Math.abs(hash) % key;
        }

        var nots = exports.select(ctx, val).map(function(e){ return hash(ins(e, false, null)) });

        var cmp = function(obj){
            var hashObj = hash(ins(obj, false, null)),
                match = false;

            for(var t = 0; t < nots.length; t++){
                if(hashObj === nots[t]){
                    match = true;
                    break;
                }
            }

            return match;
        }

        var recurse = function(node){
            // Don't want text nodes right?
            if(node.name && !cmp(node)) found.push(node);

            if(node.children){
                for(var c = 0; c < node.children.length; c++){
                    recurse(node.children[c]);
                }
            }
        }

        for(var j = 0; j < ctx.length; j++){
            for(var p = 0; p < ctx[j].length; p++){
                recurse(ctx[j][p]);
            }
        }

        return found;
    },
    "eq": function(ctx, val){
        var found = [];
        for(var i = 0; i < ctx.length; i++){
            found = found.concat(ctx[i]);
        }
        return [found[val]];
    },
    "gt": function(ctx, val){
        var found = [];
        for(var i = 0; i < ctx.length; i++){
            found = found.concat(ctx[i]);
        }
        return found.slice(-(val));
    },
    "lt": function(ctx, val){
        var found = [];
        for(var i = 0; i < ctx.length; i++){
            found = found.concat(ctx[i]);
        }
        return found.slice(0, val);
    },
    "even": function(ctx){
        var found = [];
        for(var i = 0; i < ctx.length; i++){
            for(var j = 0; j < ctx[i].length; j++){
                if((j % 2) === 1) found.push(ctx[i][j]);
            }
        }
        return found;
    },
    "odd": function(ctx){
        var found = [];
        for(var i = 0; i < ctx.length; i++){
            for(var j = 0; j < ctx[i].length; j++){
                if((j % 2) === 0) found.push(ctx[i][j]);
            }
        }
        return found;
    },
    "first": function(ctx){
        return filters.eq(ctx, 0);
    },
    "last": function(ctx){
        var last = ctx[ctx.length-1];
        return last.length ? last[last.length-1] : [];
    },
};

/*
 * You can add your own custom filters by adding them to
 * the filters object.
 */

exports.filters = filters;

/*
 * select()'s real implementation
 */

var _select = function(dom, selector) {
    var currentContext = Array.isArray(dom) ? dom : [dom],
        found, tag, options;

    // This allows requests like "#main [class='main post']" or "dev span:contains("add by")
    // without spliting on the space between 'main' and 'post' or 'add' and 'by'

    // TODO: This is hacky, FIXME
    var tokens = [];
    selector.split(/\s+/).forEach(function(part, i){
        if(/[\]\)]/.test(part) && !/[\[\(]/.test(part))
            tokens[i-1] = tokens[i-1].concat(" "+part);
        else tokens[i] = part;
    });

    tokens = tokens.filter(function(elem){ return elem.length ? true : false });

    var applyFilter = function(filterMatch){
        var presel = filterMatch[1],
            fil = filters[filterMatch[2]] || function(){ return [] },
            arg = filterMatch[3];

        found = [];
        if( presel ){
            // filter those matching the left side of the :
            for(var v = 0; v < currentContext.length; v++){
                var res = _select(currentContext[v], presel);
                if(res.length) found.push(res);
            }

            //now apply filter
            found = fil(found, arg);
        }else{
            // if no left side is found, assume that you want this parsed
            currentContext = [currentContext];
            found = fil(currentContext, arg);
        }

        // Makes sure that the argMatch applyFilter has the right context
        currentContext = found;

        // Handle nested filters
        var argMatch = filterParseRe.exec(arg);
        if(argMatch)
            applyFilter(argMatch);

        currentContext = found;
    }

    for ( var i = 0; i < tokens.length; i++ ) {

        var filterMatch, match;

        // Star selector
        if( tokens[i] === "*" ){
            // Nothing to do here
            continue;
        }

        // Filter selectors
        else if( filterMatch = filterParseRe.exec(tokens[i])){
            // All the work happens in applyFilter
            applyFilter(filterMatch);
        }

        // Attribute and Tag selectors
        else if ( match = attrSelectRe.exec(tokens[i])) {
            var tag = match[1], attributes = match[2];

            found = [];
            if ( tag ) {
                // Filter to only those matching the tag name
                for(var t = 0; t < currentContext.length; t++){
                    found = found.concat(domUtils.getElementsByTagName(tag, currentContext[t], true));
                }

                currentContext = found;
            }

            if ( attributes ) {
                // Further refine based on attributes
                var attrmatch;
                while(attrmatch = attrParseRe.exec(attributes)){
                    var attr = attrmatch[1],
                        operator = attrmatch[2],
                        value = attrmatch[3];

                    options = {};
                    // Gets the appropriate comparison function for the
                    // symbol
                    options[attr] = makeValueChecker(operator, value);

                    found = [];
                    for(var q = 0; q < currentContext.length; q++){
                        // Don't want any recursion if we're already in the set of tags which have
                        // the desired tag name
                        found = found.concat(domUtils.getElements(options, currentContext[q], (tag ? false : true)));
                    }

                    currentContext = found;
                }
            }

            currentContext = found;
        }

        // ID selector
        else if ( tokens[i].indexOf('#') !== -1 ) {
            found = [];

            var id_selector = tokens[i].split('#', 2)[1];

            // need to stop on the first id found (in bad HTML)...
            found.push(domUtils.getElementById(id_selector, currentContext, true));

            if (!found[0]) {
                currentContext = [];
                break;
            }

            currentContext = found;
        }

        // Class selector
        else if ( tokens[i].indexOf('.') !== -1 ) {
            var parts = tokens[i].split('.');
            tag = parts[0];
            options = {};

            options['class'] = function (value) {
                if (!value) return false;

                var classes = value.split(/\s+/);
                for (var i = 1, len = parts.length; i < len; i++) {
                    if (classes.indexOf(parts[i]) == -1) return false;
                }

                return true;
            };

            found = [];
            for ( var l = 0; l < currentContext.length; l++ ) {
                var context = currentContext[l];
                if ( tag.length > 0 ) {
                    context = domUtils.getElementsByTagName(tag, context, true);
                    // don't recurse in the case we have a tag or we get children we might not want
                    found = found.concat(domUtils.getElements(options, context, false));
                } else {
                    found = found.concat(domUtils.getElements(options, context, true));
                }
            };

            currentContext = found;
        }

        // Nothing matches
        else{

            currentContext = [];
            break;
        }
   };

	return currentContext;
};

/*
 * Takes an operator and a value and returns a function which can be used to
 * test other values against test provided value using the given operation
 * Used to checking attribute values for attribute selectors
 */

var makeValueChecker = function(operator, value) {
    value = typeof(value) === 'string' ? value : '';

    return operator ? {
        '=': function ( test_value ) { return test_value === value; },
        // attribute includes value as one of a set of space separated tokens
        '~': function ( test_value ) { return test_value ? test_value.split(/\s+/).indexOf(value) !== -1 : false; },
        // attribute starts with value
        '^': function ( test_value ) { return test_value ? test_value.substr(0, value.length) === value : false; },
        // attribute ends with value
        '$': function ( test_value ) { return test_value ? test_value.substr(-value.length) === value : false; },
        // attribute contains value
        '*': function ( test_value ) { return test_value ? test_value.indexOf(value) !== -1 : false; },
        // attribute is either exactly value or starts with value-
        '|': function ( test_value ) { return test_value ? test_value === value ||
             test_value.substr(0, value.length + 1) === value + '-' : false; },
        // default to just check attribute existence...
        }[operator] : function ( test_value ) { return test_value ? true : false; };

}
