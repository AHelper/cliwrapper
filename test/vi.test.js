var mocha = require('mocha'),
    assert = require('chai').assert,
    child_process = require('child_process'),
    fs = require('fs'),
    crypto = require('crypto');

describe('vi', function() {
  after(function(done) {
    // fs.unlink('test.txt', function() {
      // fs.unlink('.swp', function() {
        done();
      // });
    // });
  });

  before(function(done) {
    fs.unlink('test.txt', function() {
      fs.unlink('.swp', function() {
        done();
      });
    });
  });

  it('shall run the test script', function(done) {
    this.timeout(11000);
    child_process.exec('node bin/cliwrapper.js --start=test/vi/start -- vi', {
      timeout: 10000,
      killSignal: 'SIGKILL'
    }, function(err, stdout, stderr) {
      if(err) {
        done(err);
      } else {
        fs.readFile('test.txt', function(err, data) {
          if(err) done(err);

          var md5sum = crypto.createHash('md5');

          md5sum.update(data);
          assert.equal('bb1416fa97c08df9be549c96f96bdb89', md5sum.digest('hex'));
          done();
        });
      }
    });
  });
});
