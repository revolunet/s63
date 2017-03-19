"use strict";

var five = require("johnny-five");
var Raspi = require("raspi-io");

var Rotary = require("./Rotary");
var play = require("./sound").play;

var fs = require("fs");
var path = require("path");

var board = new five.Board({
  io: new Raspi()
});

board.on("ready", function() {
  var pin = new five.Pin(7);
  var hangupButton = new five.Button({
    pin: "GPIO21",
    isPullup: true,
    holdtime: 200
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

  hangupButton.on("hold", function() {
    console.log("Button held");
  });

  hangupButton.on("up", function() {
    //if (hangupButton.isClosed) {
    console.log("up");
    pin.high();
    var stream = fs.createReadStream(path.join(__dirname, "..", "Canon.mp3"));
    play(stream);
    // porteuse OU repond à un call
    // }
  });
  hangupButton.on("down", function() {
    // if (hangupButton.isOpen) {
    console.log("down");
    pin.low();
    // }
  });

  // composeButton.on("hold", function() {
  //   console.log( "composeButton held" );
  // });

  var rotary = new Rotary();
  rotary.on("compositionend", number => {
    console.log("compositionend", number);
  });

  composeButton.on("up", function() {
    //if (composeButton.isClosed) {
    ///console.log("composeButton up")
    rotary.onPulse();
    // pin.high()
    // }
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
