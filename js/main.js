$(function(){

  var muncher = new CodeMuncher()

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

