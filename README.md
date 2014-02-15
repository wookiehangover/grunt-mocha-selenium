# grunt-mocha-selenium

> Run functional [Mocha](https://github.com/visionmedia/mocha) tests
> with [wd](https://github.com/admc/wd) with [Selenium](http://docs.seleniumhq.org/), Phantomjs and
> [Appium](http://appium.io/).

## Getting Started

This plugin requires Grunt.

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to
check out the [Getting Started](http://gruntjs.com/getting-started)
guide, as it explains how to create a
[Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and
use Grunt plugins. Once you're familiar with that process, you may
install this plugin with this command:

```shell
npm install grunt-mocha-selenium --save-dev
```

Once the plugin has been installed, it may be enabled inside your
Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-mocha-selenium');
```

## The "mochaSelenium" task

Selenium tests are run by a standalone selenium driver that will be
downloaded the first time the task is run. Chrome support is provided by
the [Chrome
Driver](https://code.google.com/p/selenium/wiki/ChromeDriver) plugin for
Selenium and is provided on demand.

The task fires up a selenium instance for the browser of your choice
(Firefox, Chrome or Phantomjs) and initializes an instance of
[wd](https://github.com/admc/wd), passing it to the mocha test runner's
context.

Take a look in the `test` directory for examples of what mocha tests
with wd look like.

### Overview
In your project's Gruntfile, add a section named `mochaSelenium` to the
data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  mochaSelenium: {
    options: {
      // Mocha options
      reporter: 'spec',
      timeout: 30e3,
      // Toggles wd's promises API, default:false
      usePromises: false
    },
    firefox: {
      src: ['test/*.js']
      // firefox is the default browser, so no browserName option required
    },
    chrome: {
      src: ['test/*.js'],
      options: {
        // Chrome browser must be installed from Chromedriver support
        browserName: 'chrome'
      }
    },
    phantomjs: {
      src: ['test/*.js'],
      options: {
        // phantomjs must be in the $PATH when invoked
        browserName: 'phantomjs'
      }
    }
  }
})
```

### Options

The usual Mocha options are passed through this task to a new Mocha
instance.

The following options can be supplied to the task:

#### options.usePromises

Type: `Boolean` Default value: `false`

If enabled, this will use the [promise-enabled wd browser
API](https://github.com/admc/wd#promises-api) instead of the normal
synchronous API.

#### options.host and options.port

If these are specified then a server will not be started but these settings will be used to connect to an existing server.

"options.username" and "options.accesskey" can be specified if you want to use Sauce Labs' on demand service.

#### options.wdCustomizer

If you'd like to add [custom wd methods](https://github.com/admc/wd#adding-custom-methods),
you can specify a `wdCustomizer` path to a module that patches the wd module
before the wd remote is created.

Example:

```js
grunt.initConfig({
  mochaSelenium: {
    options: {
      reporter: 'spec',
      timeout: 30e3,
      useChaining: true
    },
    phantomjs: {
      src: ['test/*.js'],
      options: {
        browserName: 'phantomjs',
        wdCustomizer: 'test/wd_customizer'
      }
    }
  }
})
```

`test/wd_customizer.js`:

```js
function wdCustomizer(wd) {
  wd.addPromiseChainMethod(
    'waitForSomethingCustom',
    function(pageId) {
      return this.waitForElementByCssSelector('#somethingCustom');
    }
  );

  return wd;
}

module.exports = wdCustomizer;
```

## The "mochaAppium" task

The "mochaAppium" task will use the [Appium](http://appium.io/) test
automation framework to provide a selenium bridge to native and hybrid
applications.

**Unlike the "mochaSelenium" tasks, Appium needs to be installed
separately.** See their [getting started
guide](http://appium.io/getting-started.html) for information on
installing and configuring Appium on you system. You don't need to run
an Appium server before running this task, you just need to have it
installed.

### Overview
In your project's Gruntfile, add a section named `mochaAppium` to the
data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  mochaAppium: {
    options: {
      // Mocha options
      reporter: 'spec',
      timeout: 30e3,
      // Toggles wd's promises API, default:false
      usePromises: false
      // Path to appium executable, default:'appium'
      appiumPath: 'appium'
    },
    iphone: {
      src: ['test/*.js'],
      options: {
        // Appium Options
        device: 'iPhone Simulator',
        platform: 'MAC',
        version: '6.1',
        // A url of a zip file containg your .app package
        // or 
        // A local absolute path to your simulator-compiled .app directory
        app: 'http://appium.s3.amazonaws.com/TestApp6.0.app.zip'
      }
    }
  }
});
```

### Usage Examples

See this project's `Gruntfile.js` for examples.

In this example, we'll run functinoal mocha tests for all files in the
`test` directory using the wd promises API and the nyan-cat reporter.

```js
grunt.initConfig({
  mochaSelenium: {
    options: {
      reporter: 'nyan',
      usePromises: true,
      useChrome: true
    },
    all: ['test/*.js' ]
  },
})
```

## Contributing

In lieu of a formal styleguide, take care to maintain the existing
coding style. Add unit tests for any new or changed functionality. Lint
and test your code using [Grunt](http://gruntjs.com/).

## Release History

* v0.7.0 - bumping selenium and chromedriver versions
* v0.4.0 - add Appium support
* v0.3.0 - add phantomjs support
* v0.2.0 - add chromedriver support
* v0.0.1 - initial release

## Licensed under the MIT license.
