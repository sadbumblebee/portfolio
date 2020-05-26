(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
/**
 * @license MIT or GPL-2.0
 * @fileOverview Favico animations
 * @author Miroslav Magda, http://blog.ejci.net
 * @source: https://github.com/ejci/favico.js
 * @version 0.3.10
 */

/**
 * Create new favico instance
 * @param {Object} Options
 * @return {Object} Favico object
 * @example
 * var favico = new Favico({
 *    bgColor : '#d00',
 *    textColor : '#fff',
 *    fontFamily : 'sans-serif',
 *    fontStyle : 'bold',
 *    type : 'circle',
 *    position : 'down',
 *    animation : 'slide',
 *    elementId: false,
 *    element: null,
 *    dataUrl: function(url){},
 *    win: window
 * });
 */
(function () {

	var Favico = (function (opt) {
		'use strict';
		opt = (opt) ? opt : {};
		var _def = {
			bgColor: '#d00',
			textColor: '#fff',
			fontFamily: 'sans-serif', //Arial,Verdana,Times New Roman,serif,sans-serif,...
			fontStyle: 'bold', //normal,italic,oblique,bold,bolder,lighter,100,200,300,400,500,600,700,800,900
			type: 'circle',
			position: 'down', // down, up, left, leftup (upleft)
			animation: 'slide',
			elementId: false,
			element: null,
			dataUrl: false,
			win: window
		};
		var _opt, _orig, _h, _w, _canvas, _context, _img, _ready, _lastBadge, _running, _readyCb, _stop, _browser, _animTimeout, _drawTimeout, _doc;

		_browser = {};
		_browser.ff = typeof InstallTrigger != 'undefined';
		_browser.chrome = !!window.chrome;
		_browser.opera = !!window.opera || navigator.userAgent.indexOf('Opera') >= 0;
		_browser.ie = /*@cc_on!@*/false;
		_browser.safari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
		_browser.supported = (_browser.chrome || _browser.ff || _browser.opera);

		var _queue = [];
		_readyCb = function () {
		};
		_ready = _stop = false;
		/**
		 * Initialize favico
		 */
		var init = function () {
			//merge initial options
			_opt = merge(_def, opt);
			_opt.bgColor = hexToRgb(_opt.bgColor);
			_opt.textColor = hexToRgb(_opt.textColor);
			_opt.position = _opt.position.toLowerCase();
			_opt.animation = (animation.types['' + _opt.animation]) ? _opt.animation : _def.animation;

			_doc = _opt.win.document;

			var isUp = _opt.position.indexOf('up') > -1;
			var isLeft = _opt.position.indexOf('left') > -1;

			//transform the animations
			if (isUp || isLeft) {
				for (var a in animation.types) {
					for (var i = 0; i < animation.types[a].length; i++) {
						var step = animation.types[a][i];

						if (isUp) {
							if (step.y < 0.6) {
								step.y = step.y - 0.4;
							} else {
								step.y = step.y - 2 * step.y + (1 - step.w);
							}
						}

						if (isLeft) {
							if (step.x < 0.6) {
								step.x = step.x - 0.4;
							} else {
								step.x = step.x - 2 * step.x + (1 - step.h);
							}
						}

						animation.types[a][i] = step;
					}
				}
			}
			_opt.type = (type['' + _opt.type]) ? _opt.type : _def.type;

			_orig = link. getIcons();
			//create temp canvas
			_canvas = document.createElement('canvas');
			//create temp image
			_img = document.createElement('img');
			var lastIcon = _orig[_orig.length - 1];
			if (lastIcon.hasAttribute('href')) {
				_img.setAttribute('crossOrigin', 'anonymous');
				//get width/height
				_img.onload = function () {
					_h = (_img.height > 0) ? _img.height : 32;
					_w = (_img.width > 0) ? _img.width : 32;
					_canvas.height = _h;
					_canvas.width = _w;
					_context = _canvas.getContext('2d');
					icon.ready();
				};
				_img.setAttribute('src', lastIcon.getAttribute('href'));
			} else {
				_h = 32;
				_w = 32;
				_img.height = _h;
				_img.width = _w;
				_canvas.height = _h;
				_canvas.width = _w;
				_context = _canvas.getContext('2d');
				icon.ready();
			}

		};
		/**
		 * Icon namespace
		 */
		var icon = {};
		/**
		 * Icon is ready (reset icon) and start animation (if ther is any)
		 */
		icon.ready = function () {
			_ready = true;
			icon.reset();
			_readyCb();
		};
		/**
		 * Reset icon to default state
		 */
		icon.reset = function () {
			//reset
			if (!_ready) {
				return;
			}
			_queue = [];
			_lastBadge = false;
			_running = false;
			_context.clearRect(0, 0, _w, _h);
			_context.drawImage(_img, 0, 0, _w, _h);
			//_stop=true;
			link.setIcon(_canvas);
			//webcam('stop');
			//video('stop');
			window.clearTimeout(_animTimeout);
			window.clearTimeout(_drawTimeout);
		};
		/**
		 * Start animation
		 */
		icon.start = function () {
			if (!_ready || _running) {
				return;
			}
			var finished = function () {
				_lastBadge = _queue[0];
				_running = false;
				if (_queue.length > 0) {
					_queue.shift();
					icon.start();
				} else {

				}
			};
			if (_queue.length > 0) {
				_running = true;
				var run = function () {
					// apply options for this animation
					['type', 'animation', 'bgColor', 'textColor', 'fontFamily', 'fontStyle'].forEach(function (a) {
						if (a in _queue[0].options) {
							_opt[a] = _queue[0].options[a];
						}
					});
					animation.run(_queue[0].options, function () {
						finished();
					}, false);
				};
				if (_lastBadge) {
					animation.run(_lastBadge.options, function () {
						run();
					}, true);
				} else {
					run();
				}
			}
		};

		/**
		 * Badge types
		 */
		var type = {};
		var options = function (opt) {
			opt.n = ((typeof opt.n) === 'number') ? Math.abs(opt.n | 0) : opt.n;
			opt.x = _w * opt.x;
			opt.y = _h * opt.y;
			opt.w = _w * opt.w;
			opt.h = _h * opt.h;
			opt.len = ("" + opt.n).length;
			return opt;
		};
		/**
		 * Generate circle
		 * @param {Object} opt Badge options
		 */
		type.circle = function (opt) {
			opt = options(opt);
			var more = false;
			if (opt.len === 2) {
				opt.x = opt.x - opt.w * 0.4;
				opt.w = opt.w * 1.4;
				more = true;
			} else if (opt.len >= 3) {
				opt.x = opt.x - opt.w * 0.65;
				opt.w = opt.w * 1.65;
				more = true;
			}
			_context.clearRect(0, 0, _w, _h);
			_context.drawImage(_img, 0, 0, _w, _h);
			_context.beginPath();
			_context.font = _opt.fontStyle + " " + Math.floor(opt.h * (opt.n > 99 ? 0.85 : 1)) + "px " + _opt.fontFamily;
			_context.textAlign = 'center';
			if (more) {
				_context.moveTo(opt.x + opt.w / 2, opt.y);
				_context.lineTo(opt.x + opt.w - opt.h / 2, opt.y);
				_context.quadraticCurveTo(opt.x + opt.w, opt.y, opt.x + opt.w, opt.y + opt.h / 2);
				_context.lineTo(opt.x + opt.w, opt.y + opt.h - opt.h / 2);
				_context.quadraticCurveTo(opt.x + opt.w, opt.y + opt.h, opt.x + opt.w - opt.h / 2, opt.y + opt.h);
				_context.lineTo(opt.x + opt.h / 2, opt.y + opt.h);
				_context.quadraticCurveTo(opt.x, opt.y + opt.h, opt.x, opt.y + opt.h - opt.h / 2);
				_context.lineTo(opt.x, opt.y + opt.h / 2);
				_context.quadraticCurveTo(opt.x, opt.y, opt.x + opt.h / 2, opt.y);
			} else {
				_context.arc(opt.x + opt.w / 2, opt.y + opt.h / 2, opt.h / 2, 0, 2 * Math.PI);
			}
			_context.fillStyle = 'rgba(' + _opt.bgColor.r + ',' + _opt.bgColor.g + ',' + _opt.bgColor.b + ',' + opt.o + ')';
			_context.fill();
			_context.closePath();
			_context.beginPath();
			_context.stroke();
			_context.fillStyle = 'rgba(' + _opt.textColor.r + ',' + _opt.textColor.g + ',' + _opt.textColor.b + ',' + opt.o + ')';
			//_context.fillText((more) ? '9+' : opt.n, Math.floor(opt.x + opt.w / 2), Math.floor(opt.y + opt.h - opt.h * 0.15));
			if ((typeof opt.n) === 'number' && opt.n > 999) {
				_context.fillText(((opt.n > 9999) ? 9 : Math.floor(opt.n / 1000)) + 'k+', Math.floor(opt.x + opt.w / 2), Math.floor(opt.y + opt.h - opt.h * 0.2));
			} else {
				_context.fillText(opt.n, Math.floor(opt.x + opt.w / 2), Math.floor(opt.y + opt.h - opt.h * 0.15));
			}
			_context.closePath();
		};
		/**
		 * Generate rectangle
		 * @param {Object} opt Badge options
		 */
		type.rectangle = function (opt) {
			opt = options(opt);
			var more = false;
			if (opt.len === 2) {
				opt.x = opt.x - opt.w * 0.4;
				opt.w = opt.w * 1.4;
				more = true;
			} else if (opt.len >= 3) {
				opt.x = opt.x - opt.w * 0.65;
				opt.w = opt.w * 1.65;
				more = true;
			}
			_context.clearRect(0, 0, _w, _h);
			_context.drawImage(_img, 0, 0, _w, _h);
			_context.beginPath();
			_context.font = _opt.fontStyle + " " + Math.floor(opt.h * (opt.n > 99 ? 0.9 : 1)) + "px " + _opt.fontFamily;
			_context.textAlign = 'center';
			_context.fillStyle = 'rgba(' + _opt.bgColor.r + ',' + _opt.bgColor.g + ',' + _opt.bgColor.b + ',' + opt.o + ')';
			_context.fillRect(opt.x, opt.y, opt.w, opt.h);
			_context.fillStyle = 'rgba(' + _opt.textColor.r + ',' + _opt.textColor.g + ',' + _opt.textColor.b + ',' + opt.o + ')';
			//_context.fillText((more) ? '9+' : opt.n, Math.floor(opt.x + opt.w / 2), Math.floor(opt.y + opt.h - opt.h * 0.15));
			if ((typeof opt.n) === 'number' && opt.n > 999) {
				_context.fillText(((opt.n > 9999) ? 9 : Math.floor(opt.n / 1000)) + 'k+', Math.floor(opt.x + opt.w / 2), Math.floor(opt.y + opt.h - opt.h * 0.2));
			} else {
				_context.fillText(opt.n, Math.floor(opt.x + opt.w / 2), Math.floor(opt.y + opt.h - opt.h * 0.15));
			}
			_context.closePath();
		};

		/**
		 * Set badge
		 */
		var badge = function (number, opts) {
			opts = ((typeof opts) === 'string' ? {
				animation: opts
			} : opts) || {};
			_readyCb = function () {
				try {
					if (typeof (number) === 'number' ? (number > 0) : (number !== '')) {
						var q = {
							type: 'badge',
							options: {
								n: number
							}
						};
						if ('animation' in opts && animation.types['' + opts.animation]) {
							q.options.animation = '' + opts.animation;
						}
						if ('type' in opts && type['' + opts.type]) {
							q.options.type = '' + opts.type;
						}
						['bgColor', 'textColor'].forEach(function (o) {
							if (o in opts) {
								q.options[o] = hexToRgb(opts[o]);
							}
						});
						['fontStyle', 'fontFamily'].forEach(function (o) {
							if (o in opts) {
								q.options[o] = opts[o];
							}
						});
						_queue.push(q);
						if (_queue.length > 100) {
							throw new Error('Too many badges requests in queue.');
						}
						icon.start();
					} else {
						icon.reset();
					}
				} catch (e) {
					throw new Error('Error setting badge. Message: ' + e.message);
				}
			};
			if (_ready) {
				_readyCb();
			}
		};

		var setOpt = function (key, value) {
			var opts = key;
			if (!(value == null && Object.prototype.toString.call(key) == '[object Object]')) {
				opts = {};
				opts[key] = value;
			}

			var keys = Object.keys(opts);
			for (var i = 0; i < keys.length; i++) {
				if (keys[i] == 'bgColor' || keys[i] == 'textColor') {
					_opt[keys[i]] = hexToRgb(opts[keys[i]]);
				} else {
					_opt[keys[i]] = opts[keys[i]];
				}
			}

			_queue.push(_lastBadge);
			icon.start();
		};

		var link = {};
		/**
		 * Get icons from HEAD tag or create a new <link> element
		 */
		link.getIcons = function () {
			var elms = [];
			//get link element
			var getLinks = function () {
				var icons = [];
				var links = _doc.getElementsByTagName('head')[0].getElementsByTagName('link');
				for (var i = 0; i < links.length; i++) {
					if ((/(^|\s)icon(\s|$)/i).test(links[i].getAttribute('rel'))) {
						icons.push(links[i]);
					}
				}
				return icons;
			};
			if (_opt.element) {
				elms = [_opt.element];
			} else if (_opt.elementId) {
				//if img element identified by elementId
				elms = [_doc.getElementById(_opt.elementId)];
				elms[0].setAttribute('href', elms[0].getAttribute('src'));
			} else {
				//if link element
				elms = getLinks();
				if (elms.length === 0) {
					elms = [_doc.createElement('link')];
					elms[0].setAttribute('rel', 'icon');
					_doc.getElementsByTagName('head')[0].appendChild(elms[0]);
				}
			}
			elms.forEach(function(item) {
				item.setAttribute('type', 'image/png');
			});
			return elms;
		};
		link.setIcon = function (canvas) {
			var url = canvas.toDataURL('image/png');
			link.setIconSrc(url);
		};
		link.setIconSrc = function (url) {
			if (_opt.dataUrl) {
				//if using custom exporter
				_opt.dataUrl(url);
			}
			if (_opt.element) {
				_opt.element.setAttribute('href', url);
				_opt.element.setAttribute('src', url);
			} else if (_opt.elementId) {
				//if is attached to element (image)
				var elm = _doc.getElementById(_opt.elementId);
				elm.setAttribute('href', url);
				elm.setAttribute('src', url);
			} else {
				//if is attached to fav icon
				if (_browser.ff || _browser.opera) {
					//for FF we need to "recreate" element, atach to dom and remove old <link>
					//var originalType = _orig.getAttribute('rel');
					var old = _orig[_orig.length - 1];
					var newIcon = _doc.createElement('link');
					_orig = [newIcon];
					//_orig.setAttribute('rel', originalType);
					if (_browser.opera) {
						newIcon.setAttribute('rel', 'icon');
					}
					newIcon.setAttribute('rel', 'icon');
					newIcon.setAttribute('type', 'image/png');
					_doc.getElementsByTagName('head')[0].appendChild(newIcon);
					newIcon.setAttribute('href', url);
					if (old.parentNode) {
						old.parentNode.removeChild(old);
					}
				} else {
					_orig.forEach(function(icon) {
						icon.setAttribute('href', url);
					});
				}
			}
		};

		//http://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb#answer-5624139
		//HEX to RGB convertor
		function hexToRgb(hex) {
			var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
			hex = hex.replace(shorthandRegex, function (m, r, g, b) {
				return r + r + g + g + b + b;
			});
			var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
			return result ? {
				r: parseInt(result[1], 16),
				g: parseInt(result[2], 16),
				b: parseInt(result[3], 16)
			} : false;
		}

		/**
		 * Merge options
		 */
		function merge(def, opt) {
			var mergedOpt = {};
			var attrname;
			for (attrname in def) {
				mergedOpt[attrname] = def[attrname];
			}
			for (attrname in opt) {
				mergedOpt[attrname] = opt[attrname];
			}
			return mergedOpt;
		}

		/**
		 * Cross-browser page visibility shim
		 * http://stackoverflow.com/questions/12536562/detect-whether-a-window-is-visible
		 */
		function isPageHidden() {
			return _doc.hidden || _doc.msHidden || _doc.webkitHidden || _doc.mozHidden;
		}

		/**
		 * @namespace animation
		 */
		var animation = {};
		/**
		 * Animation "frame" duration
		 */
		animation.duration = 40;
		/**
		 * Animation types (none,fade,pop,slide)
		 */
		animation.types = {};
		animation.types.fade = [{
			x: 0.4,
			y: 0.4,
			w: 0.6,
			h: 0.6,
			o: 0.0
		}, {
				x: 0.4,
				y: 0.4,
				w: 0.6,
				h: 0.6,
				o: 0.1
			}, {
				x: 0.4,
				y: 0.4,
				w: 0.6,
				h: 0.6,
				o: 0.2
			}, {
				x: 0.4,
				y: 0.4,
				w: 0.6,
				h: 0.6,
				o: 0.3
			}, {
				x: 0.4,
				y: 0.4,
				w: 0.6,
				h: 0.6,
				o: 0.4
			}, {
				x: 0.4,
				y: 0.4,
				w: 0.6,
				h: 0.6,
				o: 0.5
			}, {
				x: 0.4,
				y: 0.4,
				w: 0.6,
				h: 0.6,
				o: 0.6
			}, {
				x: 0.4,
				y: 0.4,
				w: 0.6,
				h: 0.6,
				o: 0.7
			}, {
				x: 0.4,
				y: 0.4,
				w: 0.6,
				h: 0.6,
				o: 0.8
			}, {
				x: 0.4,
				y: 0.4,
				w: 0.6,
				h: 0.6,
				o: 0.9
			}, {
				x: 0.4,
				y: 0.4,
				w: 0.6,
				h: 0.6,
				o: 1.0
			}];
		animation.types.none = [{
			x: 0.4,
			y: 0.4,
			w: 0.6,
			h: 0.6,
			o: 1
		}];
		animation.types.pop = [{
			x: 1,
			y: 1,
			w: 0,
			h: 0,
			o: 1
		}, {
				x: 0.9,
				y: 0.9,
				w: 0.1,
				h: 0.1,
				o: 1
			}, {
				x: 0.8,
				y: 0.8,
				w: 0.2,
				h: 0.2,
				o: 1
			}, {
				x: 0.7,
				y: 0.7,
				w: 0.3,
				h: 0.3,
				o: 1
			}, {
				x: 0.6,
				y: 0.6,
				w: 0.4,
				h: 0.4,
				o: 1
			}, {
				x: 0.5,
				y: 0.5,
				w: 0.5,
				h: 0.5,
				o: 1
			}, {
				x: 0.4,
				y: 0.4,
				w: 0.6,
				h: 0.6,
				o: 1
			}];
		animation.types.popFade = [{
			x: 0.75,
			y: 0.75,
			w: 0,
			h: 0,
			o: 0
		}, {
				x: 0.65,
				y: 0.65,
				w: 0.1,
				h: 0.1,
				o: 0.2
			}, {
				x: 0.6,
				y: 0.6,
				w: 0.2,
				h: 0.2,
				o: 0.4
			}, {
				x: 0.55,
				y: 0.55,
				w: 0.3,
				h: 0.3,
				o: 0.6
			}, {
				x: 0.50,
				y: 0.50,
				w: 0.4,
				h: 0.4,
				o: 0.8
			}, {
				x: 0.45,
				y: 0.45,
				w: 0.5,
				h: 0.5,
				o: 0.9
			}, {
				x: 0.4,
				y: 0.4,
				w: 0.6,
				h: 0.6,
				o: 1
			}];
		animation.types.slide = [{
			x: 0.4,
			y: 1,
			w: 0.6,
			h: 0.6,
			o: 1
		}, {
				x: 0.4,
				y: 0.9,
				w: 0.6,
				h: 0.6,
				o: 1
			}, {
				x: 0.4,
				y: 0.9,
				w: 0.6,
				h: 0.6,
				o: 1
			}, {
				x: 0.4,
				y: 0.8,
				w: 0.6,
				h: 0.6,
				o: 1
			}, {
				x: 0.4,
				y: 0.7,
				w: 0.6,
				h: 0.6,
				o: 1
			}, {
				x: 0.4,
				y: 0.6,
				w: 0.6,
				h: 0.6,
				o: 1
			}, {
				x: 0.4,
				y: 0.5,
				w: 0.6,
				h: 0.6,
				o: 1
			}, {
				x: 0.4,
				y: 0.4,
				w: 0.6,
				h: 0.6,
				o: 1
			}];
		/**
		 * Run animation
		 * @param {Object} opt Animation options
		 * @param {Object} cb Callabak after all steps are done
		 * @param {Object} revert Reverse order? true|false
		 * @param {Object} step Optional step number (frame bumber)
		 */
		animation.run = function (opt, cb, revert, step) {
			var animationType = animation.types[isPageHidden() ? 'none' : _opt.animation];
			if (revert === true) {
				step = (typeof step !== 'undefined') ? step : animationType.length - 1;
			} else {
				step = (typeof step !== 'undefined') ? step : 0;
			}
			cb = (cb) ? cb : function () {
			};
			if ((step < animationType.length) && (step >= 0)) {
				type[_opt.type](merge(opt, animationType[step]));
				_animTimeout = setTimeout(function () {
					if (revert) {
						step = step - 1;
					} else {
						step = step + 1;
					}
					animation.run(opt, cb, revert, step);
				}, animation.duration);

				link.setIcon(_canvas);
			} else {
				cb();
				return;
			}
		};
		//auto init
		init();
		return {
			badge: badge,
			setOpt: setOpt,
			reset: icon.reset,
			browser: {
				supported: _browser.supported
			}
		};
	});

	// AMD / RequireJS
	if (typeof define !== 'undefined' && define.amd) {
		define([], function () {
			return Favico;
		});
	}
	// CommonJS
	else if (typeof module !== 'undefined' && module.exports) {
		module.exports = Favico;
	}
	// included directly via <script> tag
	else {
		this.Favico = Favico;
	}

})();

},{}],2:[function(require,module,exports){
// import * as hm from '..modules/hm.js'
var hm = require('./modules/hm.js')

function init() {
    hm.run();
}

window.onload = () => init()
},{"./modules/hm.js":3}],3:[function(require,module,exports){
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
},{"favico.js-slevomat":1}]},{},[2])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvZmF2aWNvLmpzLXNsZXZvbWF0L2Zhdmljby5qcyIsIl9zdHJlYW1fMC5qcyIsIm1vZHVsZXMvaG0uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2p3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCIvKipcbiAqIEBsaWNlbnNlIE1JVCBvciBHUEwtMi4wXG4gKiBAZmlsZU92ZXJ2aWV3IEZhdmljbyBhbmltYXRpb25zXG4gKiBAYXV0aG9yIE1pcm9zbGF2IE1hZ2RhLCBodHRwOi8vYmxvZy5lamNpLm5ldFxuICogQHNvdXJjZTogaHR0cHM6Ly9naXRodWIuY29tL2VqY2kvZmF2aWNvLmpzXG4gKiBAdmVyc2lvbiAwLjMuMTBcbiAqL1xuXG4vKipcbiAqIENyZWF0ZSBuZXcgZmF2aWNvIGluc3RhbmNlXG4gKiBAcGFyYW0ge09iamVjdH0gT3B0aW9uc1xuICogQHJldHVybiB7T2JqZWN0fSBGYXZpY28gb2JqZWN0XG4gKiBAZXhhbXBsZVxuICogdmFyIGZhdmljbyA9IG5ldyBGYXZpY28oe1xuICogICAgYmdDb2xvciA6ICcjZDAwJyxcbiAqICAgIHRleHRDb2xvciA6ICcjZmZmJyxcbiAqICAgIGZvbnRGYW1pbHkgOiAnc2Fucy1zZXJpZicsXG4gKiAgICBmb250U3R5bGUgOiAnYm9sZCcsXG4gKiAgICB0eXBlIDogJ2NpcmNsZScsXG4gKiAgICBwb3NpdGlvbiA6ICdkb3duJyxcbiAqICAgIGFuaW1hdGlvbiA6ICdzbGlkZScsXG4gKiAgICBlbGVtZW50SWQ6IGZhbHNlLFxuICogICAgZWxlbWVudDogbnVsbCxcbiAqICAgIGRhdGFVcmw6IGZ1bmN0aW9uKHVybCl7fSxcbiAqICAgIHdpbjogd2luZG93XG4gKiB9KTtcbiAqL1xuKGZ1bmN0aW9uICgpIHtcblxuXHR2YXIgRmF2aWNvID0gKGZ1bmN0aW9uIChvcHQpIHtcblx0XHQndXNlIHN0cmljdCc7XG5cdFx0b3B0ID0gKG9wdCkgPyBvcHQgOiB7fTtcblx0XHR2YXIgX2RlZiA9IHtcblx0XHRcdGJnQ29sb3I6ICcjZDAwJyxcblx0XHRcdHRleHRDb2xvcjogJyNmZmYnLFxuXHRcdFx0Zm9udEZhbWlseTogJ3NhbnMtc2VyaWYnLCAvL0FyaWFsLFZlcmRhbmEsVGltZXMgTmV3IFJvbWFuLHNlcmlmLHNhbnMtc2VyaWYsLi4uXG5cdFx0XHRmb250U3R5bGU6ICdib2xkJywgLy9ub3JtYWwsaXRhbGljLG9ibGlxdWUsYm9sZCxib2xkZXIsbGlnaHRlciwxMDAsMjAwLDMwMCw0MDAsNTAwLDYwMCw3MDAsODAwLDkwMFxuXHRcdFx0dHlwZTogJ2NpcmNsZScsXG5cdFx0XHRwb3NpdGlvbjogJ2Rvd24nLCAvLyBkb3duLCB1cCwgbGVmdCwgbGVmdHVwICh1cGxlZnQpXG5cdFx0XHRhbmltYXRpb246ICdzbGlkZScsXG5cdFx0XHRlbGVtZW50SWQ6IGZhbHNlLFxuXHRcdFx0ZWxlbWVudDogbnVsbCxcblx0XHRcdGRhdGFVcmw6IGZhbHNlLFxuXHRcdFx0d2luOiB3aW5kb3dcblx0XHR9O1xuXHRcdHZhciBfb3B0LCBfb3JpZywgX2gsIF93LCBfY2FudmFzLCBfY29udGV4dCwgX2ltZywgX3JlYWR5LCBfbGFzdEJhZGdlLCBfcnVubmluZywgX3JlYWR5Q2IsIF9zdG9wLCBfYnJvd3NlciwgX2FuaW1UaW1lb3V0LCBfZHJhd1RpbWVvdXQsIF9kb2M7XG5cblx0XHRfYnJvd3NlciA9IHt9O1xuXHRcdF9icm93c2VyLmZmID0gdHlwZW9mIEluc3RhbGxUcmlnZ2VyICE9ICd1bmRlZmluZWQnO1xuXHRcdF9icm93c2VyLmNocm9tZSA9ICEhd2luZG93LmNocm9tZTtcblx0XHRfYnJvd3Nlci5vcGVyYSA9ICEhd2luZG93Lm9wZXJhIHx8IG5hdmlnYXRvci51c2VyQWdlbnQuaW5kZXhPZignT3BlcmEnKSA+PSAwO1xuXHRcdF9icm93c2VyLmllID0gLypAY2Nfb24hQCovZmFsc2U7XG5cdFx0X2Jyb3dzZXIuc2FmYXJpID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHdpbmRvdy5IVE1MRWxlbWVudCkuaW5kZXhPZignQ29uc3RydWN0b3InKSA+IDA7XG5cdFx0X2Jyb3dzZXIuc3VwcG9ydGVkID0gKF9icm93c2VyLmNocm9tZSB8fCBfYnJvd3Nlci5mZiB8fCBfYnJvd3Nlci5vcGVyYSk7XG5cblx0XHR2YXIgX3F1ZXVlID0gW107XG5cdFx0X3JlYWR5Q2IgPSBmdW5jdGlvbiAoKSB7XG5cdFx0fTtcblx0XHRfcmVhZHkgPSBfc3RvcCA9IGZhbHNlO1xuXHRcdC8qKlxuXHRcdCAqIEluaXRpYWxpemUgZmF2aWNvXG5cdFx0ICovXG5cdFx0dmFyIGluaXQgPSBmdW5jdGlvbiAoKSB7XG5cdFx0XHQvL21lcmdlIGluaXRpYWwgb3B0aW9uc1xuXHRcdFx0X29wdCA9IG1lcmdlKF9kZWYsIG9wdCk7XG5cdFx0XHRfb3B0LmJnQ29sb3IgPSBoZXhUb1JnYihfb3B0LmJnQ29sb3IpO1xuXHRcdFx0X29wdC50ZXh0Q29sb3IgPSBoZXhUb1JnYihfb3B0LnRleHRDb2xvcik7XG5cdFx0XHRfb3B0LnBvc2l0aW9uID0gX29wdC5wb3NpdGlvbi50b0xvd2VyQ2FzZSgpO1xuXHRcdFx0X29wdC5hbmltYXRpb24gPSAoYW5pbWF0aW9uLnR5cGVzWycnICsgX29wdC5hbmltYXRpb25dKSA/IF9vcHQuYW5pbWF0aW9uIDogX2RlZi5hbmltYXRpb247XG5cblx0XHRcdF9kb2MgPSBfb3B0Lndpbi5kb2N1bWVudDtcblxuXHRcdFx0dmFyIGlzVXAgPSBfb3B0LnBvc2l0aW9uLmluZGV4T2YoJ3VwJykgPiAtMTtcblx0XHRcdHZhciBpc0xlZnQgPSBfb3B0LnBvc2l0aW9uLmluZGV4T2YoJ2xlZnQnKSA+IC0xO1xuXG5cdFx0XHQvL3RyYW5zZm9ybSB0aGUgYW5pbWF0aW9uc1xuXHRcdFx0aWYgKGlzVXAgfHwgaXNMZWZ0KSB7XG5cdFx0XHRcdGZvciAodmFyIGEgaW4gYW5pbWF0aW9uLnR5cGVzKSB7XG5cdFx0XHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBhbmltYXRpb24udHlwZXNbYV0ubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0XHRcdHZhciBzdGVwID0gYW5pbWF0aW9uLnR5cGVzW2FdW2ldO1xuXG5cdFx0XHRcdFx0XHRpZiAoaXNVcCkge1xuXHRcdFx0XHRcdFx0XHRpZiAoc3RlcC55IDwgMC42KSB7XG5cdFx0XHRcdFx0XHRcdFx0c3RlcC55ID0gc3RlcC55IC0gMC40O1xuXHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRcdHN0ZXAueSA9IHN0ZXAueSAtIDIgKiBzdGVwLnkgKyAoMSAtIHN0ZXAudyk7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0aWYgKGlzTGVmdCkge1xuXHRcdFx0XHRcdFx0XHRpZiAoc3RlcC54IDwgMC42KSB7XG5cdFx0XHRcdFx0XHRcdFx0c3RlcC54ID0gc3RlcC54IC0gMC40O1xuXHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRcdHN0ZXAueCA9IHN0ZXAueCAtIDIgKiBzdGVwLnggKyAoMSAtIHN0ZXAuaCk7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0YW5pbWF0aW9uLnR5cGVzW2FdW2ldID0gc3RlcDtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdF9vcHQudHlwZSA9ICh0eXBlWycnICsgX29wdC50eXBlXSkgPyBfb3B0LnR5cGUgOiBfZGVmLnR5cGU7XG5cblx0XHRcdF9vcmlnID0gbGluay4gZ2V0SWNvbnMoKTtcblx0XHRcdC8vY3JlYXRlIHRlbXAgY2FudmFzXG5cdFx0XHRfY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG5cdFx0XHQvL2NyZWF0ZSB0ZW1wIGltYWdlXG5cdFx0XHRfaW1nID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW1nJyk7XG5cdFx0XHR2YXIgbGFzdEljb24gPSBfb3JpZ1tfb3JpZy5sZW5ndGggLSAxXTtcblx0XHRcdGlmIChsYXN0SWNvbi5oYXNBdHRyaWJ1dGUoJ2hyZWYnKSkge1xuXHRcdFx0XHRfaW1nLnNldEF0dHJpYnV0ZSgnY3Jvc3NPcmlnaW4nLCAnYW5vbnltb3VzJyk7XG5cdFx0XHRcdC8vZ2V0IHdpZHRoL2hlaWdodFxuXHRcdFx0XHRfaW1nLm9ubG9hZCA9IGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRfaCA9IChfaW1nLmhlaWdodCA+IDApID8gX2ltZy5oZWlnaHQgOiAzMjtcblx0XHRcdFx0XHRfdyA9IChfaW1nLndpZHRoID4gMCkgPyBfaW1nLndpZHRoIDogMzI7XG5cdFx0XHRcdFx0X2NhbnZhcy5oZWlnaHQgPSBfaDtcblx0XHRcdFx0XHRfY2FudmFzLndpZHRoID0gX3c7XG5cdFx0XHRcdFx0X2NvbnRleHQgPSBfY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG5cdFx0XHRcdFx0aWNvbi5yZWFkeSgpO1xuXHRcdFx0XHR9O1xuXHRcdFx0XHRfaW1nLnNldEF0dHJpYnV0ZSgnc3JjJywgbGFzdEljb24uZ2V0QXR0cmlidXRlKCdocmVmJykpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0X2ggPSAzMjtcblx0XHRcdFx0X3cgPSAzMjtcblx0XHRcdFx0X2ltZy5oZWlnaHQgPSBfaDtcblx0XHRcdFx0X2ltZy53aWR0aCA9IF93O1xuXHRcdFx0XHRfY2FudmFzLmhlaWdodCA9IF9oO1xuXHRcdFx0XHRfY2FudmFzLndpZHRoID0gX3c7XG5cdFx0XHRcdF9jb250ZXh0ID0gX2NhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuXHRcdFx0XHRpY29uLnJlYWR5KCk7XG5cdFx0XHR9XG5cblx0XHR9O1xuXHRcdC8qKlxuXHRcdCAqIEljb24gbmFtZXNwYWNlXG5cdFx0ICovXG5cdFx0dmFyIGljb24gPSB7fTtcblx0XHQvKipcblx0XHQgKiBJY29uIGlzIHJlYWR5IChyZXNldCBpY29uKSBhbmQgc3RhcnQgYW5pbWF0aW9uIChpZiB0aGVyIGlzIGFueSlcblx0XHQgKi9cblx0XHRpY29uLnJlYWR5ID0gZnVuY3Rpb24gKCkge1xuXHRcdFx0X3JlYWR5ID0gdHJ1ZTtcblx0XHRcdGljb24ucmVzZXQoKTtcblx0XHRcdF9yZWFkeUNiKCk7XG5cdFx0fTtcblx0XHQvKipcblx0XHQgKiBSZXNldCBpY29uIHRvIGRlZmF1bHQgc3RhdGVcblx0XHQgKi9cblx0XHRpY29uLnJlc2V0ID0gZnVuY3Rpb24gKCkge1xuXHRcdFx0Ly9yZXNldFxuXHRcdFx0aWYgKCFfcmVhZHkpIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdFx0X3F1ZXVlID0gW107XG5cdFx0XHRfbGFzdEJhZGdlID0gZmFsc2U7XG5cdFx0XHRfcnVubmluZyA9IGZhbHNlO1xuXHRcdFx0X2NvbnRleHQuY2xlYXJSZWN0KDAsIDAsIF93LCBfaCk7XG5cdFx0XHRfY29udGV4dC5kcmF3SW1hZ2UoX2ltZywgMCwgMCwgX3csIF9oKTtcblx0XHRcdC8vX3N0b3A9dHJ1ZTtcblx0XHRcdGxpbmsuc2V0SWNvbihfY2FudmFzKTtcblx0XHRcdC8vd2ViY2FtKCdzdG9wJyk7XG5cdFx0XHQvL3ZpZGVvKCdzdG9wJyk7XG5cdFx0XHR3aW5kb3cuY2xlYXJUaW1lb3V0KF9hbmltVGltZW91dCk7XG5cdFx0XHR3aW5kb3cuY2xlYXJUaW1lb3V0KF9kcmF3VGltZW91dCk7XG5cdFx0fTtcblx0XHQvKipcblx0XHQgKiBTdGFydCBhbmltYXRpb25cblx0XHQgKi9cblx0XHRpY29uLnN0YXJ0ID0gZnVuY3Rpb24gKCkge1xuXHRcdFx0aWYgKCFfcmVhZHkgfHwgX3J1bm5pbmcpIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdFx0dmFyIGZpbmlzaGVkID0gZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRfbGFzdEJhZGdlID0gX3F1ZXVlWzBdO1xuXHRcdFx0XHRfcnVubmluZyA9IGZhbHNlO1xuXHRcdFx0XHRpZiAoX3F1ZXVlLmxlbmd0aCA+IDApIHtcblx0XHRcdFx0XHRfcXVldWUuc2hpZnQoKTtcblx0XHRcdFx0XHRpY29uLnN0YXJ0KCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cblx0XHRcdFx0fVxuXHRcdFx0fTtcblx0XHRcdGlmIChfcXVldWUubGVuZ3RoID4gMCkge1xuXHRcdFx0XHRfcnVubmluZyA9IHRydWU7XG5cdFx0XHRcdHZhciBydW4gPSBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0Ly8gYXBwbHkgb3B0aW9ucyBmb3IgdGhpcyBhbmltYXRpb25cblx0XHRcdFx0XHRbJ3R5cGUnLCAnYW5pbWF0aW9uJywgJ2JnQ29sb3InLCAndGV4dENvbG9yJywgJ2ZvbnRGYW1pbHknLCAnZm9udFN0eWxlJ10uZm9yRWFjaChmdW5jdGlvbiAoYSkge1xuXHRcdFx0XHRcdFx0aWYgKGEgaW4gX3F1ZXVlWzBdLm9wdGlvbnMpIHtcblx0XHRcdFx0XHRcdFx0X29wdFthXSA9IF9xdWV1ZVswXS5vcHRpb25zW2FdO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdGFuaW1hdGlvbi5ydW4oX3F1ZXVlWzBdLm9wdGlvbnMsIGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRcdGZpbmlzaGVkKCk7XG5cdFx0XHRcdFx0fSwgZmFsc2UpO1xuXHRcdFx0XHR9O1xuXHRcdFx0XHRpZiAoX2xhc3RCYWRnZSkge1xuXHRcdFx0XHRcdGFuaW1hdGlvbi5ydW4oX2xhc3RCYWRnZS5vcHRpb25zLCBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0XHRydW4oKTtcblx0XHRcdFx0XHR9LCB0cnVlKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRydW4oKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH07XG5cblx0XHQvKipcblx0XHQgKiBCYWRnZSB0eXBlc1xuXHRcdCAqL1xuXHRcdHZhciB0eXBlID0ge307XG5cdFx0dmFyIG9wdGlvbnMgPSBmdW5jdGlvbiAob3B0KSB7XG5cdFx0XHRvcHQubiA9ICgodHlwZW9mIG9wdC5uKSA9PT0gJ251bWJlcicpID8gTWF0aC5hYnMob3B0Lm4gfCAwKSA6IG9wdC5uO1xuXHRcdFx0b3B0LnggPSBfdyAqIG9wdC54O1xuXHRcdFx0b3B0LnkgPSBfaCAqIG9wdC55O1xuXHRcdFx0b3B0LncgPSBfdyAqIG9wdC53O1xuXHRcdFx0b3B0LmggPSBfaCAqIG9wdC5oO1xuXHRcdFx0b3B0LmxlbiA9IChcIlwiICsgb3B0Lm4pLmxlbmd0aDtcblx0XHRcdHJldHVybiBvcHQ7XG5cdFx0fTtcblx0XHQvKipcblx0XHQgKiBHZW5lcmF0ZSBjaXJjbGVcblx0XHQgKiBAcGFyYW0ge09iamVjdH0gb3B0IEJhZGdlIG9wdGlvbnNcblx0XHQgKi9cblx0XHR0eXBlLmNpcmNsZSA9IGZ1bmN0aW9uIChvcHQpIHtcblx0XHRcdG9wdCA9IG9wdGlvbnMob3B0KTtcblx0XHRcdHZhciBtb3JlID0gZmFsc2U7XG5cdFx0XHRpZiAob3B0LmxlbiA9PT0gMikge1xuXHRcdFx0XHRvcHQueCA9IG9wdC54IC0gb3B0LncgKiAwLjQ7XG5cdFx0XHRcdG9wdC53ID0gb3B0LncgKiAxLjQ7XG5cdFx0XHRcdG1vcmUgPSB0cnVlO1xuXHRcdFx0fSBlbHNlIGlmIChvcHQubGVuID49IDMpIHtcblx0XHRcdFx0b3B0LnggPSBvcHQueCAtIG9wdC53ICogMC42NTtcblx0XHRcdFx0b3B0LncgPSBvcHQudyAqIDEuNjU7XG5cdFx0XHRcdG1vcmUgPSB0cnVlO1xuXHRcdFx0fVxuXHRcdFx0X2NvbnRleHQuY2xlYXJSZWN0KDAsIDAsIF93LCBfaCk7XG5cdFx0XHRfY29udGV4dC5kcmF3SW1hZ2UoX2ltZywgMCwgMCwgX3csIF9oKTtcblx0XHRcdF9jb250ZXh0LmJlZ2luUGF0aCgpO1xuXHRcdFx0X2NvbnRleHQuZm9udCA9IF9vcHQuZm9udFN0eWxlICsgXCIgXCIgKyBNYXRoLmZsb29yKG9wdC5oICogKG9wdC5uID4gOTkgPyAwLjg1IDogMSkpICsgXCJweCBcIiArIF9vcHQuZm9udEZhbWlseTtcblx0XHRcdF9jb250ZXh0LnRleHRBbGlnbiA9ICdjZW50ZXInO1xuXHRcdFx0aWYgKG1vcmUpIHtcblx0XHRcdFx0X2NvbnRleHQubW92ZVRvKG9wdC54ICsgb3B0LncgLyAyLCBvcHQueSk7XG5cdFx0XHRcdF9jb250ZXh0LmxpbmVUbyhvcHQueCArIG9wdC53IC0gb3B0LmggLyAyLCBvcHQueSk7XG5cdFx0XHRcdF9jb250ZXh0LnF1YWRyYXRpY0N1cnZlVG8ob3B0LnggKyBvcHQudywgb3B0LnksIG9wdC54ICsgb3B0LncsIG9wdC55ICsgb3B0LmggLyAyKTtcblx0XHRcdFx0X2NvbnRleHQubGluZVRvKG9wdC54ICsgb3B0LncsIG9wdC55ICsgb3B0LmggLSBvcHQuaCAvIDIpO1xuXHRcdFx0XHRfY29udGV4dC5xdWFkcmF0aWNDdXJ2ZVRvKG9wdC54ICsgb3B0LncsIG9wdC55ICsgb3B0LmgsIG9wdC54ICsgb3B0LncgLSBvcHQuaCAvIDIsIG9wdC55ICsgb3B0LmgpO1xuXHRcdFx0XHRfY29udGV4dC5saW5lVG8ob3B0LnggKyBvcHQuaCAvIDIsIG9wdC55ICsgb3B0LmgpO1xuXHRcdFx0XHRfY29udGV4dC5xdWFkcmF0aWNDdXJ2ZVRvKG9wdC54LCBvcHQueSArIG9wdC5oLCBvcHQueCwgb3B0LnkgKyBvcHQuaCAtIG9wdC5oIC8gMik7XG5cdFx0XHRcdF9jb250ZXh0LmxpbmVUbyhvcHQueCwgb3B0LnkgKyBvcHQuaCAvIDIpO1xuXHRcdFx0XHRfY29udGV4dC5xdWFkcmF0aWNDdXJ2ZVRvKG9wdC54LCBvcHQueSwgb3B0LnggKyBvcHQuaCAvIDIsIG9wdC55KTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdF9jb250ZXh0LmFyYyhvcHQueCArIG9wdC53IC8gMiwgb3B0LnkgKyBvcHQuaCAvIDIsIG9wdC5oIC8gMiwgMCwgMiAqIE1hdGguUEkpO1xuXHRcdFx0fVxuXHRcdFx0X2NvbnRleHQuZmlsbFN0eWxlID0gJ3JnYmEoJyArIF9vcHQuYmdDb2xvci5yICsgJywnICsgX29wdC5iZ0NvbG9yLmcgKyAnLCcgKyBfb3B0LmJnQ29sb3IuYiArICcsJyArIG9wdC5vICsgJyknO1xuXHRcdFx0X2NvbnRleHQuZmlsbCgpO1xuXHRcdFx0X2NvbnRleHQuY2xvc2VQYXRoKCk7XG5cdFx0XHRfY29udGV4dC5iZWdpblBhdGgoKTtcblx0XHRcdF9jb250ZXh0LnN0cm9rZSgpO1xuXHRcdFx0X2NvbnRleHQuZmlsbFN0eWxlID0gJ3JnYmEoJyArIF9vcHQudGV4dENvbG9yLnIgKyAnLCcgKyBfb3B0LnRleHRDb2xvci5nICsgJywnICsgX29wdC50ZXh0Q29sb3IuYiArICcsJyArIG9wdC5vICsgJyknO1xuXHRcdFx0Ly9fY29udGV4dC5maWxsVGV4dCgobW9yZSkgPyAnOSsnIDogb3B0Lm4sIE1hdGguZmxvb3Iob3B0LnggKyBvcHQudyAvIDIpLCBNYXRoLmZsb29yKG9wdC55ICsgb3B0LmggLSBvcHQuaCAqIDAuMTUpKTtcblx0XHRcdGlmICgodHlwZW9mIG9wdC5uKSA9PT0gJ251bWJlcicgJiYgb3B0Lm4gPiA5OTkpIHtcblx0XHRcdFx0X2NvbnRleHQuZmlsbFRleHQoKChvcHQubiA+IDk5OTkpID8gOSA6IE1hdGguZmxvb3Iob3B0Lm4gLyAxMDAwKSkgKyAnaysnLCBNYXRoLmZsb29yKG9wdC54ICsgb3B0LncgLyAyKSwgTWF0aC5mbG9vcihvcHQueSArIG9wdC5oIC0gb3B0LmggKiAwLjIpKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdF9jb250ZXh0LmZpbGxUZXh0KG9wdC5uLCBNYXRoLmZsb29yKG9wdC54ICsgb3B0LncgLyAyKSwgTWF0aC5mbG9vcihvcHQueSArIG9wdC5oIC0gb3B0LmggKiAwLjE1KSk7XG5cdFx0XHR9XG5cdFx0XHRfY29udGV4dC5jbG9zZVBhdGgoKTtcblx0XHR9O1xuXHRcdC8qKlxuXHRcdCAqIEdlbmVyYXRlIHJlY3RhbmdsZVxuXHRcdCAqIEBwYXJhbSB7T2JqZWN0fSBvcHQgQmFkZ2Ugb3B0aW9uc1xuXHRcdCAqL1xuXHRcdHR5cGUucmVjdGFuZ2xlID0gZnVuY3Rpb24gKG9wdCkge1xuXHRcdFx0b3B0ID0gb3B0aW9ucyhvcHQpO1xuXHRcdFx0dmFyIG1vcmUgPSBmYWxzZTtcblx0XHRcdGlmIChvcHQubGVuID09PSAyKSB7XG5cdFx0XHRcdG9wdC54ID0gb3B0LnggLSBvcHQudyAqIDAuNDtcblx0XHRcdFx0b3B0LncgPSBvcHQudyAqIDEuNDtcblx0XHRcdFx0bW9yZSA9IHRydWU7XG5cdFx0XHR9IGVsc2UgaWYgKG9wdC5sZW4gPj0gMykge1xuXHRcdFx0XHRvcHQueCA9IG9wdC54IC0gb3B0LncgKiAwLjY1O1xuXHRcdFx0XHRvcHQudyA9IG9wdC53ICogMS42NTtcblx0XHRcdFx0bW9yZSA9IHRydWU7XG5cdFx0XHR9XG5cdFx0XHRfY29udGV4dC5jbGVhclJlY3QoMCwgMCwgX3csIF9oKTtcblx0XHRcdF9jb250ZXh0LmRyYXdJbWFnZShfaW1nLCAwLCAwLCBfdywgX2gpO1xuXHRcdFx0X2NvbnRleHQuYmVnaW5QYXRoKCk7XG5cdFx0XHRfY29udGV4dC5mb250ID0gX29wdC5mb250U3R5bGUgKyBcIiBcIiArIE1hdGguZmxvb3Iob3B0LmggKiAob3B0Lm4gPiA5OSA/IDAuOSA6IDEpKSArIFwicHggXCIgKyBfb3B0LmZvbnRGYW1pbHk7XG5cdFx0XHRfY29udGV4dC50ZXh0QWxpZ24gPSAnY2VudGVyJztcblx0XHRcdF9jb250ZXh0LmZpbGxTdHlsZSA9ICdyZ2JhKCcgKyBfb3B0LmJnQ29sb3IuciArICcsJyArIF9vcHQuYmdDb2xvci5nICsgJywnICsgX29wdC5iZ0NvbG9yLmIgKyAnLCcgKyBvcHQubyArICcpJztcblx0XHRcdF9jb250ZXh0LmZpbGxSZWN0KG9wdC54LCBvcHQueSwgb3B0LncsIG9wdC5oKTtcblx0XHRcdF9jb250ZXh0LmZpbGxTdHlsZSA9ICdyZ2JhKCcgKyBfb3B0LnRleHRDb2xvci5yICsgJywnICsgX29wdC50ZXh0Q29sb3IuZyArICcsJyArIF9vcHQudGV4dENvbG9yLmIgKyAnLCcgKyBvcHQubyArICcpJztcblx0XHRcdC8vX2NvbnRleHQuZmlsbFRleHQoKG1vcmUpID8gJzkrJyA6IG9wdC5uLCBNYXRoLmZsb29yKG9wdC54ICsgb3B0LncgLyAyKSwgTWF0aC5mbG9vcihvcHQueSArIG9wdC5oIC0gb3B0LmggKiAwLjE1KSk7XG5cdFx0XHRpZiAoKHR5cGVvZiBvcHQubikgPT09ICdudW1iZXInICYmIG9wdC5uID4gOTk5KSB7XG5cdFx0XHRcdF9jb250ZXh0LmZpbGxUZXh0KCgob3B0Lm4gPiA5OTk5KSA/IDkgOiBNYXRoLmZsb29yKG9wdC5uIC8gMTAwMCkpICsgJ2srJywgTWF0aC5mbG9vcihvcHQueCArIG9wdC53IC8gMiksIE1hdGguZmxvb3Iob3B0LnkgKyBvcHQuaCAtIG9wdC5oICogMC4yKSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRfY29udGV4dC5maWxsVGV4dChvcHQubiwgTWF0aC5mbG9vcihvcHQueCArIG9wdC53IC8gMiksIE1hdGguZmxvb3Iob3B0LnkgKyBvcHQuaCAtIG9wdC5oICogMC4xNSkpO1xuXHRcdFx0fVxuXHRcdFx0X2NvbnRleHQuY2xvc2VQYXRoKCk7XG5cdFx0fTtcblxuXHRcdC8qKlxuXHRcdCAqIFNldCBiYWRnZVxuXHRcdCAqL1xuXHRcdHZhciBiYWRnZSA9IGZ1bmN0aW9uIChudW1iZXIsIG9wdHMpIHtcblx0XHRcdG9wdHMgPSAoKHR5cGVvZiBvcHRzKSA9PT0gJ3N0cmluZycgPyB7XG5cdFx0XHRcdGFuaW1hdGlvbjogb3B0c1xuXHRcdFx0fSA6IG9wdHMpIHx8IHt9O1xuXHRcdFx0X3JlYWR5Q2IgPSBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0aWYgKHR5cGVvZiAobnVtYmVyKSA9PT0gJ251bWJlcicgPyAobnVtYmVyID4gMCkgOiAobnVtYmVyICE9PSAnJykpIHtcblx0XHRcdFx0XHRcdHZhciBxID0ge1xuXHRcdFx0XHRcdFx0XHR0eXBlOiAnYmFkZ2UnLFxuXHRcdFx0XHRcdFx0XHRvcHRpb25zOiB7XG5cdFx0XHRcdFx0XHRcdFx0bjogbnVtYmVyXG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XHRpZiAoJ2FuaW1hdGlvbicgaW4gb3B0cyAmJiBhbmltYXRpb24udHlwZXNbJycgKyBvcHRzLmFuaW1hdGlvbl0pIHtcblx0XHRcdFx0XHRcdFx0cS5vcHRpb25zLmFuaW1hdGlvbiA9ICcnICsgb3B0cy5hbmltYXRpb247XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRpZiAoJ3R5cGUnIGluIG9wdHMgJiYgdHlwZVsnJyArIG9wdHMudHlwZV0pIHtcblx0XHRcdFx0XHRcdFx0cS5vcHRpb25zLnR5cGUgPSAnJyArIG9wdHMudHlwZTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFsnYmdDb2xvcicsICd0ZXh0Q29sb3InXS5mb3JFYWNoKGZ1bmN0aW9uIChvKSB7XG5cdFx0XHRcdFx0XHRcdGlmIChvIGluIG9wdHMpIHtcblx0XHRcdFx0XHRcdFx0XHRxLm9wdGlvbnNbb10gPSBoZXhUb1JnYihvcHRzW29dKTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHRbJ2ZvbnRTdHlsZScsICdmb250RmFtaWx5J10uZm9yRWFjaChmdW5jdGlvbiAobykge1xuXHRcdFx0XHRcdFx0XHRpZiAobyBpbiBvcHRzKSB7XG5cdFx0XHRcdFx0XHRcdFx0cS5vcHRpb25zW29dID0gb3B0c1tvXTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHRfcXVldWUucHVzaChxKTtcblx0XHRcdFx0XHRcdGlmIChfcXVldWUubGVuZ3RoID4gMTAwKSB7XG5cdFx0XHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcignVG9vIG1hbnkgYmFkZ2VzIHJlcXVlc3RzIGluIHF1ZXVlLicpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0aWNvbi5zdGFydCgpO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRpY29uLnJlc2V0KCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9IGNhdGNoIChlKSB7XG5cdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKCdFcnJvciBzZXR0aW5nIGJhZGdlLiBNZXNzYWdlOiAnICsgZS5tZXNzYWdlKTtcblx0XHRcdFx0fVxuXHRcdFx0fTtcblx0XHRcdGlmIChfcmVhZHkpIHtcblx0XHRcdFx0X3JlYWR5Q2IoKTtcblx0XHRcdH1cblx0XHR9O1xuXG5cdFx0dmFyIHNldE9wdCA9IGZ1bmN0aW9uIChrZXksIHZhbHVlKSB7XG5cdFx0XHR2YXIgb3B0cyA9IGtleTtcblx0XHRcdGlmICghKHZhbHVlID09IG51bGwgJiYgT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGtleSkgPT0gJ1tvYmplY3QgT2JqZWN0XScpKSB7XG5cdFx0XHRcdG9wdHMgPSB7fTtcblx0XHRcdFx0b3B0c1trZXldID0gdmFsdWU7XG5cdFx0XHR9XG5cblx0XHRcdHZhciBrZXlzID0gT2JqZWN0LmtleXMob3B0cyk7XG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGtleXMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0aWYgKGtleXNbaV0gPT0gJ2JnQ29sb3InIHx8IGtleXNbaV0gPT0gJ3RleHRDb2xvcicpIHtcblx0XHRcdFx0XHRfb3B0W2tleXNbaV1dID0gaGV4VG9SZ2Iob3B0c1trZXlzW2ldXSk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0X29wdFtrZXlzW2ldXSA9IG9wdHNba2V5c1tpXV07XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0X3F1ZXVlLnB1c2goX2xhc3RCYWRnZSk7XG5cdFx0XHRpY29uLnN0YXJ0KCk7XG5cdFx0fTtcblxuXHRcdHZhciBsaW5rID0ge307XG5cdFx0LyoqXG5cdFx0ICogR2V0IGljb25zIGZyb20gSEVBRCB0YWcgb3IgY3JlYXRlIGEgbmV3IDxsaW5rPiBlbGVtZW50XG5cdFx0ICovXG5cdFx0bGluay5nZXRJY29ucyA9IGZ1bmN0aW9uICgpIHtcblx0XHRcdHZhciBlbG1zID0gW107XG5cdFx0XHQvL2dldCBsaW5rIGVsZW1lbnRcblx0XHRcdHZhciBnZXRMaW5rcyA9IGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0dmFyIGljb25zID0gW107XG5cdFx0XHRcdHZhciBsaW5rcyA9IF9kb2MuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2hlYWQnKVswXS5nZXRFbGVtZW50c0J5VGFnTmFtZSgnbGluaycpO1xuXHRcdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGxpbmtzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdFx0aWYgKCgvKF58XFxzKWljb24oXFxzfCQpL2kpLnRlc3QobGlua3NbaV0uZ2V0QXR0cmlidXRlKCdyZWwnKSkpIHtcblx0XHRcdFx0XHRcdGljb25zLnB1c2gobGlua3NbaV0pO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0XHRyZXR1cm4gaWNvbnM7XG5cdFx0XHR9O1xuXHRcdFx0aWYgKF9vcHQuZWxlbWVudCkge1xuXHRcdFx0XHRlbG1zID0gW19vcHQuZWxlbWVudF07XG5cdFx0XHR9IGVsc2UgaWYgKF9vcHQuZWxlbWVudElkKSB7XG5cdFx0XHRcdC8vaWYgaW1nIGVsZW1lbnQgaWRlbnRpZmllZCBieSBlbGVtZW50SWRcblx0XHRcdFx0ZWxtcyA9IFtfZG9jLmdldEVsZW1lbnRCeUlkKF9vcHQuZWxlbWVudElkKV07XG5cdFx0XHRcdGVsbXNbMF0uc2V0QXR0cmlidXRlKCdocmVmJywgZWxtc1swXS5nZXRBdHRyaWJ1dGUoJ3NyYycpKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdC8vaWYgbGluayBlbGVtZW50XG5cdFx0XHRcdGVsbXMgPSBnZXRMaW5rcygpO1xuXHRcdFx0XHRpZiAoZWxtcy5sZW5ndGggPT09IDApIHtcblx0XHRcdFx0XHRlbG1zID0gW19kb2MuY3JlYXRlRWxlbWVudCgnbGluaycpXTtcblx0XHRcdFx0XHRlbG1zWzBdLnNldEF0dHJpYnV0ZSgncmVsJywgJ2ljb24nKTtcblx0XHRcdFx0XHRfZG9jLmdldEVsZW1lbnRzQnlUYWdOYW1lKCdoZWFkJylbMF0uYXBwZW5kQ2hpbGQoZWxtc1swXSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGVsbXMuZm9yRWFjaChmdW5jdGlvbihpdGVtKSB7XG5cdFx0XHRcdGl0ZW0uc2V0QXR0cmlidXRlKCd0eXBlJywgJ2ltYWdlL3BuZycpO1xuXHRcdFx0fSk7XG5cdFx0XHRyZXR1cm4gZWxtcztcblx0XHR9O1xuXHRcdGxpbmsuc2V0SWNvbiA9IGZ1bmN0aW9uIChjYW52YXMpIHtcblx0XHRcdHZhciB1cmwgPSBjYW52YXMudG9EYXRhVVJMKCdpbWFnZS9wbmcnKTtcblx0XHRcdGxpbmsuc2V0SWNvblNyYyh1cmwpO1xuXHRcdH07XG5cdFx0bGluay5zZXRJY29uU3JjID0gZnVuY3Rpb24gKHVybCkge1xuXHRcdFx0aWYgKF9vcHQuZGF0YVVybCkge1xuXHRcdFx0XHQvL2lmIHVzaW5nIGN1c3RvbSBleHBvcnRlclxuXHRcdFx0XHRfb3B0LmRhdGFVcmwodXJsKTtcblx0XHRcdH1cblx0XHRcdGlmIChfb3B0LmVsZW1lbnQpIHtcblx0XHRcdFx0X29wdC5lbGVtZW50LnNldEF0dHJpYnV0ZSgnaHJlZicsIHVybCk7XG5cdFx0XHRcdF9vcHQuZWxlbWVudC5zZXRBdHRyaWJ1dGUoJ3NyYycsIHVybCk7XG5cdFx0XHR9IGVsc2UgaWYgKF9vcHQuZWxlbWVudElkKSB7XG5cdFx0XHRcdC8vaWYgaXMgYXR0YWNoZWQgdG8gZWxlbWVudCAoaW1hZ2UpXG5cdFx0XHRcdHZhciBlbG0gPSBfZG9jLmdldEVsZW1lbnRCeUlkKF9vcHQuZWxlbWVudElkKTtcblx0XHRcdFx0ZWxtLnNldEF0dHJpYnV0ZSgnaHJlZicsIHVybCk7XG5cdFx0XHRcdGVsbS5zZXRBdHRyaWJ1dGUoJ3NyYycsIHVybCk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQvL2lmIGlzIGF0dGFjaGVkIHRvIGZhdiBpY29uXG5cdFx0XHRcdGlmIChfYnJvd3Nlci5mZiB8fCBfYnJvd3Nlci5vcGVyYSkge1xuXHRcdFx0XHRcdC8vZm9yIEZGIHdlIG5lZWQgdG8gXCJyZWNyZWF0ZVwiIGVsZW1lbnQsIGF0YWNoIHRvIGRvbSBhbmQgcmVtb3ZlIG9sZCA8bGluaz5cblx0XHRcdFx0XHQvL3ZhciBvcmlnaW5hbFR5cGUgPSBfb3JpZy5nZXRBdHRyaWJ1dGUoJ3JlbCcpO1xuXHRcdFx0XHRcdHZhciBvbGQgPSBfb3JpZ1tfb3JpZy5sZW5ndGggLSAxXTtcblx0XHRcdFx0XHR2YXIgbmV3SWNvbiA9IF9kb2MuY3JlYXRlRWxlbWVudCgnbGluaycpO1xuXHRcdFx0XHRcdF9vcmlnID0gW25ld0ljb25dO1xuXHRcdFx0XHRcdC8vX29yaWcuc2V0QXR0cmlidXRlKCdyZWwnLCBvcmlnaW5hbFR5cGUpO1xuXHRcdFx0XHRcdGlmIChfYnJvd3Nlci5vcGVyYSkge1xuXHRcdFx0XHRcdFx0bmV3SWNvbi5zZXRBdHRyaWJ1dGUoJ3JlbCcsICdpY29uJyk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdG5ld0ljb24uc2V0QXR0cmlidXRlKCdyZWwnLCAnaWNvbicpO1xuXHRcdFx0XHRcdG5ld0ljb24uc2V0QXR0cmlidXRlKCd0eXBlJywgJ2ltYWdlL3BuZycpO1xuXHRcdFx0XHRcdF9kb2MuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2hlYWQnKVswXS5hcHBlbmRDaGlsZChuZXdJY29uKTtcblx0XHRcdFx0XHRuZXdJY29uLnNldEF0dHJpYnV0ZSgnaHJlZicsIHVybCk7XG5cdFx0XHRcdFx0aWYgKG9sZC5wYXJlbnROb2RlKSB7XG5cdFx0XHRcdFx0XHRvbGQucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChvbGQpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRfb3JpZy5mb3JFYWNoKGZ1bmN0aW9uKGljb24pIHtcblx0XHRcdFx0XHRcdGljb24uc2V0QXR0cmlidXRlKCdocmVmJywgdXJsKTtcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH07XG5cblx0XHQvL2h0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvNTYyMzgzOC9yZ2ItdG8taGV4LWFuZC1oZXgtdG8tcmdiI2Fuc3dlci01NjI0MTM5XG5cdFx0Ly9IRVggdG8gUkdCIGNvbnZlcnRvclxuXHRcdGZ1bmN0aW9uIGhleFRvUmdiKGhleCkge1xuXHRcdFx0dmFyIHNob3J0aGFuZFJlZ2V4ID0gL14jPyhbYS1mXFxkXSkoW2EtZlxcZF0pKFthLWZcXGRdKSQvaTtcblx0XHRcdGhleCA9IGhleC5yZXBsYWNlKHNob3J0aGFuZFJlZ2V4LCBmdW5jdGlvbiAobSwgciwgZywgYikge1xuXHRcdFx0XHRyZXR1cm4gciArIHIgKyBnICsgZyArIGIgKyBiO1xuXHRcdFx0fSk7XG5cdFx0XHR2YXIgcmVzdWx0ID0gL14jPyhbYS1mXFxkXXsyfSkoW2EtZlxcZF17Mn0pKFthLWZcXGRdezJ9KSQvaS5leGVjKGhleCk7XG5cdFx0XHRyZXR1cm4gcmVzdWx0ID8ge1xuXHRcdFx0XHRyOiBwYXJzZUludChyZXN1bHRbMV0sIDE2KSxcblx0XHRcdFx0ZzogcGFyc2VJbnQocmVzdWx0WzJdLCAxNiksXG5cdFx0XHRcdGI6IHBhcnNlSW50KHJlc3VsdFszXSwgMTYpXG5cdFx0XHR9IDogZmFsc2U7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogTWVyZ2Ugb3B0aW9uc1xuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIG1lcmdlKGRlZiwgb3B0KSB7XG5cdFx0XHR2YXIgbWVyZ2VkT3B0ID0ge307XG5cdFx0XHR2YXIgYXR0cm5hbWU7XG5cdFx0XHRmb3IgKGF0dHJuYW1lIGluIGRlZikge1xuXHRcdFx0XHRtZXJnZWRPcHRbYXR0cm5hbWVdID0gZGVmW2F0dHJuYW1lXTtcblx0XHRcdH1cblx0XHRcdGZvciAoYXR0cm5hbWUgaW4gb3B0KSB7XG5cdFx0XHRcdG1lcmdlZE9wdFthdHRybmFtZV0gPSBvcHRbYXR0cm5hbWVdO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIG1lcmdlZE9wdDtcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBDcm9zcy1icm93c2VyIHBhZ2UgdmlzaWJpbGl0eSBzaGltXG5cdFx0ICogaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8xMjUzNjU2Mi9kZXRlY3Qtd2hldGhlci1hLXdpbmRvdy1pcy12aXNpYmxlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gaXNQYWdlSGlkZGVuKCkge1xuXHRcdFx0cmV0dXJuIF9kb2MuaGlkZGVuIHx8IF9kb2MubXNIaWRkZW4gfHwgX2RvYy53ZWJraXRIaWRkZW4gfHwgX2RvYy5tb3pIaWRkZW47XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogQG5hbWVzcGFjZSBhbmltYXRpb25cblx0XHQgKi9cblx0XHR2YXIgYW5pbWF0aW9uID0ge307XG5cdFx0LyoqXG5cdFx0ICogQW5pbWF0aW9uIFwiZnJhbWVcIiBkdXJhdGlvblxuXHRcdCAqL1xuXHRcdGFuaW1hdGlvbi5kdXJhdGlvbiA9IDQwO1xuXHRcdC8qKlxuXHRcdCAqIEFuaW1hdGlvbiB0eXBlcyAobm9uZSxmYWRlLHBvcCxzbGlkZSlcblx0XHQgKi9cblx0XHRhbmltYXRpb24udHlwZXMgPSB7fTtcblx0XHRhbmltYXRpb24udHlwZXMuZmFkZSA9IFt7XG5cdFx0XHR4OiAwLjQsXG5cdFx0XHR5OiAwLjQsXG5cdFx0XHR3OiAwLjYsXG5cdFx0XHRoOiAwLjYsXG5cdFx0XHRvOiAwLjBcblx0XHR9LCB7XG5cdFx0XHRcdHg6IDAuNCxcblx0XHRcdFx0eTogMC40LFxuXHRcdFx0XHR3OiAwLjYsXG5cdFx0XHRcdGg6IDAuNixcblx0XHRcdFx0bzogMC4xXG5cdFx0XHR9LCB7XG5cdFx0XHRcdHg6IDAuNCxcblx0XHRcdFx0eTogMC40LFxuXHRcdFx0XHR3OiAwLjYsXG5cdFx0XHRcdGg6IDAuNixcblx0XHRcdFx0bzogMC4yXG5cdFx0XHR9LCB7XG5cdFx0XHRcdHg6IDAuNCxcblx0XHRcdFx0eTogMC40LFxuXHRcdFx0XHR3OiAwLjYsXG5cdFx0XHRcdGg6IDAuNixcblx0XHRcdFx0bzogMC4zXG5cdFx0XHR9LCB7XG5cdFx0XHRcdHg6IDAuNCxcblx0XHRcdFx0eTogMC40LFxuXHRcdFx0XHR3OiAwLjYsXG5cdFx0XHRcdGg6IDAuNixcblx0XHRcdFx0bzogMC40XG5cdFx0XHR9LCB7XG5cdFx0XHRcdHg6IDAuNCxcblx0XHRcdFx0eTogMC40LFxuXHRcdFx0XHR3OiAwLjYsXG5cdFx0XHRcdGg6IDAuNixcblx0XHRcdFx0bzogMC41XG5cdFx0XHR9LCB7XG5cdFx0XHRcdHg6IDAuNCxcblx0XHRcdFx0eTogMC40LFxuXHRcdFx0XHR3OiAwLjYsXG5cdFx0XHRcdGg6IDAuNixcblx0XHRcdFx0bzogMC42XG5cdFx0XHR9LCB7XG5cdFx0XHRcdHg6IDAuNCxcblx0XHRcdFx0eTogMC40LFxuXHRcdFx0XHR3OiAwLjYsXG5cdFx0XHRcdGg6IDAuNixcblx0XHRcdFx0bzogMC43XG5cdFx0XHR9LCB7XG5cdFx0XHRcdHg6IDAuNCxcblx0XHRcdFx0eTogMC40LFxuXHRcdFx0XHR3OiAwLjYsXG5cdFx0XHRcdGg6IDAuNixcblx0XHRcdFx0bzogMC44XG5cdFx0XHR9LCB7XG5cdFx0XHRcdHg6IDAuNCxcblx0XHRcdFx0eTogMC40LFxuXHRcdFx0XHR3OiAwLjYsXG5cdFx0XHRcdGg6IDAuNixcblx0XHRcdFx0bzogMC45XG5cdFx0XHR9LCB7XG5cdFx0XHRcdHg6IDAuNCxcblx0XHRcdFx0eTogMC40LFxuXHRcdFx0XHR3OiAwLjYsXG5cdFx0XHRcdGg6IDAuNixcblx0XHRcdFx0bzogMS4wXG5cdFx0XHR9XTtcblx0XHRhbmltYXRpb24udHlwZXMubm9uZSA9IFt7XG5cdFx0XHR4OiAwLjQsXG5cdFx0XHR5OiAwLjQsXG5cdFx0XHR3OiAwLjYsXG5cdFx0XHRoOiAwLjYsXG5cdFx0XHRvOiAxXG5cdFx0fV07XG5cdFx0YW5pbWF0aW9uLnR5cGVzLnBvcCA9IFt7XG5cdFx0XHR4OiAxLFxuXHRcdFx0eTogMSxcblx0XHRcdHc6IDAsXG5cdFx0XHRoOiAwLFxuXHRcdFx0bzogMVxuXHRcdH0sIHtcblx0XHRcdFx0eDogMC45LFxuXHRcdFx0XHR5OiAwLjksXG5cdFx0XHRcdHc6IDAuMSxcblx0XHRcdFx0aDogMC4xLFxuXHRcdFx0XHRvOiAxXG5cdFx0XHR9LCB7XG5cdFx0XHRcdHg6IDAuOCxcblx0XHRcdFx0eTogMC44LFxuXHRcdFx0XHR3OiAwLjIsXG5cdFx0XHRcdGg6IDAuMixcblx0XHRcdFx0bzogMVxuXHRcdFx0fSwge1xuXHRcdFx0XHR4OiAwLjcsXG5cdFx0XHRcdHk6IDAuNyxcblx0XHRcdFx0dzogMC4zLFxuXHRcdFx0XHRoOiAwLjMsXG5cdFx0XHRcdG86IDFcblx0XHRcdH0sIHtcblx0XHRcdFx0eDogMC42LFxuXHRcdFx0XHR5OiAwLjYsXG5cdFx0XHRcdHc6IDAuNCxcblx0XHRcdFx0aDogMC40LFxuXHRcdFx0XHRvOiAxXG5cdFx0XHR9LCB7XG5cdFx0XHRcdHg6IDAuNSxcblx0XHRcdFx0eTogMC41LFxuXHRcdFx0XHR3OiAwLjUsXG5cdFx0XHRcdGg6IDAuNSxcblx0XHRcdFx0bzogMVxuXHRcdFx0fSwge1xuXHRcdFx0XHR4OiAwLjQsXG5cdFx0XHRcdHk6IDAuNCxcblx0XHRcdFx0dzogMC42LFxuXHRcdFx0XHRoOiAwLjYsXG5cdFx0XHRcdG86IDFcblx0XHRcdH1dO1xuXHRcdGFuaW1hdGlvbi50eXBlcy5wb3BGYWRlID0gW3tcblx0XHRcdHg6IDAuNzUsXG5cdFx0XHR5OiAwLjc1LFxuXHRcdFx0dzogMCxcblx0XHRcdGg6IDAsXG5cdFx0XHRvOiAwXG5cdFx0fSwge1xuXHRcdFx0XHR4OiAwLjY1LFxuXHRcdFx0XHR5OiAwLjY1LFxuXHRcdFx0XHR3OiAwLjEsXG5cdFx0XHRcdGg6IDAuMSxcblx0XHRcdFx0bzogMC4yXG5cdFx0XHR9LCB7XG5cdFx0XHRcdHg6IDAuNixcblx0XHRcdFx0eTogMC42LFxuXHRcdFx0XHR3OiAwLjIsXG5cdFx0XHRcdGg6IDAuMixcblx0XHRcdFx0bzogMC40XG5cdFx0XHR9LCB7XG5cdFx0XHRcdHg6IDAuNTUsXG5cdFx0XHRcdHk6IDAuNTUsXG5cdFx0XHRcdHc6IDAuMyxcblx0XHRcdFx0aDogMC4zLFxuXHRcdFx0XHRvOiAwLjZcblx0XHRcdH0sIHtcblx0XHRcdFx0eDogMC41MCxcblx0XHRcdFx0eTogMC41MCxcblx0XHRcdFx0dzogMC40LFxuXHRcdFx0XHRoOiAwLjQsXG5cdFx0XHRcdG86IDAuOFxuXHRcdFx0fSwge1xuXHRcdFx0XHR4OiAwLjQ1LFxuXHRcdFx0XHR5OiAwLjQ1LFxuXHRcdFx0XHR3OiAwLjUsXG5cdFx0XHRcdGg6IDAuNSxcblx0XHRcdFx0bzogMC45XG5cdFx0XHR9LCB7XG5cdFx0XHRcdHg6IDAuNCxcblx0XHRcdFx0eTogMC40LFxuXHRcdFx0XHR3OiAwLjYsXG5cdFx0XHRcdGg6IDAuNixcblx0XHRcdFx0bzogMVxuXHRcdFx0fV07XG5cdFx0YW5pbWF0aW9uLnR5cGVzLnNsaWRlID0gW3tcblx0XHRcdHg6IDAuNCxcblx0XHRcdHk6IDEsXG5cdFx0XHR3OiAwLjYsXG5cdFx0XHRoOiAwLjYsXG5cdFx0XHRvOiAxXG5cdFx0fSwge1xuXHRcdFx0XHR4OiAwLjQsXG5cdFx0XHRcdHk6IDAuOSxcblx0XHRcdFx0dzogMC42LFxuXHRcdFx0XHRoOiAwLjYsXG5cdFx0XHRcdG86IDFcblx0XHRcdH0sIHtcblx0XHRcdFx0eDogMC40LFxuXHRcdFx0XHR5OiAwLjksXG5cdFx0XHRcdHc6IDAuNixcblx0XHRcdFx0aDogMC42LFxuXHRcdFx0XHRvOiAxXG5cdFx0XHR9LCB7XG5cdFx0XHRcdHg6IDAuNCxcblx0XHRcdFx0eTogMC44LFxuXHRcdFx0XHR3OiAwLjYsXG5cdFx0XHRcdGg6IDAuNixcblx0XHRcdFx0bzogMVxuXHRcdFx0fSwge1xuXHRcdFx0XHR4OiAwLjQsXG5cdFx0XHRcdHk6IDAuNyxcblx0XHRcdFx0dzogMC42LFxuXHRcdFx0XHRoOiAwLjYsXG5cdFx0XHRcdG86IDFcblx0XHRcdH0sIHtcblx0XHRcdFx0eDogMC40LFxuXHRcdFx0XHR5OiAwLjYsXG5cdFx0XHRcdHc6IDAuNixcblx0XHRcdFx0aDogMC42LFxuXHRcdFx0XHRvOiAxXG5cdFx0XHR9LCB7XG5cdFx0XHRcdHg6IDAuNCxcblx0XHRcdFx0eTogMC41LFxuXHRcdFx0XHR3OiAwLjYsXG5cdFx0XHRcdGg6IDAuNixcblx0XHRcdFx0bzogMVxuXHRcdFx0fSwge1xuXHRcdFx0XHR4OiAwLjQsXG5cdFx0XHRcdHk6IDAuNCxcblx0XHRcdFx0dzogMC42LFxuXHRcdFx0XHRoOiAwLjYsXG5cdFx0XHRcdG86IDFcblx0XHRcdH1dO1xuXHRcdC8qKlxuXHRcdCAqIFJ1biBhbmltYXRpb25cblx0XHQgKiBAcGFyYW0ge09iamVjdH0gb3B0IEFuaW1hdGlvbiBvcHRpb25zXG5cdFx0ICogQHBhcmFtIHtPYmplY3R9IGNiIENhbGxhYmFrIGFmdGVyIGFsbCBzdGVwcyBhcmUgZG9uZVxuXHRcdCAqIEBwYXJhbSB7T2JqZWN0fSByZXZlcnQgUmV2ZXJzZSBvcmRlcj8gdHJ1ZXxmYWxzZVxuXHRcdCAqIEBwYXJhbSB7T2JqZWN0fSBzdGVwIE9wdGlvbmFsIHN0ZXAgbnVtYmVyIChmcmFtZSBidW1iZXIpXG5cdFx0ICovXG5cdFx0YW5pbWF0aW9uLnJ1biA9IGZ1bmN0aW9uIChvcHQsIGNiLCByZXZlcnQsIHN0ZXApIHtcblx0XHRcdHZhciBhbmltYXRpb25UeXBlID0gYW5pbWF0aW9uLnR5cGVzW2lzUGFnZUhpZGRlbigpID8gJ25vbmUnIDogX29wdC5hbmltYXRpb25dO1xuXHRcdFx0aWYgKHJldmVydCA9PT0gdHJ1ZSkge1xuXHRcdFx0XHRzdGVwID0gKHR5cGVvZiBzdGVwICE9PSAndW5kZWZpbmVkJykgPyBzdGVwIDogYW5pbWF0aW9uVHlwZS5sZW5ndGggLSAxO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0c3RlcCA9ICh0eXBlb2Ygc3RlcCAhPT0gJ3VuZGVmaW5lZCcpID8gc3RlcCA6IDA7XG5cdFx0XHR9XG5cdFx0XHRjYiA9IChjYikgPyBjYiA6IGZ1bmN0aW9uICgpIHtcblx0XHRcdH07XG5cdFx0XHRpZiAoKHN0ZXAgPCBhbmltYXRpb25UeXBlLmxlbmd0aCkgJiYgKHN0ZXAgPj0gMCkpIHtcblx0XHRcdFx0dHlwZVtfb3B0LnR5cGVdKG1lcmdlKG9wdCwgYW5pbWF0aW9uVHlwZVtzdGVwXSkpO1xuXHRcdFx0XHRfYW5pbVRpbWVvdXQgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRpZiAocmV2ZXJ0KSB7XG5cdFx0XHRcdFx0XHRzdGVwID0gc3RlcCAtIDE7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdHN0ZXAgPSBzdGVwICsgMTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0YW5pbWF0aW9uLnJ1bihvcHQsIGNiLCByZXZlcnQsIHN0ZXApO1xuXHRcdFx0XHR9LCBhbmltYXRpb24uZHVyYXRpb24pO1xuXG5cdFx0XHRcdGxpbmsuc2V0SWNvbihfY2FudmFzKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGNiKCk7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHR9O1xuXHRcdC8vYXV0byBpbml0XG5cdFx0aW5pdCgpO1xuXHRcdHJldHVybiB7XG5cdFx0XHRiYWRnZTogYmFkZ2UsXG5cdFx0XHRzZXRPcHQ6IHNldE9wdCxcblx0XHRcdHJlc2V0OiBpY29uLnJlc2V0LFxuXHRcdFx0YnJvd3Nlcjoge1xuXHRcdFx0XHRzdXBwb3J0ZWQ6IF9icm93c2VyLnN1cHBvcnRlZFxuXHRcdFx0fVxuXHRcdH07XG5cdH0pO1xuXG5cdC8vIEFNRCAvIFJlcXVpcmVKU1xuXHRpZiAodHlwZW9mIGRlZmluZSAhPT0gJ3VuZGVmaW5lZCcgJiYgZGVmaW5lLmFtZCkge1xuXHRcdGRlZmluZShbXSwgZnVuY3Rpb24gKCkge1xuXHRcdFx0cmV0dXJuIEZhdmljbztcblx0XHR9KTtcblx0fVxuXHQvLyBDb21tb25KU1xuXHRlbHNlIGlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyAmJiBtb2R1bGUuZXhwb3J0cykge1xuXHRcdG1vZHVsZS5leHBvcnRzID0gRmF2aWNvO1xuXHR9XG5cdC8vIGluY2x1ZGVkIGRpcmVjdGx5IHZpYSA8c2NyaXB0PiB0YWdcblx0ZWxzZSB7XG5cdFx0dGhpcy5GYXZpY28gPSBGYXZpY287XG5cdH1cblxufSkoKTtcbiIsIi8vIGltcG9ydCAqIGFzIGhtIGZyb20gJy4ubW9kdWxlcy9obS5qcydcbnZhciBobSA9IHJlcXVpcmUoJy4vbW9kdWxlcy9obS5qcycpXG5cbmZ1bmN0aW9uIGluaXQoKSB7XG4gICAgaG0ucnVuKCk7XG59XG5cbndpbmRvdy5vbmxvYWQgPSAoKSA9PiBpbml0KCkiLCIvLyBOUE0gbW9kdWxlc1xudmFyIEZhdmljbyA9IHJlcXVpcmUoJ2Zhdmljby5qcy1zbGV2b21hdCcpO1xuXG4vLyBHbG9iYWxzXG52YXIgdDtcbnZhciBpc1RpbWVyR29pbmcgPSBmYWxzZTtcbnZhciBiZWVuV2FybmVkID0gZmFsc2U7XG52YXIgZmF2aWNvbiA9IG5ldyBGYXZpY28oe1xuICAgIGFuaW1hdGlvbjogJ3NsaWRlJ1xufSk7XG52YXIgaGFzUHJvbWlzZWRUb1dvcmtXaXRoTWU7XG5cbmZ1bmN0aW9uIHJ1bigpIHtcbiAgICAvLyBJZiB5b3UgaGF2ZW4ndCBjb21lIHRvIHRoaXMgc2l0ZSBiZWZvcmUgc2V0IGRlZmF1bHRcbiAgICBpZiAobG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3NiYjpzZWVuTWVzc2FnZScpID09IHVuZGVmaW5lZCkge1xuICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnc2JiOnNlZW5NZXNzYWdlJywgZmFsc2UpO1xuICAgIH1cblxuICAgIGhhc1Byb21pc2VkVG9Xb3JrV2l0aE1lID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3NiYjpzZWVuTWVzc2FnZScpXG4gICAgbWVzc2FnZUJ1dHRvbigpXG4gICAgLy8gQ2hlY2sgaGlkZGVuIHN0YXR1cyBldmVyeSBzZWNvbmRcbiAgICB3aW5kb3cuc2V0SW50ZXJ2YWwoY2hlY2tUYWJWaXNpYmlsaXR5LCAxMDAwKTtcbn1cblxuZnVuY3Rpb24gbWVzc2FnZUJ1dHRvbigpIHtcbiAgICB2YXIgYnV0dG9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2hpZGRlbi1idXR0b24nKVxuXG4gICAgYnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgICB2YXIgZWwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjaGlkZGVuLW1lc3NhZ2UtY29udGFpbmVyJyk7XG4gICAgICAgIGVsLmNsYXNzTGlzdC5hZGQoJ25vdC12aXNpYmxlJyk7XG4gICAgICAgIC8vIFNvbWUgdmFyIGZvciBuZXZlciBzaG93aW5nIGFnYWluLlxuICAgICAgICBjbGVhclRpbWVkTWVzc2FnZSgpO1xuICAgICAgICBoYXNQcm9taXNlZFRvV29ya1dpdGhNZSA9IHRydWU7XG4gICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCdzYmI6c2Vlbk1lc3NhZ2UnLCBoYXNQcm9taXNlZFRvV29ya1dpdGhNZSk7XG4gICAgfSlcbn1cblxuZnVuY3Rpb24gY2hlY2tUYWJWaXNpYmlsaXR5KCkge1xuICAgIHZhciBoaWRkZW4sIHZpc2liaWxpdHlDaGFuZ2U7XG4gICAgaWYgKCFoYXNQcm9taXNlZFRvV29ya1dpdGhNZSkge1xuXG4gICAgICAgIGlmICh0eXBlb2YgZG9jdW1lbnQuaGlkZGVuICE9PSBcInVuZGVmaW5lZFwiKSB7IC8vIE9wZXJhIDEyLjEwIGFuZCBGaXJlZm94IDE4IGFuZCBsYXRlciBzdXBwb3J0IFxuICAgICAgICAgICAgaGlkZGVuID0gXCJoaWRkZW5cIjtcbiAgICAgICAgICAgIHZpc2liaWxpdHlDaGFuZ2UgPSBcInZpc2liaWxpdHljaGFuZ2VcIjtcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgZG9jdW1lbnQubXNIaWRkZW4gIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgICAgIGhpZGRlbiA9IFwibXNIaWRkZW5cIjtcbiAgICAgICAgICAgIHZpc2liaWxpdHlDaGFuZ2UgPSBcIm1zdmlzaWJpbGl0eWNoYW5nZVwiO1xuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBkb2N1bWVudC53ZWJraXRIaWRkZW4gIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgICAgIGhpZGRlbiA9IFwid2Via2l0SGlkZGVuXCI7XG4gICAgICAgICAgICB2aXNpYmlsaXR5Q2hhbmdlID0gXCJ3ZWJraXR2aXNpYmlsaXR5Y2hhbmdlXCI7XG4gICAgICAgIH1cbiAgICBcbiAgICAgICAgaWYgKGRvY3VtZW50W2hpZGRlbl0pIHtcbiAgICAgICAgICAgIHRpbWVkTWVzc2FnZSgpO1xuICAgICAgICAgICAgLy8gU2V0IGd2YXIgb24gdGhpcyB0b29cbiAgICAgICAgICAgIGlzVGltZXJHb2luZyA9IHRydWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBSZXNldCBUaW1lclxuICAgICAgICAgICAgZmF2aWNvbi5iYWRnZSgwKTtcbiAgICAgICAgICAgIGlmIChpc1RpbWVyR29pbmcpIHtcbiAgICAgICAgICAgICAgICBjbGVhclRpbWVkTWVzc2FnZSgpXG4gICAgICAgICAgICAgICAgaXNUaW1lckdvaW5nID0gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgIH1cbn07XG5cbmZ1bmN0aW9uIHRpbWVkTWVzc2FnZSgpIHtcbiAgICAvLyAxLDgwMCBzZWNvbmRzID09PSAzMCBtaW51dGVzXG4gICAgdCA9IHdpbmRvdy5zZXRUaW1lb3V0KHNiYk1lc3NhZ2UsICgxODAwKjEwMDApKVxufTtcblxuZnVuY3Rpb24gY2xlYXJUaW1lZE1lc3NhZ2UoKSB7XG4gICAgd2luZG93LmNsZWFyVGltZW91dCh0KTtcbn1cblxuZnVuY3Rpb24gc2JiTWVzc2FnZSgpIHtcbiAgICBpZiAoIWJlZW5XYXJuZWQpIHtcbiAgICAgICAgZmF2aWNvbi5iYWRnZSgxKTtcbiAgICAgICAgdmFyIGVsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2hpZGRlbi1tZXNzYWdlLWNvbnRhaW5lcicpO1xuICAgICAgICBlbC5jbGFzc0xpc3QucmVtb3ZlKCdub3QtdmlzaWJsZScpO1xuICAgIH1cbiAgICBiZWVuV2FybmVkID0gdHJ1ZTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7IHJ1biB9OyJdfQ==
