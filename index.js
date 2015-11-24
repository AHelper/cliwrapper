var _pty = require('pty.js').spawn,
    nopty = require('child_process').execFile,
    args = require('yargs').argv,
    through = require('through'),
    async = require('async'),
    tty = require('tty'),
    debug = require('debug')('cliwrapper'),
    WrapperScript = require('./lib/wrapperscript.js');

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

// From src/node.cc
var NODEJS_SIGNALS = [
  "SIGHUP",
  "SIGINT"
  "SIGQUIT",
  "SIGILL",
  "SIGTRAP",
  "SIGABRT",
  "SIGIOT",
  "SIGBUS",
  "SIGFPE",
  "SIGKILL",
  "SIGUSR1",
  "SIGSEGV",
  "SIGUSR2",
  "SIGPIPE",
  "SIGALRM",
  "SIGCHLD",
  "SIGSTKFLT",
  "SIGCONT",
  "SIGSTOP",
  "SIGTSTP",
  "SIGBREAK",
  "SIGTTIN",
  "SIGTTOU",
  "SIGURG",
  "SIGXCPU",
  "SIGXFSZ",
  "SIGVTALRM",
  "SIGPROF",
  "SIGWINCH",
  "SIGIO",
  "SIGPOLL",
  "SIGLOST",
  "SIGSYS"
];

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
var startScript = args.start ? new WrapperScript(args.start, proc, !args.tty) : null;
args.

proc.on('close', function() {
  debug('process closed');
});

proc.on('error', function(err) {
  debug('err: ' + err);
});

proc.on('disconnect', function() {
  debug('disconnected');
});

proc.on('exit', function(code, sig) {
  sig = sig || 0
  debug('process exited with code ' + code + ' and signal ' + sig);
  process.exit(code);
});

proc.stdout.on('data', function(chunk) {
  process.stdout.write(chunk);
});

process.stdin.on('data', function(chunk) {
  debug('STDIN:' + chunk);
  proc.stdin.write(chunk);
})

if(!args.tty) {
  proc.stderr.on('data', function(chunk) {
    process.stderr.write(chunk);
  });
}

if(startScript) {
  debug("Running start script");
  startScript.run().then(function() {
    debug("Done running start script");
  });

  startScript.stop();
}
