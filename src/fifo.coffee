Rx = require('rx')

###
This is a queuable, drainable FIFO.
###
class FIFO
  constructor: ->
    @enqueued = new Rx.Subject()
    @fifo = @enqueued
      .mergeAll()
      .controlled()
    @observable = @fifo
      .do (line) =>
        if line.end
          @fifo.drain = false
          @fifo.request 1
      .do =>
        if @fifo.drain
          @fifo.request 1
      .where (line) =>
        line.text and not @fifo.drain
  ###
  Drain out all the remaining commands until the next end markers
  ###
  drain: ->
    @fifo.drain = true
    @fifo.request 1

  ###
  Send along the next command.
  ###
  next: ->
    @fifo.request 1

  ###
  Queue up  an observeable of commands, this has an end marker
  so you know when a batch is done.
  ###
  enqueue: (commands) ->
    @enqueued.onNext commands
    @enqueued.onNext Rx.Observable.of {end: true}


module.exports = FIFO
