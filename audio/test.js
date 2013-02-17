
var pile = [
  {
    type: 'function',
    params: 0,
    children: [
      {
        type: 'block',
        children: [],
      },
    ],
  },
  {
    type: 'function',
    params: 2,
    children: [
      {
        type: 'block',
        children: [],
      },
      {
        type: 'block',
        children: [
          {
            type: 'block',
            children: [],
          },
        ],
      },
    ],
  },
];

var startNote = MIDI.keyToNote['C5'];
var bpm = 120;
var beatLength = 1 / (bpm / 60);
var beatsPerBar = 4;
var barLength = beatLength * beatsPerBar;
var notesPerBar = 8;
var noteLength = barLength / notesPerBar;
var sequenceInterval = noteLength;
var velocity = 127;
var melodyChannel = 0;
var drumChannel = 1;
var sequenceIndex = 0;

var playMelodyNote = function(depth) {
  MIDI.noteOn(melodyChannel, startNote - depth, velocity, sequenceIndex * sequenceInterval);
  MIDI.noteOff(melodyChannel, startNote - depth, sequenceIndex * sequenceInterval + noteLength);
  sequenceIndex++;
};

var playMunch = function(munch, depth) {
  playMelodyNote(depth);
  if (munch.children) {
    playMunchPile(munch.children, depth + 1);
  }
  if (munch.type === 'function' && sequenceIndex % notesPerBar != 0) {
    sequenceIndex += notesPerBar - sequenceIndex % notesPerBar;
  }
};

var playMunchPile = function(pile, depth) {
  for (var i = 0; i < pile.length; i++) {
    playMunch(pile[i], depth);
  }
};

var playDrums = function() {
  var bars = sequenceIndex / notesPerBar;
  for (var i = 0; i < bars; i++) {
    var index = i * notesPerBar;
    for (var j = 0; j < beatsPerBar; j++) {
      MIDI.noteOn(drumChannel, 61, velocity, index * sequenceInterval + j * beatLength);
      MIDI.noteOff(drumChannel, 61, velocity, index * sequenceInterval + (j+1) * beatLength);
    }
  }
};

MIDI.loadPlugin({
  api: 'webmidi',
  soundfontUrl: './MIDI.js-master/soundfont/',
  instruments: ['acoustic_grand_piano', 'synth_drum'],
  callback: function() {
    MIDI.setVolume(0, 127);
    MIDI.setVolume(1, 127);
    MIDI.programChange(1, 118);
    playMunchPile(pile, 0);
    playDrums();
  },
});
