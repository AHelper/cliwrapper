#!/usr/bin/env node
var _pty = require('pty.js').spawn,
    through = require('through'),
    async = require('async'),
    debug = require('debug')('cliwrapper'),
    args = require('yargs')
      .usage('Usage: $0 [--tty] [--start=filename] [--signal=name,filename] -- <command> [arguments...]')
      .example('$0 --tty --signal SIGTERM,saveandexit -- vi')
      .nargs('start', 1)
      .describe('start', 'Runs a script on program start')
      .nargs('signal', 1)
      .array('signal')
      .default('signal', [])
      .describe('signal', 'Runs a script upon receiving a signal')
      .help('h')
      .alias('h', 'help')
      .epilog('http://git.ahelper.me/servers/cliwrapper')
      .argv,
    nopty = require('child_process').execFile,
    tty = require('tty'),
    WrapperScript = require('../lib/cliwrapper.js').WrapperScript;

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
  "SIGINT",
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
  "SIGTERM",
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
  "SIGPWR",
  "SIGSYS"
];

if(tty.isatty(0)) {
  process.stdin.setRawMode(true);
}

if(args._.length == 0) {
  usage();
}

// Start process
var proc = null;
try {
  debug('Starting command "' + args._[0] + '" with arguments ' + args._.slice(1).toString());
  proc = (args.tty ? pty : nopty)(args._[0], args._.slice(1));
} catch(err) {
  console.error("Failed to start command: " + err.message);
  process.exit(252);
}
// Load start script
var startScript = null;
if(args.start) {
  try {
      debug('Loading start script from "' + args.start + '"');
      startScript = new WrapperScript(args.start, proc, !args.tty);
  } catch(err) {
    console.log("Failed to load start script: " + err.message);
    process.exit(253);
  }
}
if(startScript) startScript.start();
// Load signal scripts
var signalScripts = {};
args.signal.forEach(function(pair) {
  var parts = pair.split(',');

  if(parts.length < 2) {
    console.error("signal requires 2 arguments");
    process.exit(254);
  } else {
    if(NODEJS_SIGNALS.indexOf(parts[0]) == -1) {
      console.error('Unknown signal "' + parts[0] + '"');
      process.exit(254);
    } else {
      var signalScript = null;
      try {
        debug('Loading signal script for ' + parts[0] + ' from "' + parts.slice(1).join(',') + '"');
        signalScript = new WrapperScript(parts.slice(1).join(','), proc, !args.tty);
      } catch(err) {
        console.log("Failed to load " + parts[0] + " handler: " + err.message);
        process.exit(253);
      }
      signalScripts[parts[0]] = signalScript;
      // Subscribe to signal event
      try {
        process.on(parts[0], function() {
          debug('Starting signal script for ' + parts[0]);
          signalScript.start();
          signalScript.run().then(function() {
            signalScript.stop();
          }, function(err) {
            debug(err);
            signalScript.stop();
          });
        });
      } catch(err) {
        console.error("Could not add signal handler for signal " + parts[0]);
        process.exit(254);
      }
    }
  }
});
// Pass remaining signals through
NODEJS_SIGNALS.forEach(function(sig) {
  if(!signalScripts[sig]) {
    debug("Adding handler for signal " + sig);
    try {
      process.on(sig, function() {
        debug('Passing signal ' + sig + ' to process');
        proc.kill(sig);
      });
    } catch(err) {
      debug("Could not add handler for signal " + sig);
    }
  }
});

debug('Subscribing to process events');
// Catch application exit
proc.on('exit', function(code, sig) {
  debug('Process ended with exit code ' + code);
  process.exit(code);
});

// Pass application's stdout through
proc.stdout.on('data', function(chunk) {
  process.stdout.write(chunk);
});

// Pass stdin through to application
process.stdin.on('data', function(chunk) {
  proc.stdin.write(chunk);
})

// If stderr exists, pass through from application
if(!args.tty) {
  proc.stderr.on('data', function(chunk) {
    process.stderr.write(chunk);
  });
}

// Run start script if possible
if(startScript) {
  startScript.run().then(function() {
    startScript.stop();
  });
}
