###
Parse status messages back from GRBL using a parsing expression grammar.
This returns a nice structured pellet of data we can use to display the current
machine status and position in the UI.
###

dryrun = "<Idle,MPos:0.000,0.000,0.000,WPos:0.000,0.000,0.000>\r"
pegjs = require('pegjs')
Promise = require('bluebird')
fs = require('fs')
path = require('path')
parser = pegjs.buildParser(
  fs.readFileSync(path.join(__dirname, 'status_parser.pegjs'), 'utf8')
  )

module.exports = (string) ->
  parser.parse string.trim()

console.error JSON.stringify module.exports dryrun
