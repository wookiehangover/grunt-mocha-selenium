// this is adapated from https://github.com/gregrperkins/grunt-mocha-hack

"use strict";

module.exports = function(grunt) {
  var createDomain = require('domain').create;
  var mocha = require('./lib/mocha-runner');
  var mochaReporterBase = require('mocha/lib/reporters/base');
  var wd = require('wd');
  var phantomjs = require('phantomjs');
  var path = require('path');
  var appiumLauncher = require('./lib/appium-launcher');
  var _ = grunt.util._;

  grunt.registerMultiTask('mochaAppium', 'Run functional tests with mocha', function() {
    var done = this.async();
    // Retrieve options from the grunt task.
    var options = this.options({
      usePromises: false
    });

    // We want color in our output, but when grunt-contrib-watch is used,
    //  mocha will detect that it's being run to a pipe rather than tty.
    // Mocha provides no way to force the use of colors, so, again, hack it.
    var priorUseColors = mochaReporterBase.useColors;
    if (options.useColors) {
      mochaReporterBase.useColors = true;
    }

    // More agnostic -- just remove *all* the uncaughtException handlers;
    //  they're almost certainly going to exit the process, which,
    //  in this case, is definitely not what we want.
    var uncaughtExceptionHandlers = process.listeners('uncaughtException');
    process.removeAllListeners('uncaughtException');
    var unmanageExceptions = function() {
      uncaughtExceptionHandlers.forEach(
        process.on.bind(process, 'uncaughtException'));
    };
    // Better, deals with more than just grunt?

    // Restore prior state.
    var restore = function() {
      mochaReporterBase.useColors = priorUseColors;
      unmanageExceptions();
      done();
    };

    grunt.util.async.forEachSeries(this.files, function(fileGroup, next){
      runTests(fileGroup, options, next);
    }, restore);
  });


  function runTests(fileGroup, options, next){

    // When we're done with mocha, dispose the domain
    var mochaDone = function(errCount) {
      var withoutErrors = (errCount === 0);
      // Indicate whether we failed to the grunt task runner
      next(withoutErrors);
    };

    if (options.browserName === 'phantomjs' && !options.useSystemPhantom) {
      // add npm-supplied phantomjs bin dir to PATH, so selenium can launch it
      process.env.PATH = path.dirname(phantomjs.path) + ':' + process.env.PATH;
    }

    // launch appium
    appiumLauncher(_.pick(options, 'appiumPath'), function(err, appium){
      grunt.log.writeln('Appium Running');
      if(err){
        appium.kill();
        grunt.fail.fatal(err);
        return;
      }

      appium.stdout.on('data', function(data){
        grunt.log.debug('Appium > '+ data.toString().replace('\n', ''));
      });

      appium.stderr.on('data', function(data){
        grunt.log.error('Appium > '+ data);
      });

      var remote = options.usePromises ? 'promiseRemote' : 'remote';
      var browser = wd[remote](appium.host, appium.port);

      var opts = _.omit(options, 'usePromises', 'appiumPath');

      browser.on('status', function(info){
        grunt.log.writeln('\x1b[36m%s\x1b[0m', info);
      });

      browser.on('command', function(meth, path, data){
        grunt.log.debug(' > \x1b[33m%s\x1b[0m: %s', meth, path, data || '');
      });

      browser.init(opts, function(err){
        if(err){
          grunt.fail.fatal(err);
          return;
        }

        var runner = mocha(options, browser, grunt, fileGroup);
        // Create the domain, and pass any errors to the mocha runner
        var domain = createDomain();
        domain.on('error', runner.uncaught.bind(runner));

        // Give selenium some breathing room
        setTimeout(function(){
          // Selenium Download and Launch
          domain.run(function() {
            runner.run(function(err){
              browser.quit(function(){
                appium.kill();
                mochaDone(err);
              });
            });
          });
        }, 300);
      });

    });

  }
};

