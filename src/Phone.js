"use strict";

var fs = require("fs");
var path = require("path");
var fetch = require("node-fetch");
var five = require("johnny-five");
var Raspi = require("raspi-io");
var infoclimat = require("infoclimat");

var Rotary = require("./Rotary");
var Player = require("./Player");
var scan = require('./sound').scan;


// populate available sounds
const getLocalSoundPath = relativePath => path.join(SOUNDS_PATH, relativePath);

const pickRandom = arr => arr[Math.floor(Math.random() * arr.length)];

const playStream = stream => {
  board.info("playStream");
  player.play(stream);
};

const playLocalSound = (relativePath, cb) => {
  board.info("playLocalSound", relativePath);
  playStream(fs.createReadStream(getLocalSoundPath(relativePath)));
};

const SOUNDS_PATH = path.join(__dirname, "..", "sounds");
const SOUNDS = scan(SOUNDS_PATH);

const board = new five.Board({ io: new Raspi() });

const player = new Player();

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

  // board.repl.inject({
  //   ringRelay,
  //   hangupButton
  // });

  hangupButton.on("up", function() {
    // porteuse OU repond à un call
    board.info("Phone", "PICK UP");
    ringRelay.open();
    player.sine();
  });

  hangupButton.on("down", function() {
    board.info("Phone", "HANG UP");
    player.stop();
    ringRelay.open();
  });

  const rotary = new Rotary();

  const getUrlStream = url => fetch(url).then(res => res.body).catch(e => console.log(e));
  const getTTSStream = text => getUrlStream(`http://translate.google.com/translate_tts?tl=fr&q=${encodeURIComponent(text)}&client=gtx&ie=UTF-8`);

  // define some callbacks
  const callbacks = {
    // ask meteo
    "1": () => {
      board.info("METEO", `fetch data`);
      infoclimat.getTodayWeatherInFrench("48.856578,2.351828").then(text => {
        const fullText = `Bonjour, ${text}. Voila voila !`;
        board.info("METEO", fullText);
        getTTSStream(fullText).then(playStream);
      });
    },
    // default behaviour : play some sound from the SOUNDS_PATH folders
    default: number => {
      const soundPath = (SOUNDS[number] && number) || "default";
      const sounds = SOUNDS[soundPath];
      let sound = soundPath + "/" + pickRandom(sounds);
      board.info("Phone", `START Play ${sound}`);
      playLocalSound(sound);
    }
  };
  rotary.on("compositionend", number => {
    board.info("Rotary", `COMPOSE ${number}`);
    player.stop();
    // some callback for this number
    if (callbacks[number]) {
      callbacks[number]();
    } else {
      callbacks.default(number);
    }
  });

  rotaryButton.on("up", () => rotary.onPulse());
});
