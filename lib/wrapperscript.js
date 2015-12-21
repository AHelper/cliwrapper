var fs = require('fs'),
    Promise = require('promise'),
    unescape = require('./unescape.js'),
    keydecode = require('./keydecode.js'),
    mkDebug = require('debug');

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
      this.proc.stderr.on('data', this.onOutDataCB);
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
  var debug = mkDebug('WrapperScript.prototype.step');
  var self = this;
  return new Promise(function(resolve, failure) {
    if(self.pos < self.source.length) {
      var line = self.source[self.pos++].split(' ');
      debug("Processing line " + self.pos + ": " + line.join(' '));

      if(line.length > 1 || line[0].length > 0) {
        try {
          if(self['hdlr_' + line[0].toLowerCase()]) {
            self['hdlr_' + line[0].toLowerCase()](line, function(){resolve(self.pos < self.source.length);});
          } else {
            throw new Error('Unknown command "' + line[0] + '"');
          }
        } catch(err) {
          err.message = self.sourcePath + ':' + line[0] + ': ' + err.message;
          debug(err.message);
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
  var debug = mkDebug('WrapperScript.prototype.hdlr_sleep');

  if(line.length != 2) {
    throw new Error('Invalid syntax: SLEEP [num seconds]');
  }
  var seconds = parseFloat(line[1]);
  debug('Told to sleep for ' + seconds + ' seconds');

  setTimeout(done, seconds * 1000);
};

WrapperScript.prototype.hdlr_type = function (line, done) {
  var debug = mkDebug('WrapperScript.prototype.hdlr_type');

  if(line.length < 2) {
    throw new Error('Invalid syntax: TYPE [escaped text...]');
  }
  var text = line.slice(1).join(' ');

  debug('Want to type: ' + text);

  text = unescape(text);

  this.proc.stdin.write(text);

  done();
};

WrapperScript.prototype.hdlr_sendkey = function (line, done) {
  var debug = mkDebug('WrapperScript.prototype.hdlr_sendkey');
  var self = this;

  if(line.length < 2) {
    throw new Error('Invalid syntax: SENDKEY [key...]');
  }
  var keys = line.slice(1);

  keys.forEach(function(key) {
    debug('Want to send key "' + key + '"');
    debug(keydecode(key).toString());
    self.proc.stdin.write(keydecode(key));
  });

  done();
};

WrapperScript.prototype.hdlr_waitfor = function (line, done) {
  var debug = mkDebug('WrapperScript.prototype.hdlr_waitfor');
  var self = this;

  if(line.length < 2) {
    throw new Error('Invalid syntax: WAITFOR [escaped text...]');
  }
  var text = line.slice(1).join(' ');

  debug('Waiting for: ' + text);

  text = unescape(text);

  var oldBufferUpdated = this.bufferUpdated;
  this.bufferUpdated = function() {
    if(this.outBuffer.search(text) != -1) {
      debug('Found it');
      this.outBuffer = this.outBuffer.slice(this.outBuffer.search(text) + text.length);
      debug('Remaining: ' + this.outBuffer);
      this.bufferUpdated = oldBufferUpdated;
      done();
    }
  };
  this.bufferUpdated();
};

WrapperScript.prototype.hdlr_waitforregexp = function (line, done) {
  var debug = mkDebug('WrapperScript.prototype.hdlr_waitforregexp');
  var self = this;

  if(line.length < 2) {
    throw new Error('Invalid syntax: WAITFORREGEXP [escaped regexp...]');
  }
  var text = line.slice(1).join(' ');

  debug('Waiting for regexp: ' + text);

  text = unescape(text);
  var regexp = new RegExp(text);
  var oldBufferUpdated = this.bufferUpdated;

  this.bufferUpdated = function() {
    if(this.outBuffer.match(regexp) != null) {
      debug('Found it');
      this.outBuffer = this.outBuffer.slice(this.outBuffer.search(text) + text.length);
      debug('Remaining: ' + this.outBuffer);
      this.bufferUpdated = oldBufferUpdated;
      done();
    }
  };
  this.bufferUpdated();
};

WrapperScript.prototype.hdlr_signal = function (line, done) {
  var debug = mkDebug('WrapperScript.prototype.hdlr_signal');

  if(line.length != 2) {
    throw new Error('Invalid syntax: SIGNAL [signal]');
  }
  var signal = line[1];

  debug('Sending signal ' + signal + ' to wrapped process');

  debug(this.proc.kill);
  debug(this.proc.kill(signal));

  done();
};

module.exports = WrapperScript;
