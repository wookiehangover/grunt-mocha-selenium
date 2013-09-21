var assert = require('assert');

describe('Simple Appium test', function(){

  it('should test an ios app', function(done){
    var browser = this.browser;
    browser
      .elementsByTagName("textField", function(err, els) {
        els[0].type('2', function(err) {
          els[1].type('3', function(err) {
            browser.elementsByTagName('button', function(err, btns) {
              btns[0].click(function(err) {
                browser.elementsByTagName('staticText', function(err, texts) {
                  texts[0].text(function(err, str) {
                    assert.equal(str, 5);
                    done();
                  })
                })
              });
            })
          });
        });
      })
  });

});

