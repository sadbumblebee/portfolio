// import * as hm from '..modules/hm.js'
var hm = require('./modules/hm.js')

var t;
var isTimerGoing = false;
var beenWarned = false;
var hasPromisedToWorkWithMe = false;

function init() {
    emailLink();
    hm.run();
}

function emailLink() {
    var link = document.querySelector('#email-link')

    link.addEventListener('click', (e) => {
        e.preventDefault();
        console.log(click)
        link.text('sadbumblebee at gmail dot com')
        // Show email after email >   
    })
    
}

window.onload = () => init()