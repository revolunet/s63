"use strict";

var five = require("johnny-five");
var Raspi = require("raspi-io");

var Rotary = require("./Rotary");
var play = require("./sound").play;
var sine = require("./sound").sine;

var fs = require("fs");
var path = require("path");
var fetch = require("node-fetch");

//var Player = require('player');

var board = new five.Board({
  io: new Raspi()
});

class Player {
  constructor() {
    this.playing = null;
    this.sine = this.sine.bind(this);
  }
  stop() {
    board.info("Player", "stop");
    if (this.playing) {
      this.playing.removeListener("finish", this.sine);
      this.playing.end();
      this.playing = null;
    }
  }
  sine() {
    board.info("Player", "sine");
    this.stop();
    this.playing = sine();
  }
  play(stream) {
    board.info("Player", "play");
    this.stop();
    const speaker = play(stream);
    this.playing = speaker;
    speaker.on("finish", this.sine);
  }
}

var player = new Player();

const SOUNDS_PATH = path.join(__dirname, "..", "sounds");
let SOUNDS = [];

const getLocalSoundPath = relativePath =>
  path.join(__dirname, "..", "sounds", relativePath);

const pickRandom = arr => arr[Math.floor(Math.random() * arr.length)];

// populate sounds
fs.readdir(SOUNDS_PATH, function(err, items) {
  SOUNDS = items.filter(item => item.match(/\.mp3$/));
});

const playLocalSound = (relativePath, cb) => {
  board.info("playLocalSound", relativePath);
  player.play(fs.createReadStream(getLocalSoundPath(relativePath)));
};

//playLocalSound("sos-amitie.ogg");

board.on("ready", function() {
  var ringRelay = new five.Relay({
    pin: "GPIO4",
    type: "NC"
  });
  ringRelay.open();

  var hangupButton = new five.Button({
    pin: "GPIO21",
    isPullup: true,
    invert: false,
    holdtime: 10
  });

  var rotaryButton = new five.Button({
    pin: "GPIO17",
    isPullup: true,
    holdtime: 10,
    invert: true
  });

  board.repl.inject({
    ringRelay,
    hangupButton
  });

  hangupButton.on("up", function() {
    // porteuse OU repond à un call
    board.info("Phone", "PICK UP");
    ringRelay.open();
    player.sine();
  });

  hangupButton.on("down", function() {
    console.log("HANG UP");
    board.info("Phone", "HANG UP");
    player.stop();
    ringRelay.open();
  });

  const rotary = new Rotary();

  rotary.on("compositionend", number => {
    board.info("Rotary", `COMPOSE ${number}`);
    player.stop();
    const sound = pickRandom(SOUNDS);
    board.info("Phone", `START Play ${sound}`);
    playLocalSound(sound);
  });

  rotaryButton.on("up", () => rotary.onPulse())

});
