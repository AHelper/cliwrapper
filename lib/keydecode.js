var ESC = "\x1B";

/**
 * Map of character name to [value, escape RegExp]
 * @type {Object}
 */
var keyMap = {
  Enter: "\x0D",
  Esc: ESC,
  Escape: ESC,
  Up: ESC + "OA",
  Down: ESC + "OB",
  Left: ESC + "OD",
  Right: ESC + "OC",
  Del: "\x7F",
  Delete: "\x7F",
  Backspace: "\x08",
  Space: " ",
  Tab: "\x09",
  Ctrl_Space: "\x00"
};

"ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]~?".split('').forEach(function(char, index) {
  keyMap["Ctrl_" + char] = String.fromCharCode(index + 1);
});

module.exports = function(key) {
  if(keyMap.hasOwnProperty(key)) {
    return keyMap[key];
  } else {
    throw new Error('Unknown key "' + key + '"');
  }
}
