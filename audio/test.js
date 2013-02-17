
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

var startNote = MIDI.keyToNote['C1'];
var startDepth = 40;
var bpm = 140;
var beatLength = 1 / (bpm / 60);
var beatsPerBar = 4;
var barLength = beatLength * beatsPerBar;
var notesPerBar = 8;
var noteLength = barLength / notesPerBar;
var sequenceInterval = noteLength;
var velocity = 100;
var drumVelocity = 100;
var bassVelocity = 100;
var padVelocity = 100;
var melodyChannel = 0;
var drumChannel = 1;
var bassChannel = 2;
var padChannel = 3;
var sequenceIndex = 0;

var resetAudio = function(){
  sequenceIndex = 0;
}

var synthesizeDrums = function() {
  var midi = [];
  var bars = sequenceIndex / notesPerBar;
  for (var i = 0; i < bars; i++) {
    var index = i * notesPerBar;
    for (var j = 0; j < beatsPerBar; j++) {
      midi.push({
        channel: drumChannel,
        note: MIDI.keyToNote['B3'],
        velocity: drumVelocity,
        delay: index * sequenceInterval + j * beatLength,
        length: beatLength/4,
      });
    }
    var bassLength = beatLength/4;
    midi.push({
      channel: bassChannel,
      note: MIDI.keyToNote['A2'],
      velocity: bassVelocity,
      delay: index * sequenceInterval,
      length: bassLength,
    });
    midi.push({
      channel: bassChannel,
      note: MIDI.keyToNote['A3'],
      velocity: bassVelocity,
      delay: index * sequenceInterval + 2 * bassLength,
      length: bassLength,
    });
    midi.push({
      channel: bassChannel,
      note: MIDI.keyToNote['A3'],
      velocity: bassVelocity,
      delay: index * sequenceInterval + 4 * bassLength,
      length: bassLength,
    });
    midi.push({
      channel: bassChannel,
      note: MIDI.keyToNote['A3'],
      velocity: bassVelocity,
      delay: index * sequenceInterval + 8 * bassLength,
      length: bassLength,
    });
    midi.push({
      channel: bassChannel,
      note: MIDI.keyToNote['A3'],
      velocity: bassVelocity,
      delay: index * sequenceInterval + 14 * bassLength,
      length: bassLength,
    });
    // Pad.
    /*
    midi.push({
      channel: padChannel,
      note: MIDI.keyToNote['A2'],
      velocity: padVelocity,
      delay: index * sequenceInterval,
      length: barLength,
    });
    midi.push({
      channel: padChannel,
      note: MIDI.keyToNote['E3'],
      velocity: padVelocity,
      delay: index * sequenceInterval,
      length: barLength,
    });
    midi.push({
      channel: padChannel,
      note: MIDI.keyToNote['Db4'],
      velocity: padVelocity,
      delay: index * sequenceInterval,
      length: barLength,
    });*/
  }
  return midi;
};

var append = function(a, b) {
  for (var i = 0; i < b.length; i++) {
    a.push(b[i]);
  }
};

var scaleContains = function(note) {
  var key = MIDI.noteToKey[note];
  key = key.substr(0, key.length - 1);
  return key === 'Db' ||
    key === 'D' ||
    key === 'E' ||
    key === 'Gb' ||
    key === 'Ab' ||
    key === 'A' ||
    key === 'B';
};

var computeScaleNote = function(startNote, depth) {
  var note = startNote;
  for (var i = 0; i < depth; i++) {
    note++;
    while (!scaleContains(note)) {
      note++;
    }
  }
  return note;
};

var synthesizeMunch = function(munch, depth) {

  if(munch.type === 'function'){
    depth -= 8;
    //depth -= Math.floor(munch.length / 500);
  }
  // Errors per line in each munch
  var shitnessRatio = munch.lintErrors/(munch.end - munch.start);
  // console.log(shitnessRatio);
  // Modify the note if there are lint errors
  var noteMod = 0;
  if(munch.lintErrors > 0){
    noteMod -= 9;
    console.log("lint error detected");
  }
  var midi = [
    {
      channel: melodyChannel,
      note: computeScaleNote(startNote, depth) + noteMod,
      velocity: Math.min(127, Math.floor(velocity * munch.length / 500)),
      delay: sequenceIndex * sequenceInterval,
      //length: Math.floor(munch.length / 500),
      length: noteLength
    },
  ];
  sequenceIndex++;
  if (munch.length >= 300) {
    sequenceIndex++;
  }
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
  return synthesizeDepth(pile, startDepth);
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

/*MIDI.loadPlugin({
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
