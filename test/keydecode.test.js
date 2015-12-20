var mocha = require('mocha'),
    chai = require('chai'),
    assert = chai.assert;

describe('keydecode', function() {
  var keydecode;

  before(function() {
    keydecode = require('../lib/keydecode.js');
  });

  it('shall have Ctrl_B be character code 0x02', function() {
    assert.equal(keydecode('Ctrl_B'), '\x02');
  });

  it('shall have Ctrl_? be character code 0x1F', function() {
    assert.equal(keydecode('Ctrl_?'), '\x1F');
  });

  it('shall have Escape be character code \x1B', function() {
    assert.equal(keydecode('Escape'), '\x1B');
  });

  it('shall have Ctrl_[ be character code \x1B', function() {
    assert.equal(keydecode('Ctrl_['), '\x1B');
  });
});
