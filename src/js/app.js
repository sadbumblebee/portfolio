// import * as hm from '..modules/hm.js'
var hm = require('./modules/hm.js')

function init() {
    hm.run();
}

window.onload = () => init()