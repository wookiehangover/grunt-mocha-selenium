var spawn = require('child_process').spawn;
var freeport = require('freeport');

function run(options, cb) {
  options = options || {};
  var APPIUM_PATH = options.appiumPath || 'appium';

  freeport(function(err, port) {
    if( err ){
      throw err;
    }
    console.log('Starting Appium on port ' + port);
    var child;

    child = spawn(APPIUM_PATH, [
      '--port', port,
    ]);
    child.host = '0.0.0.0';
    child.port = port;

    function badExit() {
      cb(new Error('Could not start Appium.'), child);
    }

    child.stdout.on('data', function(data) {
      var sentinal = 'Welcome to Appium';
      if (data.toString().indexOf(sentinal) !== -1) {
        child.removeListener('exit', badExit);
        child.removeListener('error', badExit);
        cb(null, child);
      }
    });

    child.on('exit', badExit);
    child.on('error', badExit);
  });
}

module.exports = function(options, cb) {
  if( !cb && typeof options === 'function' ){
    cb = options;
    options = {};
  }

  run(options, cb);
};
