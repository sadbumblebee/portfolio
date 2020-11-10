"use strict";

// NPM modules
var Favico = require('favico.js'); // Globals


var t;
var isTimerGoing = false;
var beenWarned = false;
var favicon = new Favico({
  animation: 'slide'
});
var hasPromisedToWorkWithMe = localStorage.getItem('sbb:seenMessage');

function run() {
  // Only run if you're on desktop
  // If you haven't come to this site before set default
  if (localStorage.getItem('sbb:seenMessage') == undefined) {
    localStorage.setItem('sbb:seenMessage', false);
    hasPromisedToWorkWithMe = 'false';
  }

  if (hasPromisedToWorkWithMe !== 'true') {
    bindMessageButton(); // Check hidden status every second

    window.setInterval(checkTabVisibility, 1000);
  }
}

function bindMessageButton() {
  var button = document.querySelector('#hidden-button');
  button.addEventListener('click', function () {
    var el = document.querySelector('#hidden-message-container');
    el.classList.add('not-visible'); // Some var for never showing again.

    clearTimedMessage();
    hasPromisedToWorkWithMe = 'true';
    localStorage.setItem('sbb:seenMessage', hasPromisedToWorkWithMe);
  });
}

function checkTabVisibility() {
  if (hasPromisedToWorkWithMe === 'false') {
    if (document.hidden && isTimerGoing !== true) {
      timedMessage(); // Set gvar on this too

      isTimerGoing = true;
    } else if (!document.hidden) {
      // Reset Timer
      favicon.badge(0);

      if (isTimerGoing) {
        clearTimedMessage();
        isTimerGoing = false;
      }
    } else {
      return;
    }
  }
}

;

function timedMessage() {
  t = window.setTimeout(sbbMessage, 30 * 60 * 1000);
}

;

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

module.exports = {
  run: run
};