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

var t;
var isTimerGoing = false;
var beenWarned = false;
var hasPromisedToWorkWithMe = false;

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
        hasPromisedToWorkWithMe = localStorage.getItem('sbb:seenMessage')
    } else {

    }
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvZmF2aWNvLmpzLXNsZXZvbWF0L2Zhdmljby5qcyIsIl9zdHJlYW1fMC5qcyIsIm1vZHVsZXMvaG0uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2p3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiLyoqXG4gKiBAbGljZW5zZSBNSVQgb3IgR1BMLTIuMFxuICogQGZpbGVPdmVydmlldyBGYXZpY28gYW5pbWF0aW9uc1xuICogQGF1dGhvciBNaXJvc2xhdiBNYWdkYSwgaHR0cDovL2Jsb2cuZWpjaS5uZXRcbiAqIEBzb3VyY2U6IGh0dHBzOi8vZ2l0aHViLmNvbS9lamNpL2Zhdmljby5qc1xuICogQHZlcnNpb24gMC4zLjEwXG4gKi9cblxuLyoqXG4gKiBDcmVhdGUgbmV3IGZhdmljbyBpbnN0YW5jZVxuICogQHBhcmFtIHtPYmplY3R9IE9wdGlvbnNcbiAqIEByZXR1cm4ge09iamVjdH0gRmF2aWNvIG9iamVjdFxuICogQGV4YW1wbGVcbiAqIHZhciBmYXZpY28gPSBuZXcgRmF2aWNvKHtcbiAqICAgIGJnQ29sb3IgOiAnI2QwMCcsXG4gKiAgICB0ZXh0Q29sb3IgOiAnI2ZmZicsXG4gKiAgICBmb250RmFtaWx5IDogJ3NhbnMtc2VyaWYnLFxuICogICAgZm9udFN0eWxlIDogJ2JvbGQnLFxuICogICAgdHlwZSA6ICdjaXJjbGUnLFxuICogICAgcG9zaXRpb24gOiAnZG93bicsXG4gKiAgICBhbmltYXRpb24gOiAnc2xpZGUnLFxuICogICAgZWxlbWVudElkOiBmYWxzZSxcbiAqICAgIGVsZW1lbnQ6IG51bGwsXG4gKiAgICBkYXRhVXJsOiBmdW5jdGlvbih1cmwpe30sXG4gKiAgICB3aW46IHdpbmRvd1xuICogfSk7XG4gKi9cbihmdW5jdGlvbiAoKSB7XG5cblx0dmFyIEZhdmljbyA9IChmdW5jdGlvbiAob3B0KSB7XG5cdFx0J3VzZSBzdHJpY3QnO1xuXHRcdG9wdCA9IChvcHQpID8gb3B0IDoge307XG5cdFx0dmFyIF9kZWYgPSB7XG5cdFx0XHRiZ0NvbG9yOiAnI2QwMCcsXG5cdFx0XHR0ZXh0Q29sb3I6ICcjZmZmJyxcblx0XHRcdGZvbnRGYW1pbHk6ICdzYW5zLXNlcmlmJywgLy9BcmlhbCxWZXJkYW5hLFRpbWVzIE5ldyBSb21hbixzZXJpZixzYW5zLXNlcmlmLC4uLlxuXHRcdFx0Zm9udFN0eWxlOiAnYm9sZCcsIC8vbm9ybWFsLGl0YWxpYyxvYmxpcXVlLGJvbGQsYm9sZGVyLGxpZ2h0ZXIsMTAwLDIwMCwzMDAsNDAwLDUwMCw2MDAsNzAwLDgwMCw5MDBcblx0XHRcdHR5cGU6ICdjaXJjbGUnLFxuXHRcdFx0cG9zaXRpb246ICdkb3duJywgLy8gZG93biwgdXAsIGxlZnQsIGxlZnR1cCAodXBsZWZ0KVxuXHRcdFx0YW5pbWF0aW9uOiAnc2xpZGUnLFxuXHRcdFx0ZWxlbWVudElkOiBmYWxzZSxcblx0XHRcdGVsZW1lbnQ6IG51bGwsXG5cdFx0XHRkYXRhVXJsOiBmYWxzZSxcblx0XHRcdHdpbjogd2luZG93XG5cdFx0fTtcblx0XHR2YXIgX29wdCwgX29yaWcsIF9oLCBfdywgX2NhbnZhcywgX2NvbnRleHQsIF9pbWcsIF9yZWFkeSwgX2xhc3RCYWRnZSwgX3J1bm5pbmcsIF9yZWFkeUNiLCBfc3RvcCwgX2Jyb3dzZXIsIF9hbmltVGltZW91dCwgX2RyYXdUaW1lb3V0LCBfZG9jO1xuXG5cdFx0X2Jyb3dzZXIgPSB7fTtcblx0XHRfYnJvd3Nlci5mZiA9IHR5cGVvZiBJbnN0YWxsVHJpZ2dlciAhPSAndW5kZWZpbmVkJztcblx0XHRfYnJvd3Nlci5jaHJvbWUgPSAhIXdpbmRvdy5jaHJvbWU7XG5cdFx0X2Jyb3dzZXIub3BlcmEgPSAhIXdpbmRvdy5vcGVyYSB8fCBuYXZpZ2F0b3IudXNlckFnZW50LmluZGV4T2YoJ09wZXJhJykgPj0gMDtcblx0XHRfYnJvd3Nlci5pZSA9IC8qQGNjX29uIUAqL2ZhbHNlO1xuXHRcdF9icm93c2VyLnNhZmFyaSA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh3aW5kb3cuSFRNTEVsZW1lbnQpLmluZGV4T2YoJ0NvbnN0cnVjdG9yJykgPiAwO1xuXHRcdF9icm93c2VyLnN1cHBvcnRlZCA9IChfYnJvd3Nlci5jaHJvbWUgfHwgX2Jyb3dzZXIuZmYgfHwgX2Jyb3dzZXIub3BlcmEpO1xuXG5cdFx0dmFyIF9xdWV1ZSA9IFtdO1xuXHRcdF9yZWFkeUNiID0gZnVuY3Rpb24gKCkge1xuXHRcdH07XG5cdFx0X3JlYWR5ID0gX3N0b3AgPSBmYWxzZTtcblx0XHQvKipcblx0XHQgKiBJbml0aWFsaXplIGZhdmljb1xuXHRcdCAqL1xuXHRcdHZhciBpbml0ID0gZnVuY3Rpb24gKCkge1xuXHRcdFx0Ly9tZXJnZSBpbml0aWFsIG9wdGlvbnNcblx0XHRcdF9vcHQgPSBtZXJnZShfZGVmLCBvcHQpO1xuXHRcdFx0X29wdC5iZ0NvbG9yID0gaGV4VG9SZ2IoX29wdC5iZ0NvbG9yKTtcblx0XHRcdF9vcHQudGV4dENvbG9yID0gaGV4VG9SZ2IoX29wdC50ZXh0Q29sb3IpO1xuXHRcdFx0X29wdC5wb3NpdGlvbiA9IF9vcHQucG9zaXRpb24udG9Mb3dlckNhc2UoKTtcblx0XHRcdF9vcHQuYW5pbWF0aW9uID0gKGFuaW1hdGlvbi50eXBlc1snJyArIF9vcHQuYW5pbWF0aW9uXSkgPyBfb3B0LmFuaW1hdGlvbiA6IF9kZWYuYW5pbWF0aW9uO1xuXG5cdFx0XHRfZG9jID0gX29wdC53aW4uZG9jdW1lbnQ7XG5cblx0XHRcdHZhciBpc1VwID0gX29wdC5wb3NpdGlvbi5pbmRleE9mKCd1cCcpID4gLTE7XG5cdFx0XHR2YXIgaXNMZWZ0ID0gX29wdC5wb3NpdGlvbi5pbmRleE9mKCdsZWZ0JykgPiAtMTtcblxuXHRcdFx0Ly90cmFuc2Zvcm0gdGhlIGFuaW1hdGlvbnNcblx0XHRcdGlmIChpc1VwIHx8IGlzTGVmdCkge1xuXHRcdFx0XHRmb3IgKHZhciBhIGluIGFuaW1hdGlvbi50eXBlcykge1xuXHRcdFx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgYW5pbWF0aW9uLnR5cGVzW2FdLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdFx0XHR2YXIgc3RlcCA9IGFuaW1hdGlvbi50eXBlc1thXVtpXTtcblxuXHRcdFx0XHRcdFx0aWYgKGlzVXApIHtcblx0XHRcdFx0XHRcdFx0aWYgKHN0ZXAueSA8IDAuNikge1xuXHRcdFx0XHRcdFx0XHRcdHN0ZXAueSA9IHN0ZXAueSAtIDAuNDtcblx0XHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0XHRzdGVwLnkgPSBzdGVwLnkgLSAyICogc3RlcC55ICsgKDEgLSBzdGVwLncpO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdGlmIChpc0xlZnQpIHtcblx0XHRcdFx0XHRcdFx0aWYgKHN0ZXAueCA8IDAuNikge1xuXHRcdFx0XHRcdFx0XHRcdHN0ZXAueCA9IHN0ZXAueCAtIDAuNDtcblx0XHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0XHRzdGVwLnggPSBzdGVwLnggLSAyICogc3RlcC54ICsgKDEgLSBzdGVwLmgpO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdGFuaW1hdGlvbi50eXBlc1thXVtpXSA9IHN0ZXA7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRfb3B0LnR5cGUgPSAodHlwZVsnJyArIF9vcHQudHlwZV0pID8gX29wdC50eXBlIDogX2RlZi50eXBlO1xuXG5cdFx0XHRfb3JpZyA9IGxpbmsuIGdldEljb25zKCk7XG5cdFx0XHQvL2NyZWF0ZSB0ZW1wIGNhbnZhc1xuXHRcdFx0X2NhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xuXHRcdFx0Ly9jcmVhdGUgdGVtcCBpbWFnZVxuXHRcdFx0X2ltZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2ltZycpO1xuXHRcdFx0dmFyIGxhc3RJY29uID0gX29yaWdbX29yaWcubGVuZ3RoIC0gMV07XG5cdFx0XHRpZiAobGFzdEljb24uaGFzQXR0cmlidXRlKCdocmVmJykpIHtcblx0XHRcdFx0X2ltZy5zZXRBdHRyaWJ1dGUoJ2Nyb3NzT3JpZ2luJywgJ2Fub255bW91cycpO1xuXHRcdFx0XHQvL2dldCB3aWR0aC9oZWlnaHRcblx0XHRcdFx0X2ltZy5vbmxvYWQgPSBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0X2ggPSAoX2ltZy5oZWlnaHQgPiAwKSA/IF9pbWcuaGVpZ2h0IDogMzI7XG5cdFx0XHRcdFx0X3cgPSAoX2ltZy53aWR0aCA+IDApID8gX2ltZy53aWR0aCA6IDMyO1xuXHRcdFx0XHRcdF9jYW52YXMuaGVpZ2h0ID0gX2g7XG5cdFx0XHRcdFx0X2NhbnZhcy53aWR0aCA9IF93O1xuXHRcdFx0XHRcdF9jb250ZXh0ID0gX2NhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuXHRcdFx0XHRcdGljb24ucmVhZHkoKTtcblx0XHRcdFx0fTtcblx0XHRcdFx0X2ltZy5zZXRBdHRyaWJ1dGUoJ3NyYycsIGxhc3RJY29uLmdldEF0dHJpYnV0ZSgnaHJlZicpKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdF9oID0gMzI7XG5cdFx0XHRcdF93ID0gMzI7XG5cdFx0XHRcdF9pbWcuaGVpZ2h0ID0gX2g7XG5cdFx0XHRcdF9pbWcud2lkdGggPSBfdztcblx0XHRcdFx0X2NhbnZhcy5oZWlnaHQgPSBfaDtcblx0XHRcdFx0X2NhbnZhcy53aWR0aCA9IF93O1xuXHRcdFx0XHRfY29udGV4dCA9IF9jYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcblx0XHRcdFx0aWNvbi5yZWFkeSgpO1xuXHRcdFx0fVxuXG5cdFx0fTtcblx0XHQvKipcblx0XHQgKiBJY29uIG5hbWVzcGFjZVxuXHRcdCAqL1xuXHRcdHZhciBpY29uID0ge307XG5cdFx0LyoqXG5cdFx0ICogSWNvbiBpcyByZWFkeSAocmVzZXQgaWNvbikgYW5kIHN0YXJ0IGFuaW1hdGlvbiAoaWYgdGhlciBpcyBhbnkpXG5cdFx0ICovXG5cdFx0aWNvbi5yZWFkeSA9IGZ1bmN0aW9uICgpIHtcblx0XHRcdF9yZWFkeSA9IHRydWU7XG5cdFx0XHRpY29uLnJlc2V0KCk7XG5cdFx0XHRfcmVhZHlDYigpO1xuXHRcdH07XG5cdFx0LyoqXG5cdFx0ICogUmVzZXQgaWNvbiB0byBkZWZhdWx0IHN0YXRlXG5cdFx0ICovXG5cdFx0aWNvbi5yZXNldCA9IGZ1bmN0aW9uICgpIHtcblx0XHRcdC8vcmVzZXRcblx0XHRcdGlmICghX3JlYWR5KSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHRcdF9xdWV1ZSA9IFtdO1xuXHRcdFx0X2xhc3RCYWRnZSA9IGZhbHNlO1xuXHRcdFx0X3J1bm5pbmcgPSBmYWxzZTtcblx0XHRcdF9jb250ZXh0LmNsZWFyUmVjdCgwLCAwLCBfdywgX2gpO1xuXHRcdFx0X2NvbnRleHQuZHJhd0ltYWdlKF9pbWcsIDAsIDAsIF93LCBfaCk7XG5cdFx0XHQvL19zdG9wPXRydWU7XG5cdFx0XHRsaW5rLnNldEljb24oX2NhbnZhcyk7XG5cdFx0XHQvL3dlYmNhbSgnc3RvcCcpO1xuXHRcdFx0Ly92aWRlbygnc3RvcCcpO1xuXHRcdFx0d2luZG93LmNsZWFyVGltZW91dChfYW5pbVRpbWVvdXQpO1xuXHRcdFx0d2luZG93LmNsZWFyVGltZW91dChfZHJhd1RpbWVvdXQpO1xuXHRcdH07XG5cdFx0LyoqXG5cdFx0ICogU3RhcnQgYW5pbWF0aW9uXG5cdFx0ICovXG5cdFx0aWNvbi5zdGFydCA9IGZ1bmN0aW9uICgpIHtcblx0XHRcdGlmICghX3JlYWR5IHx8IF9ydW5uaW5nKSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHRcdHZhciBmaW5pc2hlZCA9IGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0X2xhc3RCYWRnZSA9IF9xdWV1ZVswXTtcblx0XHRcdFx0X3J1bm5pbmcgPSBmYWxzZTtcblx0XHRcdFx0aWYgKF9xdWV1ZS5sZW5ndGggPiAwKSB7XG5cdFx0XHRcdFx0X3F1ZXVlLnNoaWZ0KCk7XG5cdFx0XHRcdFx0aWNvbi5zdGFydCgpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXG5cdFx0XHRcdH1cblx0XHRcdH07XG5cdFx0XHRpZiAoX3F1ZXVlLmxlbmd0aCA+IDApIHtcblx0XHRcdFx0X3J1bm5pbmcgPSB0cnVlO1xuXHRcdFx0XHR2YXIgcnVuID0gZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdC8vIGFwcGx5IG9wdGlvbnMgZm9yIHRoaXMgYW5pbWF0aW9uXG5cdFx0XHRcdFx0Wyd0eXBlJywgJ2FuaW1hdGlvbicsICdiZ0NvbG9yJywgJ3RleHRDb2xvcicsICdmb250RmFtaWx5JywgJ2ZvbnRTdHlsZSddLmZvckVhY2goZnVuY3Rpb24gKGEpIHtcblx0XHRcdFx0XHRcdGlmIChhIGluIF9xdWV1ZVswXS5vcHRpb25zKSB7XG5cdFx0XHRcdFx0XHRcdF9vcHRbYV0gPSBfcXVldWVbMF0ub3B0aW9uc1thXTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRhbmltYXRpb24ucnVuKF9xdWV1ZVswXS5vcHRpb25zLCBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0XHRmaW5pc2hlZCgpO1xuXHRcdFx0XHRcdH0sIGZhbHNlKTtcblx0XHRcdFx0fTtcblx0XHRcdFx0aWYgKF9sYXN0QmFkZ2UpIHtcblx0XHRcdFx0XHRhbmltYXRpb24ucnVuKF9sYXN0QmFkZ2Uub3B0aW9ucywgZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdFx0cnVuKCk7XG5cdFx0XHRcdFx0fSwgdHJ1ZSk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0cnVuKCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9O1xuXG5cdFx0LyoqXG5cdFx0ICogQmFkZ2UgdHlwZXNcblx0XHQgKi9cblx0XHR2YXIgdHlwZSA9IHt9O1xuXHRcdHZhciBvcHRpb25zID0gZnVuY3Rpb24gKG9wdCkge1xuXHRcdFx0b3B0Lm4gPSAoKHR5cGVvZiBvcHQubikgPT09ICdudW1iZXInKSA/IE1hdGguYWJzKG9wdC5uIHwgMCkgOiBvcHQubjtcblx0XHRcdG9wdC54ID0gX3cgKiBvcHQueDtcblx0XHRcdG9wdC55ID0gX2ggKiBvcHQueTtcblx0XHRcdG9wdC53ID0gX3cgKiBvcHQudztcblx0XHRcdG9wdC5oID0gX2ggKiBvcHQuaDtcblx0XHRcdG9wdC5sZW4gPSAoXCJcIiArIG9wdC5uKS5sZW5ndGg7XG5cdFx0XHRyZXR1cm4gb3B0O1xuXHRcdH07XG5cdFx0LyoqXG5cdFx0ICogR2VuZXJhdGUgY2lyY2xlXG5cdFx0ICogQHBhcmFtIHtPYmplY3R9IG9wdCBCYWRnZSBvcHRpb25zXG5cdFx0ICovXG5cdFx0dHlwZS5jaXJjbGUgPSBmdW5jdGlvbiAob3B0KSB7XG5cdFx0XHRvcHQgPSBvcHRpb25zKG9wdCk7XG5cdFx0XHR2YXIgbW9yZSA9IGZhbHNlO1xuXHRcdFx0aWYgKG9wdC5sZW4gPT09IDIpIHtcblx0XHRcdFx0b3B0LnggPSBvcHQueCAtIG9wdC53ICogMC40O1xuXHRcdFx0XHRvcHQudyA9IG9wdC53ICogMS40O1xuXHRcdFx0XHRtb3JlID0gdHJ1ZTtcblx0XHRcdH0gZWxzZSBpZiAob3B0LmxlbiA+PSAzKSB7XG5cdFx0XHRcdG9wdC54ID0gb3B0LnggLSBvcHQudyAqIDAuNjU7XG5cdFx0XHRcdG9wdC53ID0gb3B0LncgKiAxLjY1O1xuXHRcdFx0XHRtb3JlID0gdHJ1ZTtcblx0XHRcdH1cblx0XHRcdF9jb250ZXh0LmNsZWFyUmVjdCgwLCAwLCBfdywgX2gpO1xuXHRcdFx0X2NvbnRleHQuZHJhd0ltYWdlKF9pbWcsIDAsIDAsIF93LCBfaCk7XG5cdFx0XHRfY29udGV4dC5iZWdpblBhdGgoKTtcblx0XHRcdF9jb250ZXh0LmZvbnQgPSBfb3B0LmZvbnRTdHlsZSArIFwiIFwiICsgTWF0aC5mbG9vcihvcHQuaCAqIChvcHQubiA+IDk5ID8gMC44NSA6IDEpKSArIFwicHggXCIgKyBfb3B0LmZvbnRGYW1pbHk7XG5cdFx0XHRfY29udGV4dC50ZXh0QWxpZ24gPSAnY2VudGVyJztcblx0XHRcdGlmIChtb3JlKSB7XG5cdFx0XHRcdF9jb250ZXh0Lm1vdmVUbyhvcHQueCArIG9wdC53IC8gMiwgb3B0LnkpO1xuXHRcdFx0XHRfY29udGV4dC5saW5lVG8ob3B0LnggKyBvcHQudyAtIG9wdC5oIC8gMiwgb3B0LnkpO1xuXHRcdFx0XHRfY29udGV4dC5xdWFkcmF0aWNDdXJ2ZVRvKG9wdC54ICsgb3B0LncsIG9wdC55LCBvcHQueCArIG9wdC53LCBvcHQueSArIG9wdC5oIC8gMik7XG5cdFx0XHRcdF9jb250ZXh0LmxpbmVUbyhvcHQueCArIG9wdC53LCBvcHQueSArIG9wdC5oIC0gb3B0LmggLyAyKTtcblx0XHRcdFx0X2NvbnRleHQucXVhZHJhdGljQ3VydmVUbyhvcHQueCArIG9wdC53LCBvcHQueSArIG9wdC5oLCBvcHQueCArIG9wdC53IC0gb3B0LmggLyAyLCBvcHQueSArIG9wdC5oKTtcblx0XHRcdFx0X2NvbnRleHQubGluZVRvKG9wdC54ICsgb3B0LmggLyAyLCBvcHQueSArIG9wdC5oKTtcblx0XHRcdFx0X2NvbnRleHQucXVhZHJhdGljQ3VydmVUbyhvcHQueCwgb3B0LnkgKyBvcHQuaCwgb3B0LngsIG9wdC55ICsgb3B0LmggLSBvcHQuaCAvIDIpO1xuXHRcdFx0XHRfY29udGV4dC5saW5lVG8ob3B0LngsIG9wdC55ICsgb3B0LmggLyAyKTtcblx0XHRcdFx0X2NvbnRleHQucXVhZHJhdGljQ3VydmVUbyhvcHQueCwgb3B0LnksIG9wdC54ICsgb3B0LmggLyAyLCBvcHQueSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRfY29udGV4dC5hcmMob3B0LnggKyBvcHQudyAvIDIsIG9wdC55ICsgb3B0LmggLyAyLCBvcHQuaCAvIDIsIDAsIDIgKiBNYXRoLlBJKTtcblx0XHRcdH1cblx0XHRcdF9jb250ZXh0LmZpbGxTdHlsZSA9ICdyZ2JhKCcgKyBfb3B0LmJnQ29sb3IuciArICcsJyArIF9vcHQuYmdDb2xvci5nICsgJywnICsgX29wdC5iZ0NvbG9yLmIgKyAnLCcgKyBvcHQubyArICcpJztcblx0XHRcdF9jb250ZXh0LmZpbGwoKTtcblx0XHRcdF9jb250ZXh0LmNsb3NlUGF0aCgpO1xuXHRcdFx0X2NvbnRleHQuYmVnaW5QYXRoKCk7XG5cdFx0XHRfY29udGV4dC5zdHJva2UoKTtcblx0XHRcdF9jb250ZXh0LmZpbGxTdHlsZSA9ICdyZ2JhKCcgKyBfb3B0LnRleHRDb2xvci5yICsgJywnICsgX29wdC50ZXh0Q29sb3IuZyArICcsJyArIF9vcHQudGV4dENvbG9yLmIgKyAnLCcgKyBvcHQubyArICcpJztcblx0XHRcdC8vX2NvbnRleHQuZmlsbFRleHQoKG1vcmUpID8gJzkrJyA6IG9wdC5uLCBNYXRoLmZsb29yKG9wdC54ICsgb3B0LncgLyAyKSwgTWF0aC5mbG9vcihvcHQueSArIG9wdC5oIC0gb3B0LmggKiAwLjE1KSk7XG5cdFx0XHRpZiAoKHR5cGVvZiBvcHQubikgPT09ICdudW1iZXInICYmIG9wdC5uID4gOTk5KSB7XG5cdFx0XHRcdF9jb250ZXh0LmZpbGxUZXh0KCgob3B0Lm4gPiA5OTk5KSA/IDkgOiBNYXRoLmZsb29yKG9wdC5uIC8gMTAwMCkpICsgJ2srJywgTWF0aC5mbG9vcihvcHQueCArIG9wdC53IC8gMiksIE1hdGguZmxvb3Iob3B0LnkgKyBvcHQuaCAtIG9wdC5oICogMC4yKSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRfY29udGV4dC5maWxsVGV4dChvcHQubiwgTWF0aC5mbG9vcihvcHQueCArIG9wdC53IC8gMiksIE1hdGguZmxvb3Iob3B0LnkgKyBvcHQuaCAtIG9wdC5oICogMC4xNSkpO1xuXHRcdFx0fVxuXHRcdFx0X2NvbnRleHQuY2xvc2VQYXRoKCk7XG5cdFx0fTtcblx0XHQvKipcblx0XHQgKiBHZW5lcmF0ZSByZWN0YW5nbGVcblx0XHQgKiBAcGFyYW0ge09iamVjdH0gb3B0IEJhZGdlIG9wdGlvbnNcblx0XHQgKi9cblx0XHR0eXBlLnJlY3RhbmdsZSA9IGZ1bmN0aW9uIChvcHQpIHtcblx0XHRcdG9wdCA9IG9wdGlvbnMob3B0KTtcblx0XHRcdHZhciBtb3JlID0gZmFsc2U7XG5cdFx0XHRpZiAob3B0LmxlbiA9PT0gMikge1xuXHRcdFx0XHRvcHQueCA9IG9wdC54IC0gb3B0LncgKiAwLjQ7XG5cdFx0XHRcdG9wdC53ID0gb3B0LncgKiAxLjQ7XG5cdFx0XHRcdG1vcmUgPSB0cnVlO1xuXHRcdFx0fSBlbHNlIGlmIChvcHQubGVuID49IDMpIHtcblx0XHRcdFx0b3B0LnggPSBvcHQueCAtIG9wdC53ICogMC42NTtcblx0XHRcdFx0b3B0LncgPSBvcHQudyAqIDEuNjU7XG5cdFx0XHRcdG1vcmUgPSB0cnVlO1xuXHRcdFx0fVxuXHRcdFx0X2NvbnRleHQuY2xlYXJSZWN0KDAsIDAsIF93LCBfaCk7XG5cdFx0XHRfY29udGV4dC5kcmF3SW1hZ2UoX2ltZywgMCwgMCwgX3csIF9oKTtcblx0XHRcdF9jb250ZXh0LmJlZ2luUGF0aCgpO1xuXHRcdFx0X2NvbnRleHQuZm9udCA9IF9vcHQuZm9udFN0eWxlICsgXCIgXCIgKyBNYXRoLmZsb29yKG9wdC5oICogKG9wdC5uID4gOTkgPyAwLjkgOiAxKSkgKyBcInB4IFwiICsgX29wdC5mb250RmFtaWx5O1xuXHRcdFx0X2NvbnRleHQudGV4dEFsaWduID0gJ2NlbnRlcic7XG5cdFx0XHRfY29udGV4dC5maWxsU3R5bGUgPSAncmdiYSgnICsgX29wdC5iZ0NvbG9yLnIgKyAnLCcgKyBfb3B0LmJnQ29sb3IuZyArICcsJyArIF9vcHQuYmdDb2xvci5iICsgJywnICsgb3B0Lm8gKyAnKSc7XG5cdFx0XHRfY29udGV4dC5maWxsUmVjdChvcHQueCwgb3B0LnksIG9wdC53LCBvcHQuaCk7XG5cdFx0XHRfY29udGV4dC5maWxsU3R5bGUgPSAncmdiYSgnICsgX29wdC50ZXh0Q29sb3IuciArICcsJyArIF9vcHQudGV4dENvbG9yLmcgKyAnLCcgKyBfb3B0LnRleHRDb2xvci5iICsgJywnICsgb3B0Lm8gKyAnKSc7XG5cdFx0XHQvL19jb250ZXh0LmZpbGxUZXh0KChtb3JlKSA/ICc5KycgOiBvcHQubiwgTWF0aC5mbG9vcihvcHQueCArIG9wdC53IC8gMiksIE1hdGguZmxvb3Iob3B0LnkgKyBvcHQuaCAtIG9wdC5oICogMC4xNSkpO1xuXHRcdFx0aWYgKCh0eXBlb2Ygb3B0Lm4pID09PSAnbnVtYmVyJyAmJiBvcHQubiA+IDk5OSkge1xuXHRcdFx0XHRfY29udGV4dC5maWxsVGV4dCgoKG9wdC5uID4gOTk5OSkgPyA5IDogTWF0aC5mbG9vcihvcHQubiAvIDEwMDApKSArICdrKycsIE1hdGguZmxvb3Iob3B0LnggKyBvcHQudyAvIDIpLCBNYXRoLmZsb29yKG9wdC55ICsgb3B0LmggLSBvcHQuaCAqIDAuMikpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0X2NvbnRleHQuZmlsbFRleHQob3B0Lm4sIE1hdGguZmxvb3Iob3B0LnggKyBvcHQudyAvIDIpLCBNYXRoLmZsb29yKG9wdC55ICsgb3B0LmggLSBvcHQuaCAqIDAuMTUpKTtcblx0XHRcdH1cblx0XHRcdF9jb250ZXh0LmNsb3NlUGF0aCgpO1xuXHRcdH07XG5cblx0XHQvKipcblx0XHQgKiBTZXQgYmFkZ2Vcblx0XHQgKi9cblx0XHR2YXIgYmFkZ2UgPSBmdW5jdGlvbiAobnVtYmVyLCBvcHRzKSB7XG5cdFx0XHRvcHRzID0gKCh0eXBlb2Ygb3B0cykgPT09ICdzdHJpbmcnID8ge1xuXHRcdFx0XHRhbmltYXRpb246IG9wdHNcblx0XHRcdH0gOiBvcHRzKSB8fCB7fTtcblx0XHRcdF9yZWFkeUNiID0gZnVuY3Rpb24gKCkge1xuXHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdGlmICh0eXBlb2YgKG51bWJlcikgPT09ICdudW1iZXInID8gKG51bWJlciA+IDApIDogKG51bWJlciAhPT0gJycpKSB7XG5cdFx0XHRcdFx0XHR2YXIgcSA9IHtcblx0XHRcdFx0XHRcdFx0dHlwZTogJ2JhZGdlJyxcblx0XHRcdFx0XHRcdFx0b3B0aW9uczoge1xuXHRcdFx0XHRcdFx0XHRcdG46IG51bWJlclxuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0aWYgKCdhbmltYXRpb24nIGluIG9wdHMgJiYgYW5pbWF0aW9uLnR5cGVzWycnICsgb3B0cy5hbmltYXRpb25dKSB7XG5cdFx0XHRcdFx0XHRcdHEub3B0aW9ucy5hbmltYXRpb24gPSAnJyArIG9wdHMuYW5pbWF0aW9uO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0aWYgKCd0eXBlJyBpbiBvcHRzICYmIHR5cGVbJycgKyBvcHRzLnR5cGVdKSB7XG5cdFx0XHRcdFx0XHRcdHEub3B0aW9ucy50eXBlID0gJycgKyBvcHRzLnR5cGU7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRbJ2JnQ29sb3InLCAndGV4dENvbG9yJ10uZm9yRWFjaChmdW5jdGlvbiAobykge1xuXHRcdFx0XHRcdFx0XHRpZiAobyBpbiBvcHRzKSB7XG5cdFx0XHRcdFx0XHRcdFx0cS5vcHRpb25zW29dID0gaGV4VG9SZ2Iob3B0c1tvXSk7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdFx0Wydmb250U3R5bGUnLCAnZm9udEZhbWlseSddLmZvckVhY2goZnVuY3Rpb24gKG8pIHtcblx0XHRcdFx0XHRcdFx0aWYgKG8gaW4gb3B0cykge1xuXHRcdFx0XHRcdFx0XHRcdHEub3B0aW9uc1tvXSA9IG9wdHNbb107XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdFx0X3F1ZXVlLnB1c2gocSk7XG5cdFx0XHRcdFx0XHRpZiAoX3F1ZXVlLmxlbmd0aCA+IDEwMCkge1xuXHRcdFx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ1RvbyBtYW55IGJhZGdlcyByZXF1ZXN0cyBpbiBxdWV1ZS4nKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGljb24uc3RhcnQoKTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0aWNvbi5yZXNldCgpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSBjYXRjaCAoZSkge1xuXHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcignRXJyb3Igc2V0dGluZyBiYWRnZS4gTWVzc2FnZTogJyArIGUubWVzc2FnZSk7XG5cdFx0XHRcdH1cblx0XHRcdH07XG5cdFx0XHRpZiAoX3JlYWR5KSB7XG5cdFx0XHRcdF9yZWFkeUNiKCk7XG5cdFx0XHR9XG5cdFx0fTtcblxuXHRcdHZhciBzZXRPcHQgPSBmdW5jdGlvbiAoa2V5LCB2YWx1ZSkge1xuXHRcdFx0dmFyIG9wdHMgPSBrZXk7XG5cdFx0XHRpZiAoISh2YWx1ZSA9PSBudWxsICYmIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChrZXkpID09ICdbb2JqZWN0IE9iamVjdF0nKSkge1xuXHRcdFx0XHRvcHRzID0ge307XG5cdFx0XHRcdG9wdHNba2V5XSA9IHZhbHVlO1xuXHRcdFx0fVxuXG5cdFx0XHR2YXIga2V5cyA9IE9iamVjdC5rZXlzKG9wdHMpO1xuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdGlmIChrZXlzW2ldID09ICdiZ0NvbG9yJyB8fCBrZXlzW2ldID09ICd0ZXh0Q29sb3InKSB7XG5cdFx0XHRcdFx0X29wdFtrZXlzW2ldXSA9IGhleFRvUmdiKG9wdHNba2V5c1tpXV0pO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdF9vcHRba2V5c1tpXV0gPSBvcHRzW2tleXNbaV1dO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdF9xdWV1ZS5wdXNoKF9sYXN0QmFkZ2UpO1xuXHRcdFx0aWNvbi5zdGFydCgpO1xuXHRcdH07XG5cblx0XHR2YXIgbGluayA9IHt9O1xuXHRcdC8qKlxuXHRcdCAqIEdldCBpY29ucyBmcm9tIEhFQUQgdGFnIG9yIGNyZWF0ZSBhIG5ldyA8bGluaz4gZWxlbWVudFxuXHRcdCAqL1xuXHRcdGxpbmsuZ2V0SWNvbnMgPSBmdW5jdGlvbiAoKSB7XG5cdFx0XHR2YXIgZWxtcyA9IFtdO1xuXHRcdFx0Ly9nZXQgbGluayBlbGVtZW50XG5cdFx0XHR2YXIgZ2V0TGlua3MgPSBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdHZhciBpY29ucyA9IFtdO1xuXHRcdFx0XHR2YXIgbGlua3MgPSBfZG9jLmdldEVsZW1lbnRzQnlUYWdOYW1lKCdoZWFkJylbMF0uZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2xpbmsnKTtcblx0XHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBsaW5rcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRcdGlmICgoLyhefFxccylpY29uKFxcc3wkKS9pKS50ZXN0KGxpbmtzW2ldLmdldEF0dHJpYnV0ZSgncmVsJykpKSB7XG5cdFx0XHRcdFx0XHRpY29ucy5wdXNoKGxpbmtzW2ldKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdFx0cmV0dXJuIGljb25zO1xuXHRcdFx0fTtcblx0XHRcdGlmIChfb3B0LmVsZW1lbnQpIHtcblx0XHRcdFx0ZWxtcyA9IFtfb3B0LmVsZW1lbnRdO1xuXHRcdFx0fSBlbHNlIGlmIChfb3B0LmVsZW1lbnRJZCkge1xuXHRcdFx0XHQvL2lmIGltZyBlbGVtZW50IGlkZW50aWZpZWQgYnkgZWxlbWVudElkXG5cdFx0XHRcdGVsbXMgPSBbX2RvYy5nZXRFbGVtZW50QnlJZChfb3B0LmVsZW1lbnRJZCldO1xuXHRcdFx0XHRlbG1zWzBdLnNldEF0dHJpYnV0ZSgnaHJlZicsIGVsbXNbMF0uZ2V0QXR0cmlidXRlKCdzcmMnKSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQvL2lmIGxpbmsgZWxlbWVudFxuXHRcdFx0XHRlbG1zID0gZ2V0TGlua3MoKTtcblx0XHRcdFx0aWYgKGVsbXMubGVuZ3RoID09PSAwKSB7XG5cdFx0XHRcdFx0ZWxtcyA9IFtfZG9jLmNyZWF0ZUVsZW1lbnQoJ2xpbmsnKV07XG5cdFx0XHRcdFx0ZWxtc1swXS5zZXRBdHRyaWJ1dGUoJ3JlbCcsICdpY29uJyk7XG5cdFx0XHRcdFx0X2RvYy5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaGVhZCcpWzBdLmFwcGVuZENoaWxkKGVsbXNbMF0pO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRlbG1zLmZvckVhY2goZnVuY3Rpb24oaXRlbSkge1xuXHRcdFx0XHRpdGVtLnNldEF0dHJpYnV0ZSgndHlwZScsICdpbWFnZS9wbmcnKTtcblx0XHRcdH0pO1xuXHRcdFx0cmV0dXJuIGVsbXM7XG5cdFx0fTtcblx0XHRsaW5rLnNldEljb24gPSBmdW5jdGlvbiAoY2FudmFzKSB7XG5cdFx0XHR2YXIgdXJsID0gY2FudmFzLnRvRGF0YVVSTCgnaW1hZ2UvcG5nJyk7XG5cdFx0XHRsaW5rLnNldEljb25TcmModXJsKTtcblx0XHR9O1xuXHRcdGxpbmsuc2V0SWNvblNyYyA9IGZ1bmN0aW9uICh1cmwpIHtcblx0XHRcdGlmIChfb3B0LmRhdGFVcmwpIHtcblx0XHRcdFx0Ly9pZiB1c2luZyBjdXN0b20gZXhwb3J0ZXJcblx0XHRcdFx0X29wdC5kYXRhVXJsKHVybCk7XG5cdFx0XHR9XG5cdFx0XHRpZiAoX29wdC5lbGVtZW50KSB7XG5cdFx0XHRcdF9vcHQuZWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2hyZWYnLCB1cmwpO1xuXHRcdFx0XHRfb3B0LmVsZW1lbnQuc2V0QXR0cmlidXRlKCdzcmMnLCB1cmwpO1xuXHRcdFx0fSBlbHNlIGlmIChfb3B0LmVsZW1lbnRJZCkge1xuXHRcdFx0XHQvL2lmIGlzIGF0dGFjaGVkIHRvIGVsZW1lbnQgKGltYWdlKVxuXHRcdFx0XHR2YXIgZWxtID0gX2RvYy5nZXRFbGVtZW50QnlJZChfb3B0LmVsZW1lbnRJZCk7XG5cdFx0XHRcdGVsbS5zZXRBdHRyaWJ1dGUoJ2hyZWYnLCB1cmwpO1xuXHRcdFx0XHRlbG0uc2V0QXR0cmlidXRlKCdzcmMnLCB1cmwpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Ly9pZiBpcyBhdHRhY2hlZCB0byBmYXYgaWNvblxuXHRcdFx0XHRpZiAoX2Jyb3dzZXIuZmYgfHwgX2Jyb3dzZXIub3BlcmEpIHtcblx0XHRcdFx0XHQvL2ZvciBGRiB3ZSBuZWVkIHRvIFwicmVjcmVhdGVcIiBlbGVtZW50LCBhdGFjaCB0byBkb20gYW5kIHJlbW92ZSBvbGQgPGxpbms+XG5cdFx0XHRcdFx0Ly92YXIgb3JpZ2luYWxUeXBlID0gX29yaWcuZ2V0QXR0cmlidXRlKCdyZWwnKTtcblx0XHRcdFx0XHR2YXIgb2xkID0gX29yaWdbX29yaWcubGVuZ3RoIC0gMV07XG5cdFx0XHRcdFx0dmFyIG5ld0ljb24gPSBfZG9jLmNyZWF0ZUVsZW1lbnQoJ2xpbmsnKTtcblx0XHRcdFx0XHRfb3JpZyA9IFtuZXdJY29uXTtcblx0XHRcdFx0XHQvL19vcmlnLnNldEF0dHJpYnV0ZSgncmVsJywgb3JpZ2luYWxUeXBlKTtcblx0XHRcdFx0XHRpZiAoX2Jyb3dzZXIub3BlcmEpIHtcblx0XHRcdFx0XHRcdG5ld0ljb24uc2V0QXR0cmlidXRlKCdyZWwnLCAnaWNvbicpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRuZXdJY29uLnNldEF0dHJpYnV0ZSgncmVsJywgJ2ljb24nKTtcblx0XHRcdFx0XHRuZXdJY29uLnNldEF0dHJpYnV0ZSgndHlwZScsICdpbWFnZS9wbmcnKTtcblx0XHRcdFx0XHRfZG9jLmdldEVsZW1lbnRzQnlUYWdOYW1lKCdoZWFkJylbMF0uYXBwZW5kQ2hpbGQobmV3SWNvbik7XG5cdFx0XHRcdFx0bmV3SWNvbi5zZXRBdHRyaWJ1dGUoJ2hyZWYnLCB1cmwpO1xuXHRcdFx0XHRcdGlmIChvbGQucGFyZW50Tm9kZSkge1xuXHRcdFx0XHRcdFx0b2xkLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQob2xkKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0X29yaWcuZm9yRWFjaChmdW5jdGlvbihpY29uKSB7XG5cdFx0XHRcdFx0XHRpY29uLnNldEF0dHJpYnV0ZSgnaHJlZicsIHVybCk7XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9O1xuXG5cdFx0Ly9odHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzU2MjM4MzgvcmdiLXRvLWhleC1hbmQtaGV4LXRvLXJnYiNhbnN3ZXItNTYyNDEzOVxuXHRcdC8vSEVYIHRvIFJHQiBjb252ZXJ0b3Jcblx0XHRmdW5jdGlvbiBoZXhUb1JnYihoZXgpIHtcblx0XHRcdHZhciBzaG9ydGhhbmRSZWdleCA9IC9eIz8oW2EtZlxcZF0pKFthLWZcXGRdKShbYS1mXFxkXSkkL2k7XG5cdFx0XHRoZXggPSBoZXgucmVwbGFjZShzaG9ydGhhbmRSZWdleCwgZnVuY3Rpb24gKG0sIHIsIGcsIGIpIHtcblx0XHRcdFx0cmV0dXJuIHIgKyByICsgZyArIGcgKyBiICsgYjtcblx0XHRcdH0pO1xuXHRcdFx0dmFyIHJlc3VsdCA9IC9eIz8oW2EtZlxcZF17Mn0pKFthLWZcXGRdezJ9KShbYS1mXFxkXXsyfSkkL2kuZXhlYyhoZXgpO1xuXHRcdFx0cmV0dXJuIHJlc3VsdCA/IHtcblx0XHRcdFx0cjogcGFyc2VJbnQocmVzdWx0WzFdLCAxNiksXG5cdFx0XHRcdGc6IHBhcnNlSW50KHJlc3VsdFsyXSwgMTYpLFxuXHRcdFx0XHRiOiBwYXJzZUludChyZXN1bHRbM10sIDE2KVxuXHRcdFx0fSA6IGZhbHNlO1xuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIE1lcmdlIG9wdGlvbnNcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBtZXJnZShkZWYsIG9wdCkge1xuXHRcdFx0dmFyIG1lcmdlZE9wdCA9IHt9O1xuXHRcdFx0dmFyIGF0dHJuYW1lO1xuXHRcdFx0Zm9yIChhdHRybmFtZSBpbiBkZWYpIHtcblx0XHRcdFx0bWVyZ2VkT3B0W2F0dHJuYW1lXSA9IGRlZlthdHRybmFtZV07XG5cdFx0XHR9XG5cdFx0XHRmb3IgKGF0dHJuYW1lIGluIG9wdCkge1xuXHRcdFx0XHRtZXJnZWRPcHRbYXR0cm5hbWVdID0gb3B0W2F0dHJuYW1lXTtcblx0XHRcdH1cblx0XHRcdHJldHVybiBtZXJnZWRPcHQ7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogQ3Jvc3MtYnJvd3NlciBwYWdlIHZpc2liaWxpdHkgc2hpbVxuXHRcdCAqIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMTI1MzY1NjIvZGV0ZWN0LXdoZXRoZXItYS13aW5kb3ctaXMtdmlzaWJsZVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIGlzUGFnZUhpZGRlbigpIHtcblx0XHRcdHJldHVybiBfZG9jLmhpZGRlbiB8fCBfZG9jLm1zSGlkZGVuIHx8IF9kb2Mud2Via2l0SGlkZGVuIHx8IF9kb2MubW96SGlkZGVuO1xuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIEBuYW1lc3BhY2UgYW5pbWF0aW9uXG5cdFx0ICovXG5cdFx0dmFyIGFuaW1hdGlvbiA9IHt9O1xuXHRcdC8qKlxuXHRcdCAqIEFuaW1hdGlvbiBcImZyYW1lXCIgZHVyYXRpb25cblx0XHQgKi9cblx0XHRhbmltYXRpb24uZHVyYXRpb24gPSA0MDtcblx0XHQvKipcblx0XHQgKiBBbmltYXRpb24gdHlwZXMgKG5vbmUsZmFkZSxwb3Asc2xpZGUpXG5cdFx0ICovXG5cdFx0YW5pbWF0aW9uLnR5cGVzID0ge307XG5cdFx0YW5pbWF0aW9uLnR5cGVzLmZhZGUgPSBbe1xuXHRcdFx0eDogMC40LFxuXHRcdFx0eTogMC40LFxuXHRcdFx0dzogMC42LFxuXHRcdFx0aDogMC42LFxuXHRcdFx0bzogMC4wXG5cdFx0fSwge1xuXHRcdFx0XHR4OiAwLjQsXG5cdFx0XHRcdHk6IDAuNCxcblx0XHRcdFx0dzogMC42LFxuXHRcdFx0XHRoOiAwLjYsXG5cdFx0XHRcdG86IDAuMVxuXHRcdFx0fSwge1xuXHRcdFx0XHR4OiAwLjQsXG5cdFx0XHRcdHk6IDAuNCxcblx0XHRcdFx0dzogMC42LFxuXHRcdFx0XHRoOiAwLjYsXG5cdFx0XHRcdG86IDAuMlxuXHRcdFx0fSwge1xuXHRcdFx0XHR4OiAwLjQsXG5cdFx0XHRcdHk6IDAuNCxcblx0XHRcdFx0dzogMC42LFxuXHRcdFx0XHRoOiAwLjYsXG5cdFx0XHRcdG86IDAuM1xuXHRcdFx0fSwge1xuXHRcdFx0XHR4OiAwLjQsXG5cdFx0XHRcdHk6IDAuNCxcblx0XHRcdFx0dzogMC42LFxuXHRcdFx0XHRoOiAwLjYsXG5cdFx0XHRcdG86IDAuNFxuXHRcdFx0fSwge1xuXHRcdFx0XHR4OiAwLjQsXG5cdFx0XHRcdHk6IDAuNCxcblx0XHRcdFx0dzogMC42LFxuXHRcdFx0XHRoOiAwLjYsXG5cdFx0XHRcdG86IDAuNVxuXHRcdFx0fSwge1xuXHRcdFx0XHR4OiAwLjQsXG5cdFx0XHRcdHk6IDAuNCxcblx0XHRcdFx0dzogMC42LFxuXHRcdFx0XHRoOiAwLjYsXG5cdFx0XHRcdG86IDAuNlxuXHRcdFx0fSwge1xuXHRcdFx0XHR4OiAwLjQsXG5cdFx0XHRcdHk6IDAuNCxcblx0XHRcdFx0dzogMC42LFxuXHRcdFx0XHRoOiAwLjYsXG5cdFx0XHRcdG86IDAuN1xuXHRcdFx0fSwge1xuXHRcdFx0XHR4OiAwLjQsXG5cdFx0XHRcdHk6IDAuNCxcblx0XHRcdFx0dzogMC42LFxuXHRcdFx0XHRoOiAwLjYsXG5cdFx0XHRcdG86IDAuOFxuXHRcdFx0fSwge1xuXHRcdFx0XHR4OiAwLjQsXG5cdFx0XHRcdHk6IDAuNCxcblx0XHRcdFx0dzogMC42LFxuXHRcdFx0XHRoOiAwLjYsXG5cdFx0XHRcdG86IDAuOVxuXHRcdFx0fSwge1xuXHRcdFx0XHR4OiAwLjQsXG5cdFx0XHRcdHk6IDAuNCxcblx0XHRcdFx0dzogMC42LFxuXHRcdFx0XHRoOiAwLjYsXG5cdFx0XHRcdG86IDEuMFxuXHRcdFx0fV07XG5cdFx0YW5pbWF0aW9uLnR5cGVzLm5vbmUgPSBbe1xuXHRcdFx0eDogMC40LFxuXHRcdFx0eTogMC40LFxuXHRcdFx0dzogMC42LFxuXHRcdFx0aDogMC42LFxuXHRcdFx0bzogMVxuXHRcdH1dO1xuXHRcdGFuaW1hdGlvbi50eXBlcy5wb3AgPSBbe1xuXHRcdFx0eDogMSxcblx0XHRcdHk6IDEsXG5cdFx0XHR3OiAwLFxuXHRcdFx0aDogMCxcblx0XHRcdG86IDFcblx0XHR9LCB7XG5cdFx0XHRcdHg6IDAuOSxcblx0XHRcdFx0eTogMC45LFxuXHRcdFx0XHR3OiAwLjEsXG5cdFx0XHRcdGg6IDAuMSxcblx0XHRcdFx0bzogMVxuXHRcdFx0fSwge1xuXHRcdFx0XHR4OiAwLjgsXG5cdFx0XHRcdHk6IDAuOCxcblx0XHRcdFx0dzogMC4yLFxuXHRcdFx0XHRoOiAwLjIsXG5cdFx0XHRcdG86IDFcblx0XHRcdH0sIHtcblx0XHRcdFx0eDogMC43LFxuXHRcdFx0XHR5OiAwLjcsXG5cdFx0XHRcdHc6IDAuMyxcblx0XHRcdFx0aDogMC4zLFxuXHRcdFx0XHRvOiAxXG5cdFx0XHR9LCB7XG5cdFx0XHRcdHg6IDAuNixcblx0XHRcdFx0eTogMC42LFxuXHRcdFx0XHR3OiAwLjQsXG5cdFx0XHRcdGg6IDAuNCxcblx0XHRcdFx0bzogMVxuXHRcdFx0fSwge1xuXHRcdFx0XHR4OiAwLjUsXG5cdFx0XHRcdHk6IDAuNSxcblx0XHRcdFx0dzogMC41LFxuXHRcdFx0XHRoOiAwLjUsXG5cdFx0XHRcdG86IDFcblx0XHRcdH0sIHtcblx0XHRcdFx0eDogMC40LFxuXHRcdFx0XHR5OiAwLjQsXG5cdFx0XHRcdHc6IDAuNixcblx0XHRcdFx0aDogMC42LFxuXHRcdFx0XHRvOiAxXG5cdFx0XHR9XTtcblx0XHRhbmltYXRpb24udHlwZXMucG9wRmFkZSA9IFt7XG5cdFx0XHR4OiAwLjc1LFxuXHRcdFx0eTogMC43NSxcblx0XHRcdHc6IDAsXG5cdFx0XHRoOiAwLFxuXHRcdFx0bzogMFxuXHRcdH0sIHtcblx0XHRcdFx0eDogMC42NSxcblx0XHRcdFx0eTogMC42NSxcblx0XHRcdFx0dzogMC4xLFxuXHRcdFx0XHRoOiAwLjEsXG5cdFx0XHRcdG86IDAuMlxuXHRcdFx0fSwge1xuXHRcdFx0XHR4OiAwLjYsXG5cdFx0XHRcdHk6IDAuNixcblx0XHRcdFx0dzogMC4yLFxuXHRcdFx0XHRoOiAwLjIsXG5cdFx0XHRcdG86IDAuNFxuXHRcdFx0fSwge1xuXHRcdFx0XHR4OiAwLjU1LFxuXHRcdFx0XHR5OiAwLjU1LFxuXHRcdFx0XHR3OiAwLjMsXG5cdFx0XHRcdGg6IDAuMyxcblx0XHRcdFx0bzogMC42XG5cdFx0XHR9LCB7XG5cdFx0XHRcdHg6IDAuNTAsXG5cdFx0XHRcdHk6IDAuNTAsXG5cdFx0XHRcdHc6IDAuNCxcblx0XHRcdFx0aDogMC40LFxuXHRcdFx0XHRvOiAwLjhcblx0XHRcdH0sIHtcblx0XHRcdFx0eDogMC40NSxcblx0XHRcdFx0eTogMC40NSxcblx0XHRcdFx0dzogMC41LFxuXHRcdFx0XHRoOiAwLjUsXG5cdFx0XHRcdG86IDAuOVxuXHRcdFx0fSwge1xuXHRcdFx0XHR4OiAwLjQsXG5cdFx0XHRcdHk6IDAuNCxcblx0XHRcdFx0dzogMC42LFxuXHRcdFx0XHRoOiAwLjYsXG5cdFx0XHRcdG86IDFcblx0XHRcdH1dO1xuXHRcdGFuaW1hdGlvbi50eXBlcy5zbGlkZSA9IFt7XG5cdFx0XHR4OiAwLjQsXG5cdFx0XHR5OiAxLFxuXHRcdFx0dzogMC42LFxuXHRcdFx0aDogMC42LFxuXHRcdFx0bzogMVxuXHRcdH0sIHtcblx0XHRcdFx0eDogMC40LFxuXHRcdFx0XHR5OiAwLjksXG5cdFx0XHRcdHc6IDAuNixcblx0XHRcdFx0aDogMC42LFxuXHRcdFx0XHRvOiAxXG5cdFx0XHR9LCB7XG5cdFx0XHRcdHg6IDAuNCxcblx0XHRcdFx0eTogMC45LFxuXHRcdFx0XHR3OiAwLjYsXG5cdFx0XHRcdGg6IDAuNixcblx0XHRcdFx0bzogMVxuXHRcdFx0fSwge1xuXHRcdFx0XHR4OiAwLjQsXG5cdFx0XHRcdHk6IDAuOCxcblx0XHRcdFx0dzogMC42LFxuXHRcdFx0XHRoOiAwLjYsXG5cdFx0XHRcdG86IDFcblx0XHRcdH0sIHtcblx0XHRcdFx0eDogMC40LFxuXHRcdFx0XHR5OiAwLjcsXG5cdFx0XHRcdHc6IDAuNixcblx0XHRcdFx0aDogMC42LFxuXHRcdFx0XHRvOiAxXG5cdFx0XHR9LCB7XG5cdFx0XHRcdHg6IDAuNCxcblx0XHRcdFx0eTogMC42LFxuXHRcdFx0XHR3OiAwLjYsXG5cdFx0XHRcdGg6IDAuNixcblx0XHRcdFx0bzogMVxuXHRcdFx0fSwge1xuXHRcdFx0XHR4OiAwLjQsXG5cdFx0XHRcdHk6IDAuNSxcblx0XHRcdFx0dzogMC42LFxuXHRcdFx0XHRoOiAwLjYsXG5cdFx0XHRcdG86IDFcblx0XHRcdH0sIHtcblx0XHRcdFx0eDogMC40LFxuXHRcdFx0XHR5OiAwLjQsXG5cdFx0XHRcdHc6IDAuNixcblx0XHRcdFx0aDogMC42LFxuXHRcdFx0XHRvOiAxXG5cdFx0XHR9XTtcblx0XHQvKipcblx0XHQgKiBSdW4gYW5pbWF0aW9uXG5cdFx0ICogQHBhcmFtIHtPYmplY3R9IG9wdCBBbmltYXRpb24gb3B0aW9uc1xuXHRcdCAqIEBwYXJhbSB7T2JqZWN0fSBjYiBDYWxsYWJhayBhZnRlciBhbGwgc3RlcHMgYXJlIGRvbmVcblx0XHQgKiBAcGFyYW0ge09iamVjdH0gcmV2ZXJ0IFJldmVyc2Ugb3JkZXI/IHRydWV8ZmFsc2Vcblx0XHQgKiBAcGFyYW0ge09iamVjdH0gc3RlcCBPcHRpb25hbCBzdGVwIG51bWJlciAoZnJhbWUgYnVtYmVyKVxuXHRcdCAqL1xuXHRcdGFuaW1hdGlvbi5ydW4gPSBmdW5jdGlvbiAob3B0LCBjYiwgcmV2ZXJ0LCBzdGVwKSB7XG5cdFx0XHR2YXIgYW5pbWF0aW9uVHlwZSA9IGFuaW1hdGlvbi50eXBlc1tpc1BhZ2VIaWRkZW4oKSA/ICdub25lJyA6IF9vcHQuYW5pbWF0aW9uXTtcblx0XHRcdGlmIChyZXZlcnQgPT09IHRydWUpIHtcblx0XHRcdFx0c3RlcCA9ICh0eXBlb2Ygc3RlcCAhPT0gJ3VuZGVmaW5lZCcpID8gc3RlcCA6IGFuaW1hdGlvblR5cGUubGVuZ3RoIC0gMTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHN0ZXAgPSAodHlwZW9mIHN0ZXAgIT09ICd1bmRlZmluZWQnKSA/IHN0ZXAgOiAwO1xuXHRcdFx0fVxuXHRcdFx0Y2IgPSAoY2IpID8gY2IgOiBmdW5jdGlvbiAoKSB7XG5cdFx0XHR9O1xuXHRcdFx0aWYgKChzdGVwIDwgYW5pbWF0aW9uVHlwZS5sZW5ndGgpICYmIChzdGVwID49IDApKSB7XG5cdFx0XHRcdHR5cGVbX29wdC50eXBlXShtZXJnZShvcHQsIGFuaW1hdGlvblR5cGVbc3RlcF0pKTtcblx0XHRcdFx0X2FuaW1UaW1lb3V0ID0gc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0aWYgKHJldmVydCkge1xuXHRcdFx0XHRcdFx0c3RlcCA9IHN0ZXAgLSAxO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRzdGVwID0gc3RlcCArIDE7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGFuaW1hdGlvbi5ydW4ob3B0LCBjYiwgcmV2ZXJ0LCBzdGVwKTtcblx0XHRcdFx0fSwgYW5pbWF0aW9uLmR1cmF0aW9uKTtcblxuXHRcdFx0XHRsaW5rLnNldEljb24oX2NhbnZhcyk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRjYigpO1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0fTtcblx0XHQvL2F1dG8gaW5pdFxuXHRcdGluaXQoKTtcblx0XHRyZXR1cm4ge1xuXHRcdFx0YmFkZ2U6IGJhZGdlLFxuXHRcdFx0c2V0T3B0OiBzZXRPcHQsXG5cdFx0XHRyZXNldDogaWNvbi5yZXNldCxcblx0XHRcdGJyb3dzZXI6IHtcblx0XHRcdFx0c3VwcG9ydGVkOiBfYnJvd3Nlci5zdXBwb3J0ZWRcblx0XHRcdH1cblx0XHR9O1xuXHR9KTtcblxuXHQvLyBBTUQgLyBSZXF1aXJlSlNcblx0aWYgKHR5cGVvZiBkZWZpbmUgIT09ICd1bmRlZmluZWQnICYmIGRlZmluZS5hbWQpIHtcblx0XHRkZWZpbmUoW10sIGZ1bmN0aW9uICgpIHtcblx0XHRcdHJldHVybiBGYXZpY287XG5cdFx0fSk7XG5cdH1cblx0Ly8gQ29tbW9uSlNcblx0ZWxzZSBpZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcgJiYgbW9kdWxlLmV4cG9ydHMpIHtcblx0XHRtb2R1bGUuZXhwb3J0cyA9IEZhdmljbztcblx0fVxuXHQvLyBpbmNsdWRlZCBkaXJlY3RseSB2aWEgPHNjcmlwdD4gdGFnXG5cdGVsc2Uge1xuXHRcdHRoaXMuRmF2aWNvID0gRmF2aWNvO1xuXHR9XG5cbn0pKCk7XG4iLCIvLyBpbXBvcnQgKiBhcyBobSBmcm9tICcuLm1vZHVsZXMvaG0uanMnXG52YXIgaG0gPSByZXF1aXJlKCcuL21vZHVsZXMvaG0uanMnKVxuXG52YXIgdDtcbnZhciBpc1RpbWVyR29pbmcgPSBmYWxzZTtcbnZhciBiZWVuV2FybmVkID0gZmFsc2U7XG52YXIgaGFzUHJvbWlzZWRUb1dvcmtXaXRoTWUgPSBmYWxzZTtcblxuZnVuY3Rpb24gaW5pdCgpIHtcbiAgICBobS5ydW4oKTtcbn1cblxud2luZG93Lm9ubG9hZCA9ICgpID0+IGluaXQoKSIsIi8vIE5QTSBtb2R1bGVzXG52YXIgRmF2aWNvID0gcmVxdWlyZSgnZmF2aWNvLmpzLXNsZXZvbWF0Jyk7XG5cbi8vIEdsb2JhbHNcbnZhciB0O1xudmFyIGlzVGltZXJHb2luZyA9IGZhbHNlO1xudmFyIGJlZW5XYXJuZWQgPSBmYWxzZTtcbnZhciBmYXZpY29uID0gbmV3IEZhdmljbyh7XG4gICAgYW5pbWF0aW9uOiAnc2xpZGUnXG59KTtcbnZhciBoYXNQcm9taXNlZFRvV29ya1dpdGhNZTtcblxuZnVuY3Rpb24gcnVuKCkge1xuICAgIC8vIElmIHlvdSBoYXZlbid0IGNvbWUgdG8gdGhpcyBzaXRlIGJlZm9yZSBzZXQgZGVmYXVsdFxuICAgIGlmIChsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnc2JiOnNlZW5NZXNzYWdlJykgPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCdzYmI6c2Vlbk1lc3NhZ2UnLCBmYWxzZSk7XG4gICAgICAgIGhhc1Byb21pc2VkVG9Xb3JrV2l0aE1lID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3NiYjpzZWVuTWVzc2FnZScpXG4gICAgfSBlbHNlIHtcblxuICAgIH1cbiAgICBtZXNzYWdlQnV0dG9uKClcbiAgICAvLyBDaGVjayBoaWRkZW4gc3RhdHVzIGV2ZXJ5IHNlY29uZFxuICAgIHdpbmRvdy5zZXRJbnRlcnZhbChjaGVja1RhYlZpc2liaWxpdHksIDEwMDApO1xufVxuXG5mdW5jdGlvbiBtZXNzYWdlQnV0dG9uKCkge1xuICAgIHZhciBidXR0b24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjaGlkZGVuLWJ1dHRvbicpXG5cbiAgICBidXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgICAgIHZhciBlbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNoaWRkZW4tbWVzc2FnZS1jb250YWluZXInKTtcbiAgICAgICAgZWwuY2xhc3NMaXN0LmFkZCgnbm90LXZpc2libGUnKTtcbiAgICAgICAgLy8gU29tZSB2YXIgZm9yIG5ldmVyIHNob3dpbmcgYWdhaW4uXG4gICAgICAgIGNsZWFyVGltZWRNZXNzYWdlKCk7XG4gICAgICAgIGhhc1Byb21pc2VkVG9Xb3JrV2l0aE1lID0gdHJ1ZTtcbiAgICB9KVxufVxuXG5mdW5jdGlvbiBjaGVja1RhYlZpc2liaWxpdHkoKSB7XG4gICAgdmFyIGhpZGRlbiwgdmlzaWJpbGl0eUNoYW5nZTtcbiAgICBpZiAoIWhhc1Byb21pc2VkVG9Xb3JrV2l0aE1lKSB7XG5cbiAgICAgICAgaWYgKHR5cGVvZiBkb2N1bWVudC5oaWRkZW4gIT09IFwidW5kZWZpbmVkXCIpIHsgLy8gT3BlcmEgMTIuMTAgYW5kIEZpcmVmb3ggMTggYW5kIGxhdGVyIHN1cHBvcnQgXG4gICAgICAgICAgICBoaWRkZW4gPSBcImhpZGRlblwiO1xuICAgICAgICAgICAgdmlzaWJpbGl0eUNoYW5nZSA9IFwidmlzaWJpbGl0eWNoYW5nZVwiO1xuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBkb2N1bWVudC5tc0hpZGRlbiAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgICAgaGlkZGVuID0gXCJtc0hpZGRlblwiO1xuICAgICAgICAgICAgdmlzaWJpbGl0eUNoYW5nZSA9IFwibXN2aXNpYmlsaXR5Y2hhbmdlXCI7XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGRvY3VtZW50LndlYmtpdEhpZGRlbiAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgICAgaGlkZGVuID0gXCJ3ZWJraXRIaWRkZW5cIjtcbiAgICAgICAgICAgIHZpc2liaWxpdHlDaGFuZ2UgPSBcIndlYmtpdHZpc2liaWxpdHljaGFuZ2VcIjtcbiAgICAgICAgfVxuICAgIFxuICAgICAgICBpZiAoZG9jdW1lbnRbaGlkZGVuXSkge1xuICAgICAgICAgICAgdGltZWRNZXNzYWdlKCk7XG4gICAgICAgICAgICAvLyBTZXQgZ3ZhciBvbiB0aGlzIHRvb1xuICAgICAgICAgICAgaXNUaW1lckdvaW5nID0gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIFJlc2V0IFRpbWVyXG4gICAgICAgICAgICBmYXZpY29uLmJhZGdlKDApO1xuICAgICAgICAgICAgaWYgKGlzVGltZXJHb2luZykge1xuICAgICAgICAgICAgICAgIGNsZWFyVGltZWRNZXNzYWdlKClcbiAgICAgICAgICAgICAgICBpc1RpbWVyR29pbmcgPSBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgfVxufTtcblxuZnVuY3Rpb24gdGltZWRNZXNzYWdlKCkge1xuICAgIC8vIDEsODAwIHNlY29uZHMgPT09IDMwIG1pbnV0ZXNcbiAgICB0ID0gd2luZG93LnNldFRpbWVvdXQoc2JiTWVzc2FnZSwgKDE4MDAqMTAwMCkpXG59O1xuXG5mdW5jdGlvbiBjbGVhclRpbWVkTWVzc2FnZSgpIHtcbiAgICB3aW5kb3cuY2xlYXJUaW1lb3V0KHQpO1xufVxuXG5mdW5jdGlvbiBzYmJNZXNzYWdlKCkge1xuICAgIGlmICghYmVlbldhcm5lZCkge1xuICAgICAgICBmYXZpY29uLmJhZGdlKDEpO1xuICAgICAgICB2YXIgZWwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjaGlkZGVuLW1lc3NhZ2UtY29udGFpbmVyJyk7XG4gICAgICAgIGVsLmNsYXNzTGlzdC5yZW1vdmUoJ25vdC12aXNpYmxlJyk7XG4gICAgfVxuICAgIGJlZW5XYXJuZWQgPSB0cnVlO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHsgcnVuIH07Il19
