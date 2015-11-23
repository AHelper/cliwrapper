var child = require('child_process').spawn,
    args = require('yargs');

function usage() {
  console.log('usage: cliwrapper [--start startscript.js] [--signal #,signalscript.js] command arguments...');
  process.exit(1);
}

if(args._.length == 0) {
  usage();
}

console.log('X');
