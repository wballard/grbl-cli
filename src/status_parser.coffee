###
Parse status messages back from GRBL using a parsing expression grammar.
This returns a nice structured pellet of data we can use to display the current
machine status and position in the UI.
###

dryrun = [
  "<Idle,MPos:0.000,0.000,0.000,WPos:0.000,0.000,0.000>\r"
  "Grbl 0.9j ['$' for help]\r"
  "[Pgm End]"
]
pegjs = require('pegjs')
Promise = require('bluebird')
fs = require('fs')
path = require('path')

parser = pegjs.buildParser(
  fs.readFileSync(path.join(__dirname, 'status_parser.pegjs'), 'utf8')
)

module.exports = (string) ->
  if string and string?.trim().length
    parser.parse string.trim()
  else
    {}

dryrun.forEach (s) ->
  console.error JSON.stringify module.exports s
