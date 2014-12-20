// this is adapated from https://github.com/gregrperkins/grunt-mocha-hack

"use strict";

module.exports = function(grunt) {
  var createDomain = require('domain').create;
  var mocha = require('./lib/mocha-runner');
  var mochaReporterBase = require('mocha/lib/reporters/base');
  var seleniumLauncher = require('selenium-launcher');
  var wd = require('wd');
  var phantomjs = require('phantomjs');
  var path = require('path');

  grunt.registerMultiTask('mochaSelenium', 'Run functional tests with mocha', function() {
    var done = this.async();
    // Retrieve options from the grunt task.
    var options = this.options({
      browserName: 'firefox',
      usePromises: false,
      useSystemPhantom: false
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

    if(options.host && options.port){ //don't need to start selenium ourselves as we are connecting to a specific server
      grunt.log.writeln('Using external selenium server: ' + options.host + ":" + options.port);
      var selenium = {
        host: options.host,
        port: options.port,
        username: options.username,
        accesskey: options.accesskey
      };

      delete options.host;
      delete options.port;

      startRunner(options, selenium, fileGroup, next);

    }
    else{

      if (options.browserName === 'phantomjs' && !options.useSystemPhantom) {
        // add npm-supplied phantomjs bin dir to PATH, so selenium can launch it
		var isWin = /^win/.test(process.platform);
		if (isWin) {
			process.env.PATH = path.dirname(phantomjs.path) + ';' + process.env.PATH;
		} else {
			process.env.PATH = path.dirname(phantomjs.path) + ':' + process.env.PATH;
		}
      }

      seleniumLauncher({ chrome: options.browserName === 'chrome' }, function(err, selenium) {
        grunt.log.writeln('Selenium Running');
        if(err){
          selenium.exit();
          grunt.fail.fatal(err);
          return;
        }
        startRunner(options, selenium, fileGroup, next);
      });
    }
  }

  function startRunner(options, selenium, fileGroup, next){

    // If a WD customizer is specified, load it
    if (options.wdCustomizer) {
      var wdCustomizerPath = path.join(process.env.PWD, options.wdCustomizer);
      wd = require(wdCustomizerPath)(wd);
    }

    // When we're done with mocha, dispose the domain
    var mochaDone = function(errCount) {
      var withoutErrors = (errCount === 0);
	  if (!withoutErrors) {
		grunt.fail.fatal('Number of failed tests: ' + errCount);
	  } else {
		  // Indicate whether we failed to the grunt task runner
		  next(withoutErrors);
	  }
    };

    var remote = options.usePromises ? 'promiseRemote' : 'remote';
    remote = options.useChaining ? 'promiseChainRemote' : remote;

    var browser = wd[remote](selenium.host, selenium.port, selenium.username, selenium.accesskey);

    grunt.log.debug("Selenium options: " + JSON.stringify(options));

    browser.on('status', function(info){
      grunt.log.writeln('\x1b[36m%s\x1b[0m', info);
    });

    browser.on('command', function(meth, path, data){
      grunt.log.debug(' > \x1b[33m%s\x1b[0m: %s', meth, path, data || '');
    });

    browser.init(options, function(err){
      if(err){
        grunt.fail.fatal(err);
        return;
      }

      browser.configureHttp(options.http || {});

      var runner = mocha(options, browser, grunt, fileGroup, wd);
      // Create the domain, and pass any errors to the mocha runner
      var domain = createDomain();
      domain.on('error', runner.uncaught.bind(runner));

      // Give selenium some breathing room
      setTimeout(function(){
        // Selenium Download and Launch
        domain.run(function() {
          runner.run(function(err){
            browser.quit(function(){
              if(selenium.kill){
                selenium.kill();
              }
              mochaDone(err);

              if (err) {
                 grunt.fail.warn('One or more tests failed.');
              }
            });
          });
        });
      }, 300);
    });

  }

};
