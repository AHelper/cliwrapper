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

if(args.start) {
  var startScript = new WrapperScript(args.start, proc);
  startScript.start();
}

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

if(args.start) {
  console.log("Running start script");
  var startScript = new WrapperScript(args.start, proc);

  startScript.run().then(function() {
    console.log("Done running start script");
  });

  startScript.stop();
}
