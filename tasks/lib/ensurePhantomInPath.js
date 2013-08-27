var phantomjs = require('phantomjs');
var async = require('async');
var spawn = require('child_process').spawn;
var path = require('path');

module.exports = function ensurePhantomInPath(gruntf){
  var phantom;
  async.series(
    [
      function checkIfInPath(cont) {
        phantom = spawn('phantomjs');
        phantom.on('error', function() {
          process.env.PATH = path.dirname(phantomjs.path) + ':' + process.env.PATH;
          phantom = spawn('phantomjs');
          phantom.on('error', function() {
            cont('missing');
          });
          phantom.stdout.on('data', function() {
            // phantomjs was successfully added to PATH
            grunt.log.ok('phantomjs was added to $PATH:', phantomjs.path);
            cont();
          })
        });
        phantom.stdout.on('data', function() {
          // phantomjs was in PATH
          grunt.log.ok('phantomjs was already in $PATH:', phantomjs.path);
          cont();
        });
      },
      function killPhantom(cont) {
        if (phantom.kill()) {
          cont();
        } else {
          cont('zombie');
        }
      }
    ],
    function handleError(error) {
      if (error == 'missing') {
        grunt.fail.fatal('Could not launch phantomjs')
      } else if (error == 'zombie') {
        grunt.fail.warn('Zombie phantomjs. Protect brains.')
      }
    }
  );
};
