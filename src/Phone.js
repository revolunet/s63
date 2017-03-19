"use strict";

var five = require("johnny-five");
var Raspi = require("raspi-io");

var Rotary = require("./Rotary");
var play = require("./sound").play;
var sine = require("./sound").sine;

var fs = require("fs");
var path = require("path");
var fetch = require("node-fetch");

var board = new five.Board({
  io: new Raspi()
});

board.on("ready", function() {
  var pin = new five.Pin(7);
  var hangupButton = new five.Button({
    pin: "GPIO21",
    isPullup: true,
    invert: false,
    holdtime: 10
  });
  var composeButton = new five.Button({
    pin: "GPIO17",
    isPullup: true,
    holdtime: 10,
    invert: true
  });

  board.repl.inject({
    pin,
    hangupButton
  });

  //hangupButton.on("hold", function() {
  //console.log("Button held");
  //});

  var speakers = [];

  const stopAllSpeakers = () => {
    speakers.forEach(speaker => speaker.end());
  };

  hangupButton.on("up", function() {
    // porteuse OU repond à un call
    // play sound
    console.log("pickup");
    speakers.push(sine());
  });

  hangupButton.on("down", function() {
    console.log("HANG UP");
    stopAllSpeakers();
  });

  // composeButton.on("hold", function() {
  //   console.log( "composeButton held" );
  // });

  const NUMBERS = {
    "1": {
      action: "play",
      url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
    },
    "2": {
      action: "play",
      url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"
    },
    "3": {
      action: "play",
      url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3"
    }
  };

  var rotary = new Rotary();
  rotary.on("compositionend", number => {
    console.log("compositionend", number);
    let action = NUMBERS[`${number}`];
    if (action) {
      fetch(action.url).then(function(res) {
        stopAllSpeakers();
        speakers.push(play(res.body));
      });
    }
  });

  composeButton.on("up", function() {
    rotary.onPulse();
  });

  composeButton.on("down", function() {
    // if (composeButton.isOpen) {
    // console.log("composeButton down")
    //pin.low()
    // }
  });

  //pin.high()

  // setTimeout(() => {
  // pin.low()
  // }, 1000);
  // setTimeout(() => {
  // pin.high()
  // }, 2000);
  // setTimeout(() => {
  // pin.low()
  // }, 3000);
});
