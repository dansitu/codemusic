var fs = require("fs");

var jsp = require("uglify-js").parser;
var pro = require("uglify-js").uglify;
var program = require("commander");
var _ = require("underscore");

program
    .version("0.0.1")
    .parse(process.argv);

if(!program.args.length){
    console.log("You need to supply a file name.");
    return;
}

var file = fs.readFileSync(program.args[0], "utf8");

console.log("Done reading the file!");

try {
    var ast = jsp.parse(file, false, true);
} catch(ex){
    console.log("Exception: ", ex);
    return;
}

// https://github.com/mishoo/UglifyJS/blob/master/tmp/instrument.js
var w = pro.ast_walker();

//
// Idea: While walking the stack, give each block or function a random id. Call 'trace'
// with the id of every block or function we are inside at the current time.
// How do we know we're in the same function or block if we got to it from multiple places? Name
// can't be relied upon, so we have to compare its contents? Maybe we can hash the serialized contents
// of a block and use this for the id?
//
// Then, whenever 'trace' is called, we use a different instrument for each id and step the
// current frequency up one step for each level of 'depth'.
//
//
// example:
//
// function (){ // abc
//    trace("abc", 1); // instrument abc plays the 1st note in its scale
//    function(){ // def
//      trace(["abc", "def"], 2); // instrument abc and def play the 2nd note in their scales
//    }
// }
//
// Better way of doing that: keep track of current note for each instrument.
//
var analyzing = [];
function do_stat() {
    var ret;
    if (this[0].start && analyzing.indexOf(this) < 0) {
        // without the `analyzing' hack, w.walk(this) would re-enter here leading
        // to infinite recursion
        analyzing.push(this);
        // Insert the splice AFTER 'this'

        var indent = "";
        analyzing.forEach(function(){
          indent += "  ";
        });
        console.log(indent + this[0].start.line + " " + this[0].start.value);


        ret = w.walk(this);

        analyzing.pop(this);
    }

    return ret;
};

function containerIdentity(node){
    return node[0].name;
}

function blockDepth(analyzing){
    return _.filter(analyzing, function(node){
        return node[0].name === "block" || node[0].name === "defun" || node[0].name === "function";
    }).length;
}

var new_ast = w.with_walkers({
    // "stat"     : do_stat,
    // "label"    : do_stat,
    // "break"    : do_stat,
    // "continue" : do_stat,
    // "debugger" : do_stat,
    // "var"      : do_stat,
    // "const"    : do_stat,
    // "return"   : do_stat,
    // "throw"    : do_stat,
    // "try"      : do_stat,
    "defun"    : do_stat,
    "function" : do_stat,
    // "if"       : do_stat,
    // "while"    : do_stat,
    // "do"       : do_stat,
    // "for"      : do_stat,
    // "for-in"   : do_stat,
    // "switch"   : do_stat,
    "block"   : do_stat,
    // "with"     : do_stat,
}, function(){
    return w.walk(ast);
});

var output =  pro.gen_code(new_ast, { beautify: true });

// console.log(output);
