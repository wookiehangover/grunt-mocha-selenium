var Mocha = require('mocha');
var Module = require('module');
var path = require('path');

module.exports = function(options, browser, grunt, fileGroup){

  // Set up the mocha instance with options and files.
  // This is copied from Mocha.prototype.run
  // We need to do this because we need the runner, and the runner
  //  is only held in that closure, not assigned to any instance properties.
  var mocha = new Mocha(options);

  mocha.suite.on('pre-require', function (context, file, m) {
    this.ctx.browser = browser;
  });

  grunt.file.expand({filter: 'isFile'}, fileGroup.src).forEach(function (f) {
    var filePath = path.resolve(f);
    if (Module._cache[filePath]) {
      delete Module._cache[filePath];
    }
    mocha.addFile(filePath);
  });

  if (mocha.files.length){
    mocha.loadFiles();
  }

  var suite = mocha.suite;
  options = mocha.options;
  var runner = new Mocha.Runner(suite);
  var reporter = new mocha._reporter(runner);

  runner.ignoreLeaks = options.ignoreLeaks;
  runner.asyncOnly = options.asyncOnly;

  if (options.grep) runner.grep(options.grep, options.invert);
  if (options.globals) runner.globals(options.globals);
  if (options.growl) mocha._growl(runner, reporter);
  // Sigh.

  return runner;
};
