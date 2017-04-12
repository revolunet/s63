var play = require("./sound").play;
var sine = require("./sound").sine;

class Player {
  constructor() {
    this.playing = null;
    this.sine = this.sine.bind(this);
  }
  stop() {
    console.log("Player", "stop");
    if (this.playing) {
      this.playing.removeListener("finish", this.sine);
      this.playing.end();
      this.playing = null;
    }
  }
  sine() {
    console.log("Player", "sine");
    this.stop();
    this.playing = sine();
  }
  play(stream, cb) {
    this.stop();
    const speaker = play(stream);
    this.playing = speaker;
    return new Promise((resolve, reject) => {
      speaker.on("finish", () => {
        resolve();
        (cb || this.sine)();
      });
    });
  }
}

module.exports = Player