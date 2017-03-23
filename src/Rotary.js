"use strict";

var EventEmitter = require('events').EventEmitter;

const PULSE_VALUES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];
const PULSE_TIMEOUT = 500;
const COMPOSE_TIMEOUT = 2000;

class Rotary extends EventEmitter {
  constructor() {
    super()
    this.value = '';
    this.pulseCount = 0;
  }
  onPulse() {
    if (this.pulseCount === 0) {
      this.emit('compositionstart');
    }
    this.pulseCount++;
    if (this.pulseTimeout) {
      clearTimeout(this.pulseTimeout);
    }
    if (this.composeTimeout) {
      clearTimeout(this.composeTimeout);
    }
    this.pulseTimeout = setTimeout(this.onPulseTimeout.bind(this), PULSE_TIMEOUT)
  }
  onPulseTimeout() {
    // last pulse received - store number
    const num = PULSE_VALUES[this.pulseCount - 1];
    this.value += num;
    this.pulseCount = 0;
    this.composeTimeout = setTimeout(this.onComposeTimeout.bind(this), COMPOSE_TIMEOUT)
  }
  onComposeTimeout() {
    // composition timeout
    this.emit('compositionend', this.value);
    this.value = '';
    this.pulseCount = 0;
  }
}

module.exports = Rotary