###
Series of animated prompt frames to reflect the running state.
###

chalk = require 'chalk'

dotsFrames = ['⣾', '⣷', '⣯', '⣟', '⡿', '⢿', '⣻', '⣽']
dotat = 0

errorFrames = ['⣿', '⠀']

module.exports =
  run: ->
    chalk.green dotsFrames[dotat = ++dotat % dotsFrames.length]
  idle: ->
    chalk.green '⣿'
  hold: ->
    chalk.yellow errorFrames[dotat = ++dotat % errorFrames.length]
  alarm: ->
    chalk.red errorFrames[dotat = ++dotat % errorFrames.length]
