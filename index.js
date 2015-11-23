var _pty = require('pty.js').spawn,
    nopty = require('child_process').execFile,
    args = require('yargs').argv,
    through = require('through'),
    async = require('async'),
    tty = require('tty'),
    WrapperScript = require('./libs/wrapperscript.js');

// Slight wrapper
pty = function(file, args) {
  var cols = 80;
  var rows = 60;

  // Set rows/cols from stdout if TTY
  if(process.stdout.isTTY) {
    cols = process.stdout.columns;
    rows = process.stdout.rows;
  }

  var newpty = _pty(file, args, {
    name: 'xterm',
    cols: cols,
    rows: rows,
    cwd: process.cwd(),
    env: process.env
  });

  // Subscribe to resize if stdout is TTY
  if(process.stdout.isTTY) {
    process.stdout.on('resize', function() {
      newpty.resize(process.stdout.columns, process.stdout.rows);
    });
  }

  return newpty;
}

if(tty.isatty(0)) {
  process.stdin.setRawMode(true);
}

function usage() {
  console.log('usage: cliwrapper [--tty] [--start startscript.js] [--signal #,signalscript.js] command arguments...');
  process.exit(1);
}

if(args._.length == 0) {
  usage();
}

var proc = (args.tty ? pty : nopty)(args._[0], args._.slice(1));

if(args.start) {
  var startScript = new WrapperScript(args.start, proc, !args.tty);
  startScript.start();
}

proc.on('close', function() {
  console.log('process closed');
});

proc.on('error', function(err) {
  console.log('err: ' + err);
});

proc.on('disconnect', function() {
  console.log('disconnected');
});

proc.on('exit', function(code, sig) {
  sig = sig || 0
  console.log('process exited with code ' + code + ' and signal ' + sig);
  process.exit(code);
});

proc.stdout.on('data', function(chunk) {
  process.stdout.write(chunk);
});

process.stdin.on('data', function(chunk) {
  proc.stdin.write(chunk);
})

if(!args.tty) {
  proc.stderr.on('data', function(chunk) {
    process.stderr.write(chunk);
  });
}

if(args.start) {
  console.log("Running start script");
  var startScript = new WrapperScript(args.start, proc);

  startScript.run().then(function() {
    console.log("Done running start script");
  });

  startScript.stop();
}
