/*
 * grunt-mocha-selenium
 * https://github.com/wookiehangover/grunt-mocha-selenium
 *
 * Copyright (c) 2013 Sam Breed
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    jshint: {
      all: [
        'Gruntfile.js',
        'tasks/*.js'
      ],
      options: {
        jshintrc: '.jshintrc'
      }
    },

    // Configuration to be run (and then tested).
    mochaSelenium: {
      options: {
        timeout: 30e3
      },
      promises: {
        src: ['test/functional/promises.js'],
        options: {
          usePromises: true
        }
      },
      chaining: {
        src: ['test/functional/chaining.js'],
        options: {
          useChaining: true
        }
      },
      chrome: {
        src: ['test/functional/sanity.js'],
        options: {
          browserName: 'chrome'
        }
      },
      phantomjs: {
        src: ['test/functional/sanity.js'],
        options: {
          browserName: 'phantomjs'
        }
      },
      sanity: ['test/functional/sanity.js']
    },

    mochaAppium: {
      options: {
        timeout: 30e3
      },
      iphone: {
        src: ['test/functional/appium.js'],
        options: {
          device: 'iPhone Simulator',
          platform: 'MAC',
          version: '6.1',
          app: 'http://appium.s3.amazonaws.com/TestApp6.0.app.zip',
          browserName: "iOS",
          newCommandTimeout: 60
        }
      }
    }

  });

  grunt.loadTasks('tasks');
  grunt.loadNpmTasks('grunt-contrib-jshint');

  grunt.registerTask('test', ['mochaSelenium', 'mochaAppium']);

  grunt.registerTask('default', ['jshint', 'test']);
};
