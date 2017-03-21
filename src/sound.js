var lame = require("lame");
var Speaker = require("speaker");
var Oscillator = require("audio-oscillator");

function play(stream) {
  var speaker = new Speaker();
  //speaker.on('finish', () => { console.log('stream finished') });
  stream.pipe(new lame.Decoder()).pipe(speaker);
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
