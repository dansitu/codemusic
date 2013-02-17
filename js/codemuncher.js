
var CodeMuncher = function(eachLineCallback){

  this.jsp = require("uglify-js").parser;
  this.pro = require("uglify-js").uglify;

  this.eachLineCallback = eachLineCallback;

  this.munchPile = [];

}

CodeMuncher.prototype.munch = function(code){

  var self = this;

  self.code = code;

  self.munchPile = [];

  try {
      var ast = self.jsp.parse(code, false, true);
  } catch(ex){
      console.log("Exception: ", ex);
  }

  var w = self.pro.ast_walker();

  var analyzing = [];

  // Gets called by walker
  function do_stat() {
      var ret;

      var current = this[0];

      if (current.start && analyzing.indexOf(this) < 0) {
          // without the `analyzing' hack, w.walk(this) would re-enter here leading
          // to infinite recursion
          analyzing.push(this);

          // Call the per-line callback
          self.eachLineCallback.call(this, analyzing.length, analyzing);

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

}

window.CodeMuncher = CodeMuncher;
