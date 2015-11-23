var spawn = require('child_process').exec,
    args = require('yargs').argv,
    through = require('through'),
    async = require('async'),
    WrapperScript = require('./libs/wrapperscript.js');

function usage() {
  console.log('usage: cliwrapper [--start startscript.js] [--signal #,signalscript.js] command arguments...');
  process.exit(1);
}

if(args._.length == 0) {
  usage();
}

console.log('X');

var proc = spawn(args._.join(' '));

async.waterfall([
  function(callback){
    proc.on('close', function(code, sig) {
      console.log('process closed with code ' + code + ' and signal ' + sig);
    });

    proc.on('error', function(err) {
      console.log(err);
    });

    proc.on('disconnect', function() {
      console.log('disconnected');
    });

    proc.on('exit', function(code, sig) {
      console.log('process exited with code ' + code + ' and signal ' + sig);
    });

    proc.stdout.on('data', function(chunk) {
      console.log(chunk);
    });

    callback();
  },
  function(callback) {
    if(args.start) {
      var startScript = new WrapperScript(args.start, proc);

      startScript.run().then(callback).catch(callback);
    } else {
      callback();
    }
  }
], function(err) {
  if(err) {
    console.err(err);
  }
});
