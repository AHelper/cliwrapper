/**
 * Unescapes a string that uses escape sequences according to
 * C89 allowed escape sequences (3.1.3.4 Character constants).
 * @param  {String} key ASCII String with C-style escape sequences
 * @return {String}     Unescaped string
 */
module.exports = function(key) {
  return key.replace(/\\\\/g, "\xDD")
    .replace(/\\a/g, "\x07")
    .replace(/\\b/g, "\x08")
    .replace(/\\f/g, "\x0C")
    .replace(/\\n/g, "\x0A")
    .replace(/\\r/g, "\x0D")
    .replace(/\\t/g, "\x09")
    .replace(/\\v/g, "\x0B")
    .replace(/\\'/g, "\x27")
    .replace(/\\"/g, "\x22")
    .replace(/\\\?/g, "\x2F")
    .replace(/\\([0-7]{1,3})/g, function(m, octal){return String.fromCharCode(parseInt(octal, 8));})
    .replace(/\\x([0-9a-fA-F]{2})/g, function(m, hex){return String.fromCharCode(parseInt(hex, 16));})
    .replace(/\xDD/g, "\\");
}
