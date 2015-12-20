var mocha = require('mocha'),
    assert = require('chai').assert,
    child_process = require('child_process');

describe('simple', function() {
  it('shall run the test script', function(done) {
    this.timeout(6000);
    child_process.exec('node bin/cliwrapper.js --start=test/simple/start -- test/simple/./test.sh', {
      timeout: 5000,
      killSignal: 'SIGKILL'
    }, function(err, stdout, stderr) {
      if(err) {
        done(err);
      } else {
        if(/I read: hello world/.exec(stdout)) {
          done();
        } else {
          done(new Error("Could not match RegExp"));
        }
      }
    });
  });
});
