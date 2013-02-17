$(function(){

  var muncher = new CodeMuncher(function(depth, analyzing){
    var current = this[0];

    var newChunk = {
      type: current.start.value
      , params: 0
      , children: []
      , depth: depth
    };

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

    muncher.munchPile.push(newChunk);
  
  });

  $("#go").click(function(){
  
    var selectedFile = $("#fileBrowser").get(0).files[0];
    var reader = new FileReader();

    reader.onload = function(evt){
      muncher.munch(evt.target.result);

      var munchTree = [];
      var munches = 0;
      for(var i=muncher.munchPile.length-1;i>=0;i--){
        var curr = muncher.munchPile[i];
        // Put depth1 in output
        if(curr.depth === 1) {
          munchTree.splice(0, 0, curr);
          continue;
        }
        // Find the nearest thing with a lower depth
        // and add this as a child
        for(var x=i;x>=0;x--){
          if(muncher.munchPile[x].depth < curr.depth){
            muncher.munchPile[x].children.splice(0, 0, curr);
            break;
          }
        }
      }

      MIDI.loadPlugin({
        api: 'webmidi',
        soundfontUrl: './audio/MIDI.js-master/soundfont/',
        instruments: ['acoustic_grand_piano', 'synth_drum'],
        callback: function() {
          MIDI.setVolume(0, 127);
          MIDI.setVolume(1, 127);
          MIDI.programChange(1, 118);
          playMunchPile(munchTree, 0);
          playDrums();
        },
      });

    }

    reader.readAsText(selectedFile);

  });

});

