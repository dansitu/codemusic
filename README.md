# Code Music
## Synopsis
Converts javascript into a MIDI stream.

Demo at http://dansitu.github.com/codemusic/

Give it a second to spin up after dragging in a file. If there's an error, you'll see it.

## Explanation
We wanted to turn code into music, letting you hear the difference between good code and bad.  

We attempt this by:  

- Breaking down javascript into an abstract syntax tree using uglify.js
- Converting the AST into a simplified structure
- Annotating this structure with information obtained from a jslint of the code
- Creating MIDI commands based on this structure
- Outputting these commands through MIDI.js's webaudio output OR through an attached midi controller and jazz-plugin (if installed)

## Features
- There's a constant drum and bass loop in the background
- A note is played every time a function, if-statement or block is entered
- Function nesting drops the melody by one octave per function
- Filter cutoff is set based on number of jslint errors per line in the current function or block

The result is that the music sounds more dark, menacing and dangerous as the amount of function nesting and lint errors increases.  
Unreadable code is scary.

## Apology
Sorry for the awful code - it was written at a hackathon!

## Credits
Built by @dansitu and @ryanlbrown for http://sf.musichackday.org/2013


