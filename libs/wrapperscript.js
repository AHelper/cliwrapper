var fs = require('fs'),
    Promise = require('promise');

var WrapperScript = function(source, proc, hasStderr) {
  this.sourcePath = source;
  this.source = fs.readFileSync(source, {encoding: 'utf8'}).split('\n');
  this.proc = proc;
  this.pos = 0;
  this.outBuffer = "";
  this.started = false;
  this.hasStderr = hasStderr;
  var self = this;
  this.onOutDataCB = function(chunk) {
    self.onOutData(chunk);
  };
  this.bufferUpdated = function(){};
};

WrapperScript.prototype.start = function() {
  if(!this.started) {
    this.started = true;
    this.proc.stdout.on('data', this.onOutDataCB);
    if(this.hasStderr) {
      this.proc.stderr.on('data', this.onOutDataDB);
    }
  }
};

WrapperScript.prototype.stop = function() {
  if(this.started) {
    this.started = false;
    this.proc.stdout.removeListener('data', this.onOutDataCB);
    if(this.hasStderr) {
      this.proc.stderr.removeListener('data', this.onOutDataCB);
    }
  }
};

WrapperScript.prototype.onOutData = function (chunk) {
  this.outBuffer += chunk;
  this.bufferUpdated();
};

/**
 * Steps through 1 line of execution of the wrapper script.
 * @return {Promise} Resolves true while more lines can be stepped through,
 *                   false if no more lines can be processed, fails with Error.
 */
WrapperScript.prototype.step = function() {
  var self = this;
  return new Promise(function(resolve, failure) {
    if(self.pos < self.source.length) {
      var line = self.source[self.pos++].split(' ');
      console.log("Processing line " + self.pos + ": " + line.join(' '));

      if(line.length > 1 || line[0].length > 0) {
        try {
          if(self['hdlr_' + line[0].toLowerCase()]) {
            self['hdlr_' + line[0].toLowerCase()](line, function(){resolve(self.pos < self.source.length);});
          } else {
            throw new Error('Unknown command "' + line[0] + '"');
          }
        } catch(err) {
          err.message = self.sourcePath + ':' + line[0] + ': ' + err.message;
          console.log(err.message);
          failure(err);
        }
      } else {
        resolve(self.pos < self.source.length);
      }
    } else {
      resolve(self.pos < self.source.length);
    }
  });
};

WrapperScript.prototype.run = function() {
  var self = this;
  return new Promise(function(resolve, failure) {
    self.step().then(function(more) {
      if(more) {
        self.run().then(resolve, failure);
      } else {
        resolve();
      }
    }, failure);
  });
};

WrapperScript.prototype.hdlr_sleep = function (line, done) {
  if(line.length != 2) {
    throw new Error('Invalid syntax: SLEEP [num seconds]');
  }
  var seconds = parseFloat(line[1]);
  console.log('Told to sleep for ' + seconds + ' seconds');

  setTimeout(done, seconds * 1000);
};

WrapperScript.prototype.hdlr_type = function (line, done) {
  if(line.length < 2) {
    throw new Error('Invalid syntax: TYPE [escaped text...]');
  }
  var text = line.slice(1).join(' ');

  text = text.replace(/\\n/g, '\n');

  console.log('Want to type: ' + text);

  this.proc.stdin.write(text);

  done();
};

module.exports = WrapperScript;
