// NPM modules
var _ = {};
_.assign = require('lodash.assign');

var d3 = _.assign({},
  require("d3-selection"),
);

function init() {
    emailLink();
}

function emailLink() {
    var link = d3.select('#email-link')

    link.on('click', (e) => {
        e.preventDefault();
        console.log(click)
        link.text('sadbumblebee at gmail dot com')
        // Show email after email >
        
    })

}

init();

