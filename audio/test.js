
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

var synthesizeDrums = function() {
  var midi = [];
  var bars = sequenceIndex / notesPerBar;
  for (var i = 0; i < bars; i++) {
    var index = i * notesPerBar;
    for (var j = 0; j < beatsPerBar; j++) {
      midi.push({
        channel: drumChannel,
        note: 61,
        velocity: velocity,
        delay: index * sequenceInterval + j * beatLength,
        length: beatLength,
      });
    }
  }
  return midi;
};

var append = function(a, b) {
  for (var i = 0; i < b.length; i++) {
    a.push(b[i]);
  }
};

var synthesizeMunch = function(munch, depth) {
  var midi = [
    {
      channel: melodyChannel,
      note: startNote - depth,
      velocity: velocity,
      delay: sequenceIndex * sequenceInterval,
      length: noteLength,
    },
  ];
  sequenceIndex++;
  if (munch.children) {
    append(midi, synthesizeDepth(munch.children, depth + 1));
  }
  if (munch.type === 'function' && sequenceIndex % notesPerBar != 0) {
    sequenceIndex += notesPerBar - sequenceIndex % notesPerBar;
  }
  return midi;
};

var synthesizeDepth = function(pile, depth) {
  var midi = [];
  for (var i = 0; i < pile.length; i++) {
    append(midi, synthesizeMunch(pile[i], depth));
  }
  return midi;
};

var synthesize = function(pile) {
  return synthesizeDepth(pile, 0);
};

var notesPerSchedule = 20;
var scheduleInterval = 1000;

var play = function(midi) {
  midi.sort(function(a, b) {
    return a.delay - b.delay;
  });
  var playNext = function(midi, a, b, f) {
    for (var i = a; i < midi.length && i < b; i++) {
      var msg = midi[i];
      MIDI.noteOn(msg.channel, msg.note, msg.velocity, msg.delay);
      MIDI.noteOff(msg.channel, msg.note, msg.delay + msg.length);
    }
    setTimeout(function() { f(midi, b, b + notesPerSchedule, f); }, scheduleInterval);
  };
  playNext(midi, 0, notesPerSchedule, playNext);
};

/*
MIDI.loadPlugin({
  api: 'webmidi',
  soundfontUrl: './MIDI.js-master/soundfont/',
  instruments: ['acoustic_grand_piano', 'synth_drum'],
  callback: function() {
    MIDI.setVolume(0, 127);
    MIDI.setVolume(1, 127);
    MIDI.programChange(1, 118);
    var midi = synthesize(pile);
    append(midi, synthesizeDrums());
    play(midi);
  },
});
*/
