// import * as hm from '..modules/hm.js'
var hm = require('./modules/hm.js')

var t;
var isTimerGoing = false;
var beenWarned = false;
var hasPromisedToWorkWithMe = false;

function init() {
    hm.run();
}

window.onload = () => init()