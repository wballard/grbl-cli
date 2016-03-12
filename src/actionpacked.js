"use strict";
/*
This is a fairly specialized operator that takes a directory full of promise
modules, dispatches them by name, and then generates values to the rest of the
observable chain.

Each module in the directory is `require` and is expected to export a single promise 
returing function of the form:
```
function (data) {
    return promise;
}
```

Actions are registered by the name of the module without the `.js` and are selected
based on `data.action` by exact name match.
*/

let Rx = require("rx"),
  fs = require("fs"),
  path = require("path");

/**
This is a fairly specialized operator that takes a directory full of promise
modules, dispatches them by name, and then generates values to the rest of the
observable chain.

Each module in the directory is `require` and is expected to export a single promise 
returing function of the form:
```
function (data) {
    return promise;
}
```
Actions are registered by the name of the module without the `.js` and are selected
based on `data.action` by exact name match to the module.

@param  {any} directoryName - Load modules from this directory.
*/
Rx.Observable.prototype.actionPacked = function(directoryName) {
  //really simple dispatch table based on module names
  let actions = {};
  fs.readdirSync(directoryName).forEach(function(actionModule) {
    actions[path.basename(actionModule, ".js")] = require(path.join(directoryName, actionModule));
  });
  let source = this;
  return Rx.Observable.create(function(observer) {
    return source.subscribe(function(data) {
      if (data && actions[data.action]) {
        actions[data.action](data)
          .then(function(ok) {
            observer.onNext(ok);
          })
          .catch(function(error) {
            observer.onError(error);
          });
      } else {
        //hand along if there is no action to take, so it is a no-op.
        observer.onNext(data);
      }
    });
  });
};