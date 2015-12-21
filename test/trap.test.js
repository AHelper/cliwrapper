var mocha = require('mocha'),
    assert = require('chai').assert,
    child_process = require('child_process');

describe('trap', function() {
  it('shall run the test script', function(done) {
    this.timeout(6000);
    var proc = child_process.exec('node bin/cliwrapper.js --start=test/trap/start --signal=SIGTERM,test/trap/sigterm -- node test/trap/./test.js', {
      timeout: 5000,
      killSignal: 'SIGKILL'
    }, function(err, stdout, stderr) {
      if(err) {
        console.log("Got an error in the trap test");
        console.log(err);
        console.log(err.stack);
        done(err);
      } else {
        done();
      }
    });
    setTimeout(function () {
      console.log("Killing");
      proc.kill('SIGTERM');
    }, 3000);
  });
});
