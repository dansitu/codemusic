
var CodeMuncher = function(eachLineCallback){

  this.jsp = require("uglify-js").parser;
  this.pro = require("uglify-js").uglify;

  this.eachLineCallback = eachLineCallback;

}

CodeMuncher.prototype.munch = function(code){

  var self = this;

  var ast = self.jsp.parse(code, false, true);

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
            , length: current.end.pos - current.start.pos
            , start: current.start.line
            , end: current.end.line
            , lintErrors: 0
            // , text: code.substring(current.start.pos, current.end.pos)
          };

          if(current.start.value === "function"){
            var fileSubstring = code.substring(current.start.endpos);
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
      "if"       : do_stat,
      // "while"    : do_stat,
      // "do"       : do_stat,
      "for"      : do_stat,
      // "for-in"   : do_stat,
      "switch"   : do_stat,
      "block"   : do_stat,
      // "with"     : do_stat,
  }, function(){
      return w.walk(ast);
  });

  // By now the munchpile should be full. Let's run the code 
  // through jslint and augment the munchpile data
  var lint = JSLINT(code);
  // Were there any errors?
  if(!lint){
    JSLINT.errors.forEach(function(error){
      // error is sometimes null??
      if(!error) return;
      // Step through the munchpile and find the best
      // munch (in terms of being where the error happened
      var best;
      for(var i=0;i<munchPile.length;i++){
        var currMunch = munchPile[i];
        // If this err was outside this munch, forget this munch
        if(error.line < currMunch.start || error.line > currMunch.end){
          continue;
        }
        // If we don't have a best yet, use thisone
        if(!best){
          best = currMunch;
          continue;
        }
        // dist from start plus dist from end
        var currDist = (error.line - currMunch.start) + (currMunch.end - error.line);
        var lastBestDist = (error.line - best.start) + (best.end - error.line);

        if(currDist < lastBestDist){
          best = currMunch;
        }
      
      }

      // If we found a match, it has lint errors, so tell it that it does
      if(best) {
        best.lintErrors += 1;
      }
    
    });
  
  }


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
