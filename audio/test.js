
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

var note = MIDI.keyToNote['C5'];
var bpm = 120;
var beatLength = 1 / (bpm / 60);
var noteLength = beatLength / 8;
var sequenceInterval = beatLength / 4;
var velocity = 127;
var delay = 0;

MIDI.setVolume(0, 127);

var playMunch = function(munch, depth) {
  if (munch.type === 'function') {
    
  } else if (munch.type === 'block') {

  }
}

var playMunchPile = function(pile, depth) {
  if (pile.children) {
    for (var i = 0; i < pile.children.length; i++) {
      play(pile.children[i], depth + 1);
    }
  }
}

MIDI.loadPlugin({
  api: 'webmidi',
  soundfontUrl: './MIDI.js-master/soundfont/',
  callback: function() { playPile(pile); },
});
