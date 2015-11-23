var fs = require('fs');

var WrapperScript = function(source, proc) {
  this.source = fs.readFileSync(source).split('\n').reverse();
  this.proc = proc;
};

WrapperScript.prototype.step = function() {
  if(this.source.length > 0) {
    var line = this.source.pop().split(' ');

    if(line.length > 0) {
      if(this['hdlr_' + line[0].toLowerCase()]) {
        this['hdlr_' + line[0].toLowerCase()](line);
      }
    }

    return true;
  } else {
    return false;
  }
};

WrapperScript.prototype.run = function() {
  while(step());
};

WrapperScript.prototype.hdlr_sleep = function (line) {
  // body...
  console.log('Told to sleep');
};

module.exports = WrapperScript;
