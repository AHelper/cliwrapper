var spawn = require('child_process').spawn,
    args = require('yargs').argv,
    through = require('through');

function usage() {
  console.log('usage: cliwrapper [--start startscript.js] [--signal #,signalscript.js] command arguments...');
  process.exit(1);
}

if(args._.length == 0) {
  usage();
}

console.log('X');

var proc = spawn(args._.join(' '));

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
