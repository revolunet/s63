"use strict";

var fs = require("fs");
var os = require("os");
var path = require("path");
var fetch = require("node-fetch");
var five = require("johnny-five");

if (os.platform() !== 'darwin') {
  var Raspi = require("raspi-io");
}

var infoclimat = require("infoclimat");
var xs = require('xstream').default;
var fromEvent = require('xstream/extra/fromEvent').default;
var delay = require('xstream/extra/delay').default;

var Rotary = require("./Rotary");
var Player = require("./Player");
var scan = require('./sound').scan;


// populate available sounds
const getLocalSoundPath = relativePath => path.join(SOUNDS_PATH, relativePath);

const getUrlStream = url => fetch(url).then(res => res.body).catch(e => console.log(e));
const getTTSStream = text => getUrlStream(`http://translate.google.com/translate_tts?tl=fr&q=${encodeURIComponent(text)}&client=gtx&ie=UTF-8`);
const pickRandom = arr => arr[Math.floor(Math.random() * arr.length)];

const playStream = stream => {
  board.info("playStream", "");
  player.play(stream);
};

const playLocalSound = (relativePath, cb) => {
  board.info("playLocalSound", relativePath);
  playStream(fs.createReadStream(getLocalSoundPath(relativePath)));
};

const SOUNDS_PATH = path.join(__dirname, "..", "sounds");
const SOUNDS = scan(SOUNDS_PATH);

const board = new five.Board({ io: Raspi && new Raspi() || null });

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

  const RING_INTERVAL = 1000
  const RING_TIMEOUT = 5000

  var pickup$ = fromEvent(hangupButton, 'up').mapTo('pickup');
  var hangup$ = fromEvent(hangupButton, 'down').mapTo('hangup').drop(1);
  var ring$ = xs.periodic(RING_INTERVAL).startWith(0).endWhen(pickup$).endWhen(xs.periodic(RING_TIMEOUT).take(1));
  var hangupButton$ = xs.merge(pickup$, hangup$)

  hangupButton$.addListener({
    next: i => {
      board.info("hangupButton$", i)
    },
    error: err => console.error('err', err),
    complete: e => {
      console.log("e", e)
      board.info("hangupButton$", "complete")
    }
  })

  const placeCall = (stream) => {
    ring$.addListener({
      next: i => {
        board.info("ring$", "next")
        ringRelay.toggle()
      },
      error: err => console.error('err', err),
      complete: e => {
        board.info("ring$", e)
        ringRelay.open()
        // todo if pickup, play sound
        //console.log('hangupButton$', hangupButton$.last())
        player.stop();
        setTimeout(() => playStream(stream), 1000);
      }
    })
  }

  board.repl.inject({
    ringRelay,
    hangupButton
  });

  // pickup$.addListener({
  //   next: i => {
  //     board.info("Phone", "PICK UP");
  //     ringRelay.open();
  //     player.sine();
  //   }
  // });

  // hangup$.addListener({
  //   next: i => {
  //     board.info("Phone", "HANG UP");
  //     player.stop();
  //     ringRelay.open();
  //   }
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
     "4": () => {
      board.info("DEBUG", `debug`);
      setTimeout(() => {
        board.info("DEBUG", `timeout`);
        getTTSStream("Bonjour, Comment allez-vous aujourd'hui ?").then(placeCall);
      }, 3000)
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
