var assert = require('assert');

describe('Promise-enabled WebDriver', function () {

  describe('injected browser executing a Google Search', function () {

    it('performs as expected', function (done) {
      var searchBox;
      var browser = this.browser;
      browser.get('http://google.com')
      .elementByName('q').type('webdriver')
      .elementByName('q').getAttribute('value')
      .then(function(val){
        assert.equal(val, 'webdriver');
      }).then(done, done);
    });
  });
});
