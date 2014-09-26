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
    }

  });

  grunt.loadTasks('tasks');
  grunt.loadNpmTasks('grunt-contrib-jshint');

  grunt.registerTask('test', ['mochaSelenium']);

  grunt.registerTask('default', ['jshint', 'test']);
};
