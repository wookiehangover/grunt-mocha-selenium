# grunt-mocha-selenium

> Run functional Mocha tests with webdriver against a local selenium instance.

## Getting Started
This plugin requires Grunt.

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-mocha-selenium --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-mocha-selenium');
```

## The "mocha_selenium" task

### Overview
In your project's Gruntfile, add a section named `mochaSelenium` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  mocha_selenium: {
    options: {
      // Task-specific options go here.
    },
    your_target: {
      // Target-specific file lists and/or options go here.
    },
  },
})
```

### Options

The usual Mocha options are passed through this task to a new Mocha instance.

The following options can be supplied to the task:

#### options.usePromises
Type: `Boolean`
Default value: `false`

If enabled, this will use the [promise-enabled wd
browser API](https://github.com/admc/wd#promises-api) instead of the normal
synchronous API.

### Usage Examples

See this project's `Gruntfile.js` for examples.

#### Default Options
In this example, we'll run functinoal mocha tests for all files in the
`test` directory using the wd promises API and the nyan-cat reporter.

```js
grunt.initConfig({
  mochaSelenium: {
    options: {
      reporter: 'nyam',
      usePromises: true
    },
    all: ['test/*.js' ]
  },
})
```


## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History

* v0.0.1

## License
Copyright (c) 2013 Sam Breed. Licensed under the MIT license.
