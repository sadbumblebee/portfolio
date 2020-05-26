// NPM modules
var Favico = require('favico.js-slevomat');

// Globals
var t;
var isTimerGoing = false;
var beenWarned = false;
var favicon = new Favico({
    animation: 'slide'
});
var hasPromisedToWorkWithMe;

function run() {
    // If you haven't come to this site before set default
    if (localStorage.getItem('sbb:seenMessage') == undefined) {
        localStorage.setItem('sbb:seenMessage', false);
    }

    hasPromisedToWorkWithMe = localStorage.getItem('sbb:seenMessage')
    messageButton()
    // Check hidden status every second
    window.setInterval(checkTabVisibility, 1000);
}

function messageButton() {
    var button = document.querySelector('#hidden-button')

    button.addEventListener('click', () => {
        var el = document.querySelector('#hidden-message-container');
        el.classList.add('not-visible');
        // Some var for never showing again.
        clearTimedMessage();
        hasPromisedToWorkWithMe = true;
        localStorage.setItem('sbb:seenMessage', hasPromisedToWorkWithMe);
    })
}

function checkTabVisibility() {
    var hidden, visibilityChange;
    if (!hasPromisedToWorkWithMe) {

        if (typeof document.hidden !== "undefined") { // Opera 12.10 and Firefox 18 and later support 
            hidden = "hidden";
            visibilityChange = "visibilitychange";
        } else if (typeof document.msHidden !== "undefined") {
            hidden = "msHidden";
            visibilityChange = "msvisibilitychange";
        } else if (typeof document.webkitHidden !== "undefined") {
            hidden = "webkitHidden";
            visibilityChange = "webkitvisibilitychange";
        }
    
        if (document[hidden]) {
            timedMessage();
            // Set gvar on this too
            isTimerGoing = true;
        } else {
            // Reset Timer
            favicon.badge(0);
            if (isTimerGoing) {
                clearTimedMessage()
                isTimerGoing = false;
            }
        }

    }
};

function timedMessage() {
    // 1,800 seconds === 30 minutes
    t = window.setTimeout(sbbMessage, (1800*1000))
};

function clearTimedMessage() {
    window.clearTimeout(t);
}

function sbbMessage() {
    if (!beenWarned) {
        favicon.badge(1);
        var el = document.querySelector('#hidden-message-container');
        el.classList.remove('not-visible');
    }
    beenWarned = true;
}

module.exports = { run };