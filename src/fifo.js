"use strict";
const Rx = require("rx");

/*
This is a queuable, drainable FIFO that you bridge into an observable sequence.
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
        if (line.end)
          fifo.drain = false;
        fifo.request(1);
      })
      .do(() => {
        if (fifo.drain)
          fifo.request(1);
      })
      .where((line) => {
        return line.text && !fifo.drain;
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
    this.fifo.request(1);
  }

  /*
  Queue up  an observeable of commands, this has an end marker
  so you know when a batch is done.
  */
  enqueue(commands) {
    this.enqueued.onNext(commands);
    this.enqueued.onNext(Rx.Observable.of({ end: true }));
  }

};