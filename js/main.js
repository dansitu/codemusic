$(function(){

  // The fileReader reads files for us
  var fileReader = new FileReader();
  fileReader.onload = _fileLoaded;

  // The muncher is what 'digests' our code
  var muncher = new CodeMuncher();

  var doc = document.documentElement;
  doc.ondragover = function () { this.className = 'hover'; return false; };
  doc.ondragend = function () { this.className = ''; return false; };
  doc.ondrop = function (event) {
    event.preventDefault && event.preventDefault();
    this.className = '';

    // now do something with:
    // var files = event.dataTransfer.files;
    fileReader.readAsText(event.dataTransfer.files[0]);

    return false;
  };
    
  // ## readSelectedFile
  // Reads the file currently highlighted in the file browser
  function readSelectedFile(){
  
    var selectedFile = $("#fileBrowser").get(0).files[0];

    fileReader.readAsText(selectedFile);

  }

  // ## _fileLoaded
  // When the fileReader has loaded a file, munch and play it!
  function _fileLoaded(evt){

    var munched = muncher.munch(evt.target.result);

    MIDI.loadPlugin({
      api: 'webmidi',
      soundfontUrl: './audio/MIDI.js-master/soundfont/',
      instruments: ['acoustic_grand_piano', 'synth_drum'],
      callback: function() {

        resetAudio();

        MIDI.setVolume(0, 127);
        MIDI.setVolume(1, 127);
        MIDI.programChange(1, 118);
        var midi = synthesize(munched);
        append(midi, synthesizeDrums());
        play(midi);
      },
    });
  }

});

