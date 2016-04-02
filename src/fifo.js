"use strict";
const Rx = require("rx");

/*
This is a queuable, eeeeeable FIFO that you bridge into an observable sequence.
*/
module.exports = class FIFO {
  /*
  Set up an observable subject, which serves as a controlled entry point to 
  dispense one bit of data at a time, but allow queueing up multiple observable
  sequences.
  */
  constructor() {
    this.enqueued = new Rx.Subject();
    let fifo = this.fifo = this.enqueued
      .mergeAll()
      .controlled();
    this.observable = this.fifo
      .do((line) => {
        if (line.end) {
          fifo.running = false;
          fifo.drain = false;
        } else {
          fifo.running = true;
        }
      })
      .do(() => {
        //if draining, keep on draining until empty
        if (fifo.drain)
          fifo.request(1);
      })
      .where(() => {
        //only execute if we are not draining
        return !fifo.drain;
      });
  }

  /*
  Drain out all the remaining commands until the next end markers
  */
  drain() {
    this.fifo.drain = true;
    this.fifo.request(1);
  }

  /*
  Send along the next command.
  */
  next() {
    if (this.fifo.running)
      this.fifo.request(1);
  }

  /*
  Start up queue processing by asking for a command.
  */
  start() {
    this.fifo.request(1);
  }

  /*
  Queue up an observeable of commands.
  */
  enqueue(commands) {
    this.enqueued.onNext(commands);
  }

};