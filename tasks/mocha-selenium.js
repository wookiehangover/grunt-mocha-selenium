// this is adapated from https://github.com/gregrperkins/grunt-mocha-hack

"use strict";

var createDomain = require('domain').create;
var path = require('path');
var mocha = require('./lib/mocha-runner');
var mochaReporterBase = require('mocha/lib/reporters/base');
var seleniumLauncher = require('selenium-launcher');
var wd = require('wd');

module.exports = function(grunt) {
  grunt.registerMultiTask('mochaSelenium', 'Run functional tests with mocha', function() {
    var paths = this.filesSrc.map(function (file) {
        return path.resolve(file);
    });
    // Retrieve options from the grunt task.
    var options = grunt.util._.defaults(this.options(), {
      useChrome: false
    });
    var gruntDone = this.async();

    // Guard against a common failure mode
    if (paths.length === 0) {
      grunt.warn(
        'No files found in mocha-selenium:' + this.file.dest + ' task.'
      );
      return false;
    }

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
    };

    // When we're done with mocha, dispose the domain
    var mochaDone = function(errCount) {
      var withoutErrors = (errCount === 0);
      restore(); // restore prior node state
      // Indicate whether we failed to the grunt task runner
      gruntDone(withoutErrors);
    };

    seleniumLauncher({ chrome: options.useChrome }, function(err, proc) {
      grunt.log.writeln('Selenium Running');
      if(err){
        proc.exit();
        restore();
        grunt.fail.fatal(err);
        return;
      }

      var remote = options.usePromises ? 'promiseRemote' : 'remote';
      var browser = wd[remote](proc.host, proc.port);
      var opts = {
        browserName: options.useChrome ? 'chrome' : 'firefox'
      };

      browser.on('status', function(info){
        grunt.log.writeln('\x1b[36m%s\x1b[0m', info);
      });

      browser.on('command', function(meth, path, data){
        grunt.log.debug(' > \x1b[33m%s\x1b[0m: %s', meth, path, data || '');
      });

      browser.init(opts, function(err){
        if(err){
          restore();
          grunt.fail.fatal(err);
          return;
        }

        var runner = mocha(options, browser, paths);
        // Create the domain, and pass any errors to the mocha runner
        var domain = createDomain();
        domain.on('error', runner.uncaught.bind(runner));

        // Selenium Download and Launch
        domain.run(function() {
          runner.run(function(err){
            browser.quit(function(){
              proc.kill();
              mochaDone(err);
            });
          });
        });
      });

      proc.on('exit', function(){
        browser.quit();
      });

    });

  });
};
