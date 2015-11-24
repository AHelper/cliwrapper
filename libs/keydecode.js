var ESC = "\x1B";

/**
 * Map of character name to [value, escape RegExp]
 * @type {Object}
 */
var keyMap = {
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
  keyMap["Ctrl_" + char] = index + 1;
});

module.exports = function(key) {
  if(keyMap.hasOwnProperty(key)) {
    return keyMap[key];
  } else {
    throw new Error('Unknown key "' + key + '"');
  }
}
