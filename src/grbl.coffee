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
Rx.config.longStackSupport = true
Promise = require('bluebird')
messages = require('./messages')
status_parser = require('./status_parser.coffee')
FIFO = require('./fifo.coffee')
prompts = require('./prompts.coffee')

stringify = (thing) ->
  if typeof thing is 'string'
    thing
  else
    JSON.stringify thing

###
Attach to vorpal on connection, this creates an overall event observable
combining serial port data events and user supplied commands.
###
class GRBL
  ###
  Construction is about attaching a communication port.
  ###
  constructor: (@vorpal, @grblPort, @machine={trace: false}) ->
    #bridge out events coming in from an event source to an observable
    eventAction = (object, name) ->
      Rx.Observable.fromEvent(object, name)
        .map (data) -> {action: name, data}
    #immediate add of a command
    @immediate = new Rx.Subject()
    #fifo for GCODE commands that need parsing
    @fifo = new FIFO()
    #ask for status on a timer
    status = Rx.Observable.timer(0, 1000)
      .map -> {action: 'status'}
    #and observe all the commands together
    @commands = Rx.Observable.merge(
      @immediate,
      @fifo.observable,
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
        @trace @vorpal.chalk.green.underline command.data
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
        @grblPort.write command.text
        @grblPort.write "\n"
    #gets the whole observable going, with message printing
    .subscribe @trace, (e) =>
      @error e.toString()
    , @close
    #hook up an animated prompt
    @prompt = setInterval =>
      @vorpal.ui.delimiter @buildPrompt()
    , 100

  ###
  Disconnect the port and any observables.
  ###
  close : =>
    clearInterval @prompt
    @vorpal.ui.delimiter "grbl>"
    @grblPort.close()
    @commands.dispose()

  ###
  Output
  ###
  trace: (thing) =>
    if @machine.trace
      @vorpal.log messages.trace(stringify(thing))

  error: (thing) =>
    @vorpal.log messages.error(stringify(thing))

  ###
  Render the current system state into a command line prompt, with some
  fun animation and color.
  ###
  buildPrompt: ->
    m = @machine?.state?.machine_position
    w = @machine?.state?.work_position
    ret = ""
    if m
      ret += "m:(#{m?.x},#{m?.y},#{m?.z}) w:(#{w?.x},#{w?.y},#{w?.z})\n"
    if @machine?.state?.status and pfn = prompts[@machine?.state?.status]
      ret += "#{pfn()} "
    ret += "grbl>"

  ###
  Action packed! For any given command that has action, do the mapped
  thing. This avoids a big ocean of if statements, instead the presence of
  the method is enough to know what to do.
  ###

  reset: (command) ->
    @fifo.drain()

  ###
  Ask GRBL for status, message coming back will be parsed and preserved
  as state.
  ###
  status: (command) ->
    @grblPort.write '?\n'

  ###
  Toggle trace status.
  ###
  tracing: (command) ->
    @machine.trace = not @machine.trace

  ###
  Serial port is open
  ###
  open: (command) ->

  ###
  Once GRBL has said hello, command dispatch from the FIFO can start.
  ###
  grbl_hello: (command) ->
    @fifo.next()
    @grblPort.write '$g\n'
    @grblPort.write '$#\n'

  ###
  GRBL reported an error, show the error and drain the FIFO
  ###
  grbl_error: (command) ->
    @vorpal.log messages.error("#{@machine.file}:#{@machine.line}"),
      messages.error(@machine.text),
      messages.error("\n  #{command.message}")
    @fifo.drain()

  ###
  GRBL reports all is well, take the next command.
  ###
  grbl_ok: (command) ->
    @fifo.next()

  grbl_feedback: (command) ->
    @vorpal.log @vorpal.chalk.green command.message


module.exports = GRBL
