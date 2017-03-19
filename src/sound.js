var lame = require("lame"), Speaker = require("speaker");

function play(stream) {
  var decoder = new lame.Decoder(), speaker = new Speaker();
  stream.pipe(decoder).pipe(speaker);
}

modules.exports = {
  play: play
};
