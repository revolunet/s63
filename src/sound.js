var lame = require("lame");
var Speaker = require("speaker");
var Oscillator = require("audio-oscillator");

function play(stream) {
  var decoder = new lame.Decoder();
  var speaker = new Speaker();
  stream.pipe(decoder).pipe(speaker);
  return speaker;
}

function sine() {
  var Oscillator = require("audio-oscillator");
  var speaker = new Speaker();
  return Oscillator({
    frequency: 440,
    detune: 0,
    type: "sine",
    normalize: true
  }).pipe(speaker);
  return speaker;
}

module.exports = {
  play: play,
  sine: sine
};
