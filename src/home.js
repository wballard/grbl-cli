/*
Home the machine. This will stop the world and cut in line.
*/
"use strict";
var Promise = require('bluebird');

module.exports = function(vorpal, options) {
  vorpal
    .command('home', 'Home the machine')
    .action(function(args){
      return Promise.resolve();
    })
}
