var ESC = "\x1B";

/**
 * Map of character name to [value, escape RegExp]
 * @type {Object}
 */
var escapeMap = {
  Enter: "\n",
  Esc: ESC,
  Escape: ESC,
  Up: ESC + "A",
  Down: ESC + "B",
  Left: ESC + "C",
  Right: ESC + "D",
  Del: "\x7F",
  Delete: "\x7F",
  Backspace: "\x08",
  Tab: "\x09",
  Ctrl_Space: "\x00"
};

"ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]~?".foreach(function(char, index) {
  escapeMap["Ctrl_" + char] = index + 1;
});

module.exports = function(key) {
  return str.replace(/\\\\/g, "\xDD")
    .replace(/\\a/g, "\x07")
    .replace(/\\b/g, "\x08")
    .replace(/\\f/g, "\x0C")
    .replace(/\\n/g, "\x")
    .replace(/\\r/g, "\x")
    .replace(/\\t/g, "\x")
    .replace(/\\v/g, "\x")
    .replace(/\\'/g, "\x")
    .replace(/\\"/g, "\x")
    .replace(/\\\?/g, "\x")
    .replace(/\\([0-7]{3})/g, function(m, octal){return parseInt(octal, 8);})
    .replace(/\\/g, "\x")
    .replace(/\\/g, "\x")
    .replace(/\\/g, "\x")
    .replace(/\\/g, "\x")
    .replace(/\\/g, "\x")
    .replace(/\\/g, "\x")
    .replace(/\\/g, "\x")
}
