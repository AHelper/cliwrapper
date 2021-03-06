CLIWrapper
==========
[![NPM Version](https://img.shields.io/npm/v/cliwrapper.svg)](https://www.npmjs.com/package/cliwrapper) [![Build Status](http://jenkins.ahelper.me/buildStatus/icon?job=tests)](http://jenkins.ahelper.me/job/tests/master)

Want to run some services that only run with an interactive CLI but don't want to control them manually? Does the application not shutdown cleanly when terminated? You should wrap it!

Installing
----------
_Primary supported platform is Linux. Windows support is untested._

For global usage, ensure you have Node.js and NPM and run the following as root:

```
# npm install -g cliwrapper
```

Quickstart
----------
There's no time to explain, here's an example!
```
./start:
# Wait for server init
WAITFOR Listening on port
WAITFOR :
# Announce it started
TYPE say Server started!\n

./sigterm:
# Hit enter a few times in case some command is being typed
SENDKEY Enter Enter Enter
TYPE say Server stopping in 5 seconds!\n
# Wait 5 seconds
SLEEP 5
# Exit safely
TYPE exit\n

./run-server.sh:
cliwrapper --tty --start=start --signal=SIGTERM,sigterm -- some-cli-server
```

This is a quick example was based on running the Terraria dedicated server.  Keep reading for documentation on the wrapper scripts and how to run CLIWrapper!

Usage
-----
```
Usage: cliwrapper [--tty] [--start=filename] [--signal=name,filename] -- <command> [arguments...]

Options:
  --start     Runs a script on program start
  --signal    Runs a script upon receiving a signal   [array][default: []]
  -h, --help  Show help                               [boolean]
```

**NOTE: Send signals to the wrapper, not to the wrapper's child!**

Script Documentation
====================
CLIWrapper provides a simple scripting language to interact with applications.  Scripts run in response to certain events, such as application start or signals received.

The command is an uppercase keyword followed by exactly 1 space then one or more arguments.

SLEEP [num seconds]
-------------------
Sleeps for the specified number of seconds.  The value represents the floating point number of seconds to sleep for with no greater than millisecond accuracy (see setTimeout for specific timing restrictions).

Example, sleeping for 250ms:
```
SLEEP 0.25
```

TYPE [escaped text...]
----------------------
Sends the text to the wrapped process's stdin.  The text uses escape sequences as-per C89's allowed escape sequences (3.1.3.4 Character constants).  Here's a list of those escape sequences for reference:

|Sequence|Value|
|:------:|:---:|
|   \a   | 0x07|
|   \b   | 0x08|
|   \f   | 0x0C|
|   \n   | 0x0A|
|   \r   | 0x0D|
|   \t   | 0x09|
|   \v   | 0x0B|
|   \'   | 0x27|
|   \"   | 0x22|
|   \?   | 0x2F|
|  \\\\  |  \\ |
|  \xnn  | 0xnn|
|  \ooo  | 0ooo|

_(nn is a 2 digit hexadecimal value, ooo is a 1 to 3 digit octal value)_

Examples:
```
# Sends some text
TYPE some text
# Sends a command followed by a newline
TYPE save\n
# Sends a space (See SENDKEY for things like this!)
TYPE  
```

A word of caution, trailing/leading spaces are part of the escaped text.  In the 3rd example, TYPE followed by 2 spaces will treat the second space as the string to send.  Be careful of editors that trim trailing whitespace.  See SENDKEY to be safe.

SENDKEY [key ...]
-----------------
Writes characters to the wrapped process's stdin.  The characters are generated from a list of space-delimited key names.  The following keys are recognized (case-sensative):

* Enter
* Esc
* Escape
* Up
* Down
* Left
* Right
* Del
* Delete
* Backspace
* Space
* Tab
* Ctrl_(A through Z, [, \, ], ~, ?)
* Ctrl_Space

WAITFOR [escaped text...]
-------------------------
Waits until the process outputs text on either stdout or stderr.  Performs an exact match against the escaped string (see TYPE for the escape sequences allowed).
