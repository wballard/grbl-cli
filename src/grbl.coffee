###
Interact with a GRBL device with RxJS.

GRBL can be controlled with multiple inputs:
- GCODE
  - file streaming
  - manually typed
- System Commands
  - `$` commands
  - `~`
  - `!`
  - `?`
  - `ctrl-x` reset

...and provides multiple outputs:
- `ok`
- `error`
- `ALARM`
- `[]` feeback
- `<>` position status

GCODE inputs are  answered with `ok` and `error` responses, queuing up here in
memory. `ok` allows the next command. `error` flushes out all commands and
resets.

You add to the queue by typing in a `gcode` subshell or `play` a file
of gcode commands. Both sources of commands, the sequence of manually typed and
the sequence of file originated, are concat into a single sequence before being
sent along to GRBL.

Files loaded with `play` are aborted on any `error` to help avoid crashes.

System commands are not queued but sent through immediately.

Everything here works on a 'standard action' metaphor, and object like
```
{
  action: 'name'
  ,...
}
```
All additional data is attached to the action.
###

Rx = require('rx')
Promise = require('bluebird')
messages = require('./messages')
status_parser = require('./status_parser.coffee')

###
Attach to vorpal on connection, this creates an overall event observable
combining serial port data events and user supplied commands.
###
class GRBL
  ###
  Construction is about attaching a communication port.
  ###
  constructor: (@vorpal, @grblPort, @machine={}) ->
    #bridge out events coming in from an event source to an observable
    eventAction = (object, name) ->
      Rx.Observable.fromEvent(object, name)
        .map (data) -> {action: name, data}
    #immediate add of a command
    @immediate = new Rx.Subject()
    #ask for status on a timer
    status = Rx.Observable.timer(0, 1000)
      .map -> {action: 'status'}
    #this subject serves as the input -- send in gcode commands actions here
    #`controlled` is used to build a FIFO queue that sends along one command
    #at a time as flow control, and will flush out any pending observeable
    #of commands on an error
    @enqueued = new Rx.Subject()
    @fifo = @enqueued
      .mergeAll()
      .controlled()
    filteredFifo = @fifo
      .do (line) =>
        if line.start or line.end
          @fifo.drain = false
          @fifo.request 1
      .do =>
        if @fifo.drain
          @fifo.request 1
      .takeWhile =>
        not @fifo.drain
      .where (line) ->
        line.text

    #and observe all the commands together
    @commands = Rx.Observable.merge(
      @immediate,
      filteredFifo,
      eventAction(@grblPort, 'open'),
      eventAction(@grblPort, 'close'),
      eventAction(@grblPort, 'error'),
      eventAction(@grblPort, 'data'),
      status
    )
    #Here is a chance to parse any data coming in from GRBL and turn it to
    #a structured object instead of just a string
    .map (command) =>
      if command.action is 'data'
        @vorpal.log @vorpal.chalk.green.underline command.data
        status_parser(command.data)
      else
        command
    #reduce down to a new state, merging in updates, this is effectively
    #a one way, immutable react style flow
    .do (command) =>
      @machine = Object.assign(@machine, command)
    #run any methods mapped through to actions, this does not have a chance
    #to modify the command
    .do (command) =>
      try
        @[command.action]?(command)
      catch error
        @error error
    #send along anything with a `.text`
    .do (command) =>
      if command.text
        @vorpal.log @vorpal.chalk.green command.text
        @grblPort.write command.text
        @grblPort.write "\n"
    #render out the user interface state here, this is where it differs
    #from react in that, well, there is no DOM just a command prompt
    .do (command) =>
      m = @machine?.state?.machine_position
      if m
        @vorpal.ui.delimiter """
        G53 (#{m?.x},#{m?.y},#{m?.z}) grbl>
        """
    #gets the whole observable going, with message printing
    .subscribe @trace, @error, @close

  ###
  Disconnect the port and any observables.
  ###
  close : =>
    @grblPort.close()
    @commands.dispose()

  ###
  Input an observable of commands for enqueued running. Each command is expected
  to have a `.line` property which will actually be sent along to GRBL.
  This is surrounded by start and end markers to allow enqueued observeables to
  drain out on any parsing error by GRBL.
  ###
  enqueue: (commands) ->
    @enqueued.onNext Rx.Observable.of {start: true}
    @enqueued.onNext commands
    @enqueued.onNext Rx.Observable.of {end: true}

  ###
  Output
  ###
  trace: (thing) =>
    @vorpal.log messages.trace(JSON.stringify(thing))

  error: (thing) =>
    @vorpal.log messages.error(JSON.stringify(thing))

  ###
  Action packed! For any given command that has action, do the mapped
  thing. This avoids a big ocean of if statements, instead the presence of
  the method is enough to know what to do.
  ###

  ###
  Once GRBL has said hello, command dispatch from the FIFO can start.
  ###
  hello: (command) ->
    @fifo.request 1

  ###
  Ask GRBL for status, message coming back will be parsed and preserved
  as state.
  ###
  status: (command) ->
    @grblPort.write '?'

  ###
  GRBL reported an error, show the error and drain the FIFO
  ###
  grbl_error: (command) ->
    @vorpal.log messages.error("#{@machine.file}:#{@machine.line}"),
      messages.error(@machine.text),
      messages.error("\n  #{command.message}")
    @fifo.drain = true
    @fifo.request 1

  ###
  GRBL reports all is well, take the next command.
  ###
  grbl_ok: (command) ->
    @fifo.request 1


module.exports = GRBL
