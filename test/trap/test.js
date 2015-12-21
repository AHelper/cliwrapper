process.on('SIGALRM', function() {
  process.on('SIGTERM', function() {
    process.on('SIGUSR2', function() {
      console.log("Got SIGUSR2");
    });
    console.log("Ready for SIGUSR2");
  });
  console.log("Ready for SIGTERM");
});
console.log("Ready for SIGALRM");

// Keep it running
process.stdin.on('data', function(){});
