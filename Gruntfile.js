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
      all: ['test/functional/sanity.js'],
      promises: {
        src: ['test/functional/promises.js'],
        options: {
          usePromises: true,
          reporter: 'nyan'
        }
      },
      chrome: {
        src: ['test/functional/sanity.js'],
        options: {
          useChrome: true
        }
      }
    }

  });

  // Actually load this plugin's task(s).
  grunt.loadTasks('tasks');

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-jshint');

  // Whenever the "test" task is run, first clean the "tmp" dir, then run this
  // plugin's task(s), then test the result.
  grunt.registerTask('test', ['mochaSelenium']);

  // By default, lint and run all tests.
  grunt.registerTask('default', ['jshint', 'test']);

};
