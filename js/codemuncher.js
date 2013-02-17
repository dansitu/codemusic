
var CodeMuncher = function(eachLineCallback){

  this.jsp = require("uglify-js").parser;
  this.pro = require("uglify-js").uglify;

  this.eachLineCallback = eachLineCallback;

}

CodeMuncher.prototype.munch = function(code){

  var self = this;

  self.code = code;

  try {
      var ast = self.jsp.parse(code, false, true);
  } catch(ex){
      console.log("Exception: ", ex);
  }

  var w = self.pro.ast_walker();

  var analyzing = [];

  var munchPile = [];

  // Gets called by walker
  function do_stat() {
      var ret;

      var current = this[0];

      if (current.start && analyzing.indexOf(this) < 0) {
          // without the `analyzing' hack, w.walk(this) would re-enter here leading
          // to infinite recursion
          analyzing.push(this);

          var depth = analyzing.length;
          var current = this[0];

          var newChunk = {
            type: current.start.value
            , params: 0
            , children: []
            , depth: depth
          };

          if(current.start.value === "function"){
            var fileSubstring = self.code.substring(current.start.endpos);
            var firstParen = fileSubstring.indexOf("(")+1;
            var secondParen = fileSubstring.indexOf(")");

            var paramCount;
            if(secondParen === firstParen){
              paramCount = 0;
            } else {
              var paramString = fileSubstring.substring(firstParen, secondParen);
              paramCount = Math.max(1,paramString.split(",").length);
            }

            newChunk.params = paramCount;

          }

          munchPile.push(newChunk);

          ret = w.walk(this);

          analyzing.pop(this);
      }

      return ret;
  };

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


  var munchTree = [];

  var munches = 0;
  for(var i=munchPile.length-1;i>=0;i--){
    var curr = munchPile[i];
    // Put depth1 in output
    if(curr.depth === 1) {
      munchTree.splice(0, 0, curr);
      continue;
    }
    // Find the nearest thing with a lower depth
    // and add this as a child
    for(var x=i;x>=0;x--){
      if(munchPile[x].depth < curr.depth){
        munchPile[x].children.splice(0, 0, curr);
        break;
      }
    }
  }

  return munchTree;

}

window.CodeMuncher = CodeMuncher;
