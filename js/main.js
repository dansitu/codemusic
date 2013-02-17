$(function(){

  // The fileReader reads files for us
  var fileReader = new FileReader();
  fileReader.onload = _fileLoaded;

  // The muncher is what 'digests' our code
  var muncher = new CodeMuncher();

  // If the 'go' button is clicked, read the file
  $("#go").click(readSelectedFile)
    
  // ## readSelectedFile
  // Reads the file currently highlighted in the file browser
  function readSelectedFile(){
  
    var selectedFile = $("#fileBrowser").get(0).files[0];

    fileReader.readAsText(selectedFile);

  }

  // ## _fileLoaded
  // When the fileReader has loaded a file, munch and play it!
  function _fileLoaded(evt){

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

});

