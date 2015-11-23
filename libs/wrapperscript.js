var fs = require('fs'),
    Promise = require('promise');

var WrapperScript = function(source, proc) {
  this.sourcePath = source;
  this.source = fs.readFileSync(source, {encoding: 'utf8'}).split('\n');
  this.proc = proc;
  this.pos = 0;
  this.outBuffer = "";
  this.errBuffer = "";
  this.bufferUpdated = function(){};
};

WrapperScript.prototype.start = function() {
  this.proc.stdout.on('data', this.onOutData);
  this.proc.stderr.on('data', this.onErrData);
};

WrapperScript.prototype.stop = function() {
  this.proc.stdout.removeListener('data', this.onOutData);
  this.proc.stderr.removeListener('data', this.onErrData);
};

WrapperScript.prototype.onOutData = function (chunk) {
  this.outBuffer += chunk;
  this.bufferUpdated();
};

WrapperScript.prototype.onErrData = function (chunk) {
  this.errBuffer += chunk;
  this.bufferUpdated();
};

/**
 * Steps through 1 line of execution of the wrapper script.
 * @return {Promise} Resolves true while more lines can be stepped through,
 *                   false if no more lines can be processed, fails with Error.
 */
WrapperScript.prototype.step = function() {
  return new Promise(function(resolve, failure) {
    if(this.pos > this.source.length) {
      var line = this.source[this.pos++].split(' ');

      if(line.length > 0) {
        try {
          if(this['hdlr_' + line[0].toLowerCase()]) {
            this['hdlr_' + line[0].toLowerCase()](line, resolve);
          } else {
            throw new Error('Unknown command "' + line[0] + '"');
          }
        } catch(err) {
          err.message = this.sourcePath + ':' + line[0] + ': ' + err.message;
          failure(err);
        }
      }
    }

    resolve(this.pos > this.source.length);
  });
};

WrapperScript.prototype.run = function() {
  return new Promise(function(resolve, failure) {
    this.step().then(function(more) {
      if(more) {
        this.run().then(resolve).catch(failure);
      } else {
        resolve();
      }
    }).catch(failure);
  });
};

WrapperScript.prototype.hdlr_sleep = function (line, resolve) {
  if(line.length != 2) {
    throw new Error('Invalid syntax: SLEEP [num seconds]');
  }
  var seconds = parseFloat(line[1]);
  console.log('Told to sleep for ' + seconds + ' seconds');

  setTimeout(resolve, seconds * 1000);
};

WrapperScript.prototype.hdlr_type = function (line, resolve) {
  if(line.length < 2) {
    throw new Error('Invalid syntax: TYPE [escaped text...]');
  }
  var text = line.slice(1).join(' ');

  console.log('Want to type: ' + text);

  resolve();
};

module.exports = WrapperScript;
