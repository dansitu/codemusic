$(function(){

  // The fileReader reads files for us
  var fileReader = new FileReader();
  fileReader.onload = _fileLoaded;

  // The muncher is what 'digests' our code
  var muncher = new CodeMuncher();

  var doc = document.getElementById("dragBox");
  doc.ondragover = function () { $(this).addClass('hover'); return false; };
  doc.ondragend = function () { $(this).removeClass('hover'); return false; };
  doc.ondrop = function (event) {
    event.preventDefault && event.preventDefault();
    $(this).removeClass('hover');

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

    try { 
      var munched = muncher.munch(evt.target.result);
    } catch(ex){
      errorOut(ex, "Couldn't parse this file!");
      return;
    }

    try {
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
    } catch(ex){
      errorOut(ex, "Error during playback!");
      return;
    }
  }

  function errorOut(err, message){
    console.log(err);
    $(".cm-errors .alert").text(message).removeClass("hidden");
  }

});

