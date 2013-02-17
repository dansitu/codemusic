$(function(){

  var munchPile = [];
  var last;

  var muncher = new CodeMuncher(function(depth, analyzing){
    var current = this[0];

    var newChunk = {
      type: current.start.value
      , params: 0
      , children: []
      , depth: depth
    };

    // var indent = "";
    // for(var i=0;i<depth;i++){
    //   indent += "  ";
    // }
    // console.log(indent + current.start.line + " " + current.start.value);

    if(current.start.value === "function"){
      var fileSubstring = muncher.code.substring(current.start.endpos);
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

      // console.log(indent+"  "+paramCount+" params");

    }

    munchPile.push(newChunk);
  
  });

  $("#go").click(function(){
  
    var selectedFile = $("#fileBrowser").get(0).files[0];
    var reader = new FileReader();

    reader.onload = function(evt){
      muncher.munch(evt.target.result);

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

      console.log(munchTree);

    }

    reader.readAsText(selectedFile);

  });

});

