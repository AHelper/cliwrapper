var mocha = require('mocha'),
    assert = require('chai').assert,
    child_process = require('child_process');

describe('wait', function() {
  it('shall run the test script', function(done) {
    this.timeout(4000);
    child_process.exec('node bin/cliwrapper.js --start=test/wait/start -- test/wait/./test.sh', {
      timeout: 3000,
      killSignal: 'SIGKILL'
    }, function(err, stdout, stderr) {
      if(err) {
        done(err);
      } else {
        if(/RESULT 123456/.exec(stdout)) {
          done();
        } else {
          done(new Error("Could not match RegExp"));
        }
      }
    });
  });
});
