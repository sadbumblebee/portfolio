(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
/**
 * @license MIT
 * @fileOverview Favico animations
 * @author Miroslav Magda, http://blog.ejci.net
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
 *    position : 'down',
 *    type : 'circle',
 *    animation : 'slide',
 *    dataUrl: function(url){},
 *    win: top
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

			//transform animation
			if (isUp || isLeft) {
				for (var i = 0; i < animation.types['' + _opt.animation].length; i++) {
					var step = animation.types['' + _opt.animation][i];

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

					animation.types['' + _opt.animation][i] = step;
				}
			}
			_opt.type = (type['' + _opt.type]) ? _opt.type : _def.type;

			_orig = link.getIcon();
			//create temp canvas
			_canvas = document.createElement('canvas');
			//create temp image
			_img = document.createElement('img');
			if (_orig.hasAttribute('href')) {
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
				_img.setAttribute('src', _orig.getAttribute('href'));
			} else {
				_img.onload = function () {
					_h = 32;
					_w = 32;
					_img.height = _h;
					_img.width = _w;
					_canvas.height = _h;
					_canvas.width = _w;
					_context = _canvas.getContext('2d');
					icon.ready();
				};
				_img.setAttribute('src', '');
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

		/**
		 * Set image as icon
		 */
		var image = function (imageElement) {
			_readyCb = function () {
				try {
					var w = imageElement.width;
					var h = imageElement.height;
					var newImg = document.createElement('img');
					var ratio = (w / _w < h / _h) ? (w / _w) : (h / _h);
					newImg.setAttribute('crossOrigin', 'anonymous');
					newImg.onload=function(){
						_context.clearRect(0, 0, _w, _h);
						_context.drawImage(newImg, 0, 0, _w, _h);
						link.setIcon(_canvas);
					};
					newImg.setAttribute('src', imageElement.getAttribute('src'));
					newImg.height = (h / ratio);
					newImg.width = (w / ratio);
				} catch (e) {
					throw new Error('Error setting image. Message: ' + e.message);
				}
			};
			if (_ready) {
				_readyCb();
			}
		};
		/**
		 * Set video as icon
		 */
		var video = function (videoElement) {
			_readyCb = function () {
				try {
					if (videoElement === 'stop') {
						_stop = true;
						icon.reset();
						_stop = false;
						return;
					}
					//var w = videoElement.width;
					//var h = videoElement.height;
					//var ratio = (w / _w < h / _h) ? (w / _w) : (h / _h);
					videoElement.addEventListener('play', function () {
						drawVideo(this);
					}, false);

				} catch (e) {
					throw new Error('Error setting video. Message: ' + e.message);
				}
			};
			if (_ready) {
				_readyCb();
			}
		};
		/**
		 * Set video as icon
		 */
		var webcam = function (action) {
			//UR
			if (!window.URL || !window.URL.createObjectURL) {
				window.URL = window.URL || {};
				window.URL.createObjectURL = function (obj) {
					return obj;
				};
			}
			if (_browser.supported) {
				var newVideo = false;
				navigator.getUserMedia = navigator.getUserMedia || navigator.oGetUserMedia || navigator.msGetUserMedia || navigator.mozGetUserMedia || navigator.webkitGetUserMedia;
				_readyCb = function () {
					try {
						if (action === 'stop') {
							_stop = true;
							icon.reset();
							_stop = false;
							return;
						}
						newVideo = document.createElement('video');
						newVideo.width = _w;
						newVideo.height = _h;
						navigator.getUserMedia({
							video: true,
							audio: false
						}, function (stream) {
							newVideo.src = URL.createObjectURL(stream);
							newVideo.play();
							drawVideo(newVideo);
						}, function () {
						});
					} catch (e) {
						throw new Error('Error setting webcam. Message: ' + e.message);
					}
				};
				if (_ready) {
					_readyCb();
				}
			}

		};

		/**
		 * Draw video to context and repeat :)
		 */
		function drawVideo(video) {
			if (video.paused || video.ended || _stop) {
				return false;
			}
			//nasty hack for FF webcam (Thanks to Julian Ćwirko, kontakt@redsunmedia.pl)
			try {
				_context.clearRect(0, 0, _w, _h);
				_context.drawImage(video, 0, 0, _w, _h);
			} catch (e) {

			}
			_drawTimeout = setTimeout(function () {
				drawVideo(video);
			}, animation.duration);
			link.setIcon(_canvas);
		}

		var link = {};
		/**
		 * Get icon from HEAD tag or create a new <link> element
		 */
		link.getIcon = function () {
			var elm = false;
			//get link element
			var getLink = function () {
				var link = _doc.getElementsByTagName('head')[0].getElementsByTagName('link');
				for (var l = link.length, i = (l - 1); i >= 0; i--) {
					if ((/(^|\s)icon(\s|$)/i).test(link[i].getAttribute('rel'))) {
						return link[i];
					}
				}
				return false;
			};
			if (_opt.element) {
				elm = _opt.element;
			} else if (_opt.elementId) {
				//if img element identified by elementId
				elm = _doc.getElementById(_opt.elementId);
				elm.setAttribute('href', elm.getAttribute('src'));
			} else {
				//if link element
				elm = getLink();
				if (elm === false) {
					elm = _doc.createElement('link');
					elm.setAttribute('rel', 'icon');
					_doc.getElementsByTagName('head')[0].appendChild(elm);
				}
			}
			elm.setAttribute('type', 'image/png');
			return elm;
		};
		link.setIcon = function (canvas) {
			var url = canvas.toDataURL('image/png');
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
					var old = _orig;
					_orig = _doc.createElement('link');
					//_orig.setAttribute('rel', originalType);
					if (_browser.opera) {
						_orig.setAttribute('rel', 'icon');
					}
					_orig.setAttribute('rel', 'icon');
					_orig.setAttribute('type', 'image/png');
					_doc.getElementsByTagName('head')[0].appendChild(_orig);
					_orig.setAttribute('href', url);
					if (old.parentNode) {
						old.parentNode.removeChild(old);
					}
				} else {
					_orig.setAttribute('href', url);
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
			video: video,
			image: image,
			webcam: webcam,
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
var Favico = require('favico.js');

// Globals
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
        bindMessageButton()
        // Check hidden status every second
        window.setInterval(checkTabVisibility, 1000);
    }
    
}

function bindMessageButton() {
    var button = document.querySelector('#hidden-button')

    button.addEventListener('click', () => {
        var el = document.querySelector('#hidden-message-container');
        el.classList.add('not-visible');
        // Some var for never showing again.
        clearTimedMessage();
        hasPromisedToWorkWithMe = 'true';
        localStorage.setItem('sbb:seenMessage', hasPromisedToWorkWithMe);
    })
}

function checkTabVisibility() {
    if (hasPromisedToWorkWithMe === 'false') {
        if (document.hidden && isTimerGoing !== true) {
            timedMessage();
            // Set gvar on this too
            isTimerGoing = true;
        } else if (!document.hidden) {
            // Reset Timer
            favicon.badge(0);
            if (isTimerGoing) {
                clearTimedMessage()
                isTimerGoing = false;
            }
        } else { return }
    }
};

function timedMessage() {
    t = window.setTimeout(sbbMessage, (30 * 60 * 1000))
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
},{"favico.js":1}]},{},[2])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvZmF2aWNvLmpzL2Zhdmljby5qcyIsIl9zdHJlYW1fMC5qcyIsIm1vZHVsZXMvaG0uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDejFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCIvKipcbiAqIEBsaWNlbnNlIE1JVFxuICogQGZpbGVPdmVydmlldyBGYXZpY28gYW5pbWF0aW9uc1xuICogQGF1dGhvciBNaXJvc2xhdiBNYWdkYSwgaHR0cDovL2Jsb2cuZWpjaS5uZXRcbiAqIEB2ZXJzaW9uIDAuMy4xMFxuICovXG5cbi8qKlxuICogQ3JlYXRlIG5ldyBmYXZpY28gaW5zdGFuY2VcbiAqIEBwYXJhbSB7T2JqZWN0fSBPcHRpb25zXG4gKiBAcmV0dXJuIHtPYmplY3R9IEZhdmljbyBvYmplY3RcbiAqIEBleGFtcGxlXG4gKiB2YXIgZmF2aWNvID0gbmV3IEZhdmljbyh7XG4gKiAgICBiZ0NvbG9yIDogJyNkMDAnLFxuICogICAgdGV4dENvbG9yIDogJyNmZmYnLFxuICogICAgZm9udEZhbWlseSA6ICdzYW5zLXNlcmlmJyxcbiAqICAgIGZvbnRTdHlsZSA6ICdib2xkJyxcbiAqICAgIHBvc2l0aW9uIDogJ2Rvd24nLFxuICogICAgdHlwZSA6ICdjaXJjbGUnLFxuICogICAgYW5pbWF0aW9uIDogJ3NsaWRlJyxcbiAqICAgIGRhdGFVcmw6IGZ1bmN0aW9uKHVybCl7fSxcbiAqICAgIHdpbjogdG9wXG4gKiB9KTtcbiAqL1xuKGZ1bmN0aW9uICgpIHtcblxuXHR2YXIgRmF2aWNvID0gKGZ1bmN0aW9uIChvcHQpIHtcblx0XHQndXNlIHN0cmljdCc7XG5cdFx0b3B0ID0gKG9wdCkgPyBvcHQgOiB7fTtcblx0XHR2YXIgX2RlZiA9IHtcblx0XHRcdGJnQ29sb3I6ICcjZDAwJyxcblx0XHRcdHRleHRDb2xvcjogJyNmZmYnLFxuXHRcdFx0Zm9udEZhbWlseTogJ3NhbnMtc2VyaWYnLCAvL0FyaWFsLFZlcmRhbmEsVGltZXMgTmV3IFJvbWFuLHNlcmlmLHNhbnMtc2VyaWYsLi4uXG5cdFx0XHRmb250U3R5bGU6ICdib2xkJywgLy9ub3JtYWwsaXRhbGljLG9ibGlxdWUsYm9sZCxib2xkZXIsbGlnaHRlciwxMDAsMjAwLDMwMCw0MDAsNTAwLDYwMCw3MDAsODAwLDkwMFxuXHRcdFx0dHlwZTogJ2NpcmNsZScsXG5cdFx0XHRwb3NpdGlvbjogJ2Rvd24nLCAvLyBkb3duLCB1cCwgbGVmdCwgbGVmdHVwICh1cGxlZnQpXG5cdFx0XHRhbmltYXRpb246ICdzbGlkZScsXG5cdFx0XHRlbGVtZW50SWQ6IGZhbHNlLFxuXHRcdFx0ZGF0YVVybDogZmFsc2UsXG5cdFx0XHR3aW46IHdpbmRvd1xuXHRcdH07XG5cdFx0dmFyIF9vcHQsIF9vcmlnLCBfaCwgX3csIF9jYW52YXMsIF9jb250ZXh0LCBfaW1nLCBfcmVhZHksIF9sYXN0QmFkZ2UsIF9ydW5uaW5nLCBfcmVhZHlDYiwgX3N0b3AsIF9icm93c2VyLCBfYW5pbVRpbWVvdXQsIF9kcmF3VGltZW91dCwgX2RvYztcblxuXHRcdF9icm93c2VyID0ge307XG5cdFx0X2Jyb3dzZXIuZmYgPSB0eXBlb2YgSW5zdGFsbFRyaWdnZXIgIT0gJ3VuZGVmaW5lZCc7XG5cdFx0X2Jyb3dzZXIuY2hyb21lID0gISF3aW5kb3cuY2hyb21lO1xuXHRcdF9icm93c2VyLm9wZXJhID0gISF3aW5kb3cub3BlcmEgfHwgbmF2aWdhdG9yLnVzZXJBZ2VudC5pbmRleE9mKCdPcGVyYScpID49IDA7XG5cdFx0X2Jyb3dzZXIuaWUgPSAvKkBjY19vbiFAKi9mYWxzZTtcblx0XHRfYnJvd3Nlci5zYWZhcmkgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwod2luZG93LkhUTUxFbGVtZW50KS5pbmRleE9mKCdDb25zdHJ1Y3RvcicpID4gMDtcblx0XHRfYnJvd3Nlci5zdXBwb3J0ZWQgPSAoX2Jyb3dzZXIuY2hyb21lIHx8IF9icm93c2VyLmZmIHx8IF9icm93c2VyLm9wZXJhKTtcblxuXHRcdHZhciBfcXVldWUgPSBbXTtcblx0XHRfcmVhZHlDYiA9IGZ1bmN0aW9uICgpIHtcblx0XHR9O1xuXHRcdF9yZWFkeSA9IF9zdG9wID0gZmFsc2U7XG5cdFx0LyoqXG5cdFx0ICogSW5pdGlhbGl6ZSBmYXZpY29cblx0XHQgKi9cblx0XHR2YXIgaW5pdCA9IGZ1bmN0aW9uICgpIHtcblx0XHRcdC8vbWVyZ2UgaW5pdGlhbCBvcHRpb25zXG5cdFx0XHRfb3B0ID0gbWVyZ2UoX2RlZiwgb3B0KTtcblx0XHRcdF9vcHQuYmdDb2xvciA9IGhleFRvUmdiKF9vcHQuYmdDb2xvcik7XG5cdFx0XHRfb3B0LnRleHRDb2xvciA9IGhleFRvUmdiKF9vcHQudGV4dENvbG9yKTtcblx0XHRcdF9vcHQucG9zaXRpb24gPSBfb3B0LnBvc2l0aW9uLnRvTG93ZXJDYXNlKCk7XG5cdFx0XHRfb3B0LmFuaW1hdGlvbiA9IChhbmltYXRpb24udHlwZXNbJycgKyBfb3B0LmFuaW1hdGlvbl0pID8gX29wdC5hbmltYXRpb24gOiBfZGVmLmFuaW1hdGlvbjtcblxuXHRcdFx0X2RvYyA9IF9vcHQud2luLmRvY3VtZW50O1xuXG5cdFx0XHR2YXIgaXNVcCA9IF9vcHQucG9zaXRpb24uaW5kZXhPZigndXAnKSA+IC0xO1xuXHRcdFx0dmFyIGlzTGVmdCA9IF9vcHQucG9zaXRpb24uaW5kZXhPZignbGVmdCcpID4gLTE7XG5cblx0XHRcdC8vdHJhbnNmb3JtIGFuaW1hdGlvblxuXHRcdFx0aWYgKGlzVXAgfHwgaXNMZWZ0KSB7XG5cdFx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgYW5pbWF0aW9uLnR5cGVzWycnICsgX29wdC5hbmltYXRpb25dLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdFx0dmFyIHN0ZXAgPSBhbmltYXRpb24udHlwZXNbJycgKyBfb3B0LmFuaW1hdGlvbl1baV07XG5cblx0XHRcdFx0XHRpZiAoaXNVcCkge1xuXHRcdFx0XHRcdFx0aWYgKHN0ZXAueSA8IDAuNikge1xuXHRcdFx0XHRcdFx0XHRzdGVwLnkgPSBzdGVwLnkgLSAwLjQ7XG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRzdGVwLnkgPSBzdGVwLnkgLSAyICogc3RlcC55ICsgKDEgLSBzdGVwLncpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGlmIChpc0xlZnQpIHtcblx0XHRcdFx0XHRcdGlmIChzdGVwLnggPCAwLjYpIHtcblx0XHRcdFx0XHRcdFx0c3RlcC54ID0gc3RlcC54IC0gMC40O1xuXHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0c3RlcC54ID0gc3RlcC54IC0gMiAqIHN0ZXAueCArICgxIC0gc3RlcC5oKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRhbmltYXRpb24udHlwZXNbJycgKyBfb3B0LmFuaW1hdGlvbl1baV0gPSBzdGVwO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRfb3B0LnR5cGUgPSAodHlwZVsnJyArIF9vcHQudHlwZV0pID8gX29wdC50eXBlIDogX2RlZi50eXBlO1xuXG5cdFx0XHRfb3JpZyA9IGxpbmsuZ2V0SWNvbigpO1xuXHRcdFx0Ly9jcmVhdGUgdGVtcCBjYW52YXNcblx0XHRcdF9jYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcblx0XHRcdC8vY3JlYXRlIHRlbXAgaW1hZ2Vcblx0XHRcdF9pbWcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbWcnKTtcblx0XHRcdGlmIChfb3JpZy5oYXNBdHRyaWJ1dGUoJ2hyZWYnKSkge1xuXHRcdFx0XHRfaW1nLnNldEF0dHJpYnV0ZSgnY3Jvc3NPcmlnaW4nLCAnYW5vbnltb3VzJyk7XG5cdFx0XHRcdC8vZ2V0IHdpZHRoL2hlaWdodFxuXHRcdFx0XHRfaW1nLm9ubG9hZCA9IGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRfaCA9IChfaW1nLmhlaWdodCA+IDApID8gX2ltZy5oZWlnaHQgOiAzMjtcblx0XHRcdFx0XHRfdyA9IChfaW1nLndpZHRoID4gMCkgPyBfaW1nLndpZHRoIDogMzI7XG5cdFx0XHRcdFx0X2NhbnZhcy5oZWlnaHQgPSBfaDtcblx0XHRcdFx0XHRfY2FudmFzLndpZHRoID0gX3c7XG5cdFx0XHRcdFx0X2NvbnRleHQgPSBfY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG5cdFx0XHRcdFx0aWNvbi5yZWFkeSgpO1xuXHRcdFx0XHR9O1xuXHRcdFx0XHRfaW1nLnNldEF0dHJpYnV0ZSgnc3JjJywgX29yaWcuZ2V0QXR0cmlidXRlKCdocmVmJykpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0X2ltZy5vbmxvYWQgPSBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0X2ggPSAzMjtcblx0XHRcdFx0XHRfdyA9IDMyO1xuXHRcdFx0XHRcdF9pbWcuaGVpZ2h0ID0gX2g7XG5cdFx0XHRcdFx0X2ltZy53aWR0aCA9IF93O1xuXHRcdFx0XHRcdF9jYW52YXMuaGVpZ2h0ID0gX2g7XG5cdFx0XHRcdFx0X2NhbnZhcy53aWR0aCA9IF93O1xuXHRcdFx0XHRcdF9jb250ZXh0ID0gX2NhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuXHRcdFx0XHRcdGljb24ucmVhZHkoKTtcblx0XHRcdFx0fTtcblx0XHRcdFx0X2ltZy5zZXRBdHRyaWJ1dGUoJ3NyYycsICcnKTtcblx0XHRcdH1cblxuXHRcdH07XG5cdFx0LyoqXG5cdFx0ICogSWNvbiBuYW1lc3BhY2Vcblx0XHQgKi9cblx0XHR2YXIgaWNvbiA9IHt9O1xuXHRcdC8qKlxuXHRcdCAqIEljb24gaXMgcmVhZHkgKHJlc2V0IGljb24pIGFuZCBzdGFydCBhbmltYXRpb24gKGlmIHRoZXIgaXMgYW55KVxuXHRcdCAqL1xuXHRcdGljb24ucmVhZHkgPSBmdW5jdGlvbiAoKSB7XG5cdFx0XHRfcmVhZHkgPSB0cnVlO1xuXHRcdFx0aWNvbi5yZXNldCgpO1xuXHRcdFx0X3JlYWR5Q2IoKTtcblx0XHR9O1xuXHRcdC8qKlxuXHRcdCAqIFJlc2V0IGljb24gdG8gZGVmYXVsdCBzdGF0ZVxuXHRcdCAqL1xuXHRcdGljb24ucmVzZXQgPSBmdW5jdGlvbiAoKSB7XG5cdFx0XHQvL3Jlc2V0XG5cdFx0XHRpZiAoIV9yZWFkeSkge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0XHRfcXVldWUgPSBbXTtcblx0XHRcdF9sYXN0QmFkZ2UgPSBmYWxzZTtcblx0XHRcdF9ydW5uaW5nID0gZmFsc2U7XG5cdFx0XHRfY29udGV4dC5jbGVhclJlY3QoMCwgMCwgX3csIF9oKTtcblx0XHRcdF9jb250ZXh0LmRyYXdJbWFnZShfaW1nLCAwLCAwLCBfdywgX2gpO1xuXHRcdFx0Ly9fc3RvcD10cnVlO1xuXHRcdFx0bGluay5zZXRJY29uKF9jYW52YXMpO1xuXHRcdFx0Ly93ZWJjYW0oJ3N0b3AnKTtcblx0XHRcdC8vdmlkZW8oJ3N0b3AnKTtcblx0XHRcdHdpbmRvdy5jbGVhclRpbWVvdXQoX2FuaW1UaW1lb3V0KTtcblx0XHRcdHdpbmRvdy5jbGVhclRpbWVvdXQoX2RyYXdUaW1lb3V0KTtcblx0XHR9O1xuXHRcdC8qKlxuXHRcdCAqIFN0YXJ0IGFuaW1hdGlvblxuXHRcdCAqL1xuXHRcdGljb24uc3RhcnQgPSBmdW5jdGlvbiAoKSB7XG5cdFx0XHRpZiAoIV9yZWFkeSB8fCBfcnVubmluZykge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0XHR2YXIgZmluaXNoZWQgPSBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdF9sYXN0QmFkZ2UgPSBfcXVldWVbMF07XG5cdFx0XHRcdF9ydW5uaW5nID0gZmFsc2U7XG5cdFx0XHRcdGlmIChfcXVldWUubGVuZ3RoID4gMCkge1xuXHRcdFx0XHRcdF9xdWV1ZS5zaGlmdCgpO1xuXHRcdFx0XHRcdGljb24uc3RhcnQoKTtcblx0XHRcdFx0fSBlbHNlIHtcblxuXHRcdFx0XHR9XG5cdFx0XHR9O1xuXHRcdFx0aWYgKF9xdWV1ZS5sZW5ndGggPiAwKSB7XG5cdFx0XHRcdF9ydW5uaW5nID0gdHJ1ZTtcblx0XHRcdFx0dmFyIHJ1biA9IGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHQvLyBhcHBseSBvcHRpb25zIGZvciB0aGlzIGFuaW1hdGlvblxuXHRcdFx0XHRcdFsndHlwZScsICdhbmltYXRpb24nLCAnYmdDb2xvcicsICd0ZXh0Q29sb3InLCAnZm9udEZhbWlseScsICdmb250U3R5bGUnXS5mb3JFYWNoKGZ1bmN0aW9uIChhKSB7XG5cdFx0XHRcdFx0XHRpZiAoYSBpbiBfcXVldWVbMF0ub3B0aW9ucykge1xuXHRcdFx0XHRcdFx0XHRfb3B0W2FdID0gX3F1ZXVlWzBdLm9wdGlvbnNbYV07XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0YW5pbWF0aW9uLnJ1bihfcXVldWVbMF0ub3B0aW9ucywgZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdFx0ZmluaXNoZWQoKTtcblx0XHRcdFx0XHR9LCBmYWxzZSk7XG5cdFx0XHRcdH07XG5cdFx0XHRcdGlmIChfbGFzdEJhZGdlKSB7XG5cdFx0XHRcdFx0YW5pbWF0aW9uLnJ1bihfbGFzdEJhZGdlLm9wdGlvbnMsIGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRcdHJ1bigpO1xuXHRcdFx0XHRcdH0sIHRydWUpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHJ1bigpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fTtcblxuXHRcdC8qKlxuXHRcdCAqIEJhZGdlIHR5cGVzXG5cdFx0ICovXG5cdFx0dmFyIHR5cGUgPSB7fTtcblx0XHR2YXIgb3B0aW9ucyA9IGZ1bmN0aW9uIChvcHQpIHtcblx0XHRcdG9wdC5uID0gKCh0eXBlb2Ygb3B0Lm4pID09PSAnbnVtYmVyJykgPyBNYXRoLmFicyhvcHQubiB8IDApIDogb3B0Lm47XG5cdFx0XHRvcHQueCA9IF93ICogb3B0Lng7XG5cdFx0XHRvcHQueSA9IF9oICogb3B0Lnk7XG5cdFx0XHRvcHQudyA9IF93ICogb3B0Lnc7XG5cdFx0XHRvcHQuaCA9IF9oICogb3B0Lmg7XG5cdFx0XHRvcHQubGVuID0gKFwiXCIgKyBvcHQubikubGVuZ3RoO1xuXHRcdFx0cmV0dXJuIG9wdDtcblx0XHR9O1xuXHRcdC8qKlxuXHRcdCAqIEdlbmVyYXRlIGNpcmNsZVxuXHRcdCAqIEBwYXJhbSB7T2JqZWN0fSBvcHQgQmFkZ2Ugb3B0aW9uc1xuXHRcdCAqL1xuXHRcdHR5cGUuY2lyY2xlID0gZnVuY3Rpb24gKG9wdCkge1xuXHRcdFx0b3B0ID0gb3B0aW9ucyhvcHQpO1xuXHRcdFx0dmFyIG1vcmUgPSBmYWxzZTtcblx0XHRcdGlmIChvcHQubGVuID09PSAyKSB7XG5cdFx0XHRcdG9wdC54ID0gb3B0LnggLSBvcHQudyAqIDAuNDtcblx0XHRcdFx0b3B0LncgPSBvcHQudyAqIDEuNDtcblx0XHRcdFx0bW9yZSA9IHRydWU7XG5cdFx0XHR9IGVsc2UgaWYgKG9wdC5sZW4gPj0gMykge1xuXHRcdFx0XHRvcHQueCA9IG9wdC54IC0gb3B0LncgKiAwLjY1O1xuXHRcdFx0XHRvcHQudyA9IG9wdC53ICogMS42NTtcblx0XHRcdFx0bW9yZSA9IHRydWU7XG5cdFx0XHR9XG5cdFx0XHRfY29udGV4dC5jbGVhclJlY3QoMCwgMCwgX3csIF9oKTtcblx0XHRcdF9jb250ZXh0LmRyYXdJbWFnZShfaW1nLCAwLCAwLCBfdywgX2gpO1xuXHRcdFx0X2NvbnRleHQuYmVnaW5QYXRoKCk7XG5cdFx0XHRfY29udGV4dC5mb250ID0gX29wdC5mb250U3R5bGUgKyBcIiBcIiArIE1hdGguZmxvb3Iob3B0LmggKiAob3B0Lm4gPiA5OSA/IDAuODUgOiAxKSkgKyBcInB4IFwiICsgX29wdC5mb250RmFtaWx5O1xuXHRcdFx0X2NvbnRleHQudGV4dEFsaWduID0gJ2NlbnRlcic7XG5cdFx0XHRpZiAobW9yZSkge1xuXHRcdFx0XHRfY29udGV4dC5tb3ZlVG8ob3B0LnggKyBvcHQudyAvIDIsIG9wdC55KTtcblx0XHRcdFx0X2NvbnRleHQubGluZVRvKG9wdC54ICsgb3B0LncgLSBvcHQuaCAvIDIsIG9wdC55KTtcblx0XHRcdFx0X2NvbnRleHQucXVhZHJhdGljQ3VydmVUbyhvcHQueCArIG9wdC53LCBvcHQueSwgb3B0LnggKyBvcHQudywgb3B0LnkgKyBvcHQuaCAvIDIpO1xuXHRcdFx0XHRfY29udGV4dC5saW5lVG8ob3B0LnggKyBvcHQudywgb3B0LnkgKyBvcHQuaCAtIG9wdC5oIC8gMik7XG5cdFx0XHRcdF9jb250ZXh0LnF1YWRyYXRpY0N1cnZlVG8ob3B0LnggKyBvcHQudywgb3B0LnkgKyBvcHQuaCwgb3B0LnggKyBvcHQudyAtIG9wdC5oIC8gMiwgb3B0LnkgKyBvcHQuaCk7XG5cdFx0XHRcdF9jb250ZXh0LmxpbmVUbyhvcHQueCArIG9wdC5oIC8gMiwgb3B0LnkgKyBvcHQuaCk7XG5cdFx0XHRcdF9jb250ZXh0LnF1YWRyYXRpY0N1cnZlVG8ob3B0LngsIG9wdC55ICsgb3B0LmgsIG9wdC54LCBvcHQueSArIG9wdC5oIC0gb3B0LmggLyAyKTtcblx0XHRcdFx0X2NvbnRleHQubGluZVRvKG9wdC54LCBvcHQueSArIG9wdC5oIC8gMik7XG5cdFx0XHRcdF9jb250ZXh0LnF1YWRyYXRpY0N1cnZlVG8ob3B0LngsIG9wdC55LCBvcHQueCArIG9wdC5oIC8gMiwgb3B0LnkpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0X2NvbnRleHQuYXJjKG9wdC54ICsgb3B0LncgLyAyLCBvcHQueSArIG9wdC5oIC8gMiwgb3B0LmggLyAyLCAwLCAyICogTWF0aC5QSSk7XG5cdFx0XHR9XG5cdFx0XHRfY29udGV4dC5maWxsU3R5bGUgPSAncmdiYSgnICsgX29wdC5iZ0NvbG9yLnIgKyAnLCcgKyBfb3B0LmJnQ29sb3IuZyArICcsJyArIF9vcHQuYmdDb2xvci5iICsgJywnICsgb3B0Lm8gKyAnKSc7XG5cdFx0XHRfY29udGV4dC5maWxsKCk7XG5cdFx0XHRfY29udGV4dC5jbG9zZVBhdGgoKTtcblx0XHRcdF9jb250ZXh0LmJlZ2luUGF0aCgpO1xuXHRcdFx0X2NvbnRleHQuc3Ryb2tlKCk7XG5cdFx0XHRfY29udGV4dC5maWxsU3R5bGUgPSAncmdiYSgnICsgX29wdC50ZXh0Q29sb3IuciArICcsJyArIF9vcHQudGV4dENvbG9yLmcgKyAnLCcgKyBfb3B0LnRleHRDb2xvci5iICsgJywnICsgb3B0Lm8gKyAnKSc7XG5cdFx0XHQvL19jb250ZXh0LmZpbGxUZXh0KChtb3JlKSA/ICc5KycgOiBvcHQubiwgTWF0aC5mbG9vcihvcHQueCArIG9wdC53IC8gMiksIE1hdGguZmxvb3Iob3B0LnkgKyBvcHQuaCAtIG9wdC5oICogMC4xNSkpO1xuXHRcdFx0aWYgKCh0eXBlb2Ygb3B0Lm4pID09PSAnbnVtYmVyJyAmJiBvcHQubiA+IDk5OSkge1xuXHRcdFx0XHRfY29udGV4dC5maWxsVGV4dCgoKG9wdC5uID4gOTk5OSkgPyA5IDogTWF0aC5mbG9vcihvcHQubiAvIDEwMDApKSArICdrKycsIE1hdGguZmxvb3Iob3B0LnggKyBvcHQudyAvIDIpLCBNYXRoLmZsb29yKG9wdC55ICsgb3B0LmggLSBvcHQuaCAqIDAuMikpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0X2NvbnRleHQuZmlsbFRleHQob3B0Lm4sIE1hdGguZmxvb3Iob3B0LnggKyBvcHQudyAvIDIpLCBNYXRoLmZsb29yKG9wdC55ICsgb3B0LmggLSBvcHQuaCAqIDAuMTUpKTtcblx0XHRcdH1cblx0XHRcdF9jb250ZXh0LmNsb3NlUGF0aCgpO1xuXHRcdH07XG5cdFx0LyoqXG5cdFx0ICogR2VuZXJhdGUgcmVjdGFuZ2xlXG5cdFx0ICogQHBhcmFtIHtPYmplY3R9IG9wdCBCYWRnZSBvcHRpb25zXG5cdFx0ICovXG5cdFx0dHlwZS5yZWN0YW5nbGUgPSBmdW5jdGlvbiAob3B0KSB7XG5cdFx0XHRvcHQgPSBvcHRpb25zKG9wdCk7XG5cdFx0XHR2YXIgbW9yZSA9IGZhbHNlO1xuXHRcdFx0aWYgKG9wdC5sZW4gPT09IDIpIHtcblx0XHRcdFx0b3B0LnggPSBvcHQueCAtIG9wdC53ICogMC40O1xuXHRcdFx0XHRvcHQudyA9IG9wdC53ICogMS40O1xuXHRcdFx0XHRtb3JlID0gdHJ1ZTtcblx0XHRcdH0gZWxzZSBpZiAob3B0LmxlbiA+PSAzKSB7XG5cdFx0XHRcdG9wdC54ID0gb3B0LnggLSBvcHQudyAqIDAuNjU7XG5cdFx0XHRcdG9wdC53ID0gb3B0LncgKiAxLjY1O1xuXHRcdFx0XHRtb3JlID0gdHJ1ZTtcblx0XHRcdH1cblx0XHRcdF9jb250ZXh0LmNsZWFyUmVjdCgwLCAwLCBfdywgX2gpO1xuXHRcdFx0X2NvbnRleHQuZHJhd0ltYWdlKF9pbWcsIDAsIDAsIF93LCBfaCk7XG5cdFx0XHRfY29udGV4dC5iZWdpblBhdGgoKTtcblx0XHRcdF9jb250ZXh0LmZvbnQgPSBfb3B0LmZvbnRTdHlsZSArIFwiIFwiICsgTWF0aC5mbG9vcihvcHQuaCAqIChvcHQubiA+IDk5ID8gMC45IDogMSkpICsgXCJweCBcIiArIF9vcHQuZm9udEZhbWlseTtcblx0XHRcdF9jb250ZXh0LnRleHRBbGlnbiA9ICdjZW50ZXInO1xuXHRcdFx0X2NvbnRleHQuZmlsbFN0eWxlID0gJ3JnYmEoJyArIF9vcHQuYmdDb2xvci5yICsgJywnICsgX29wdC5iZ0NvbG9yLmcgKyAnLCcgKyBfb3B0LmJnQ29sb3IuYiArICcsJyArIG9wdC5vICsgJyknO1xuXHRcdFx0X2NvbnRleHQuZmlsbFJlY3Qob3B0LngsIG9wdC55LCBvcHQudywgb3B0LmgpO1xuXHRcdFx0X2NvbnRleHQuZmlsbFN0eWxlID0gJ3JnYmEoJyArIF9vcHQudGV4dENvbG9yLnIgKyAnLCcgKyBfb3B0LnRleHRDb2xvci5nICsgJywnICsgX29wdC50ZXh0Q29sb3IuYiArICcsJyArIG9wdC5vICsgJyknO1xuXHRcdFx0Ly9fY29udGV4dC5maWxsVGV4dCgobW9yZSkgPyAnOSsnIDogb3B0Lm4sIE1hdGguZmxvb3Iob3B0LnggKyBvcHQudyAvIDIpLCBNYXRoLmZsb29yKG9wdC55ICsgb3B0LmggLSBvcHQuaCAqIDAuMTUpKTtcblx0XHRcdGlmICgodHlwZW9mIG9wdC5uKSA9PT0gJ251bWJlcicgJiYgb3B0Lm4gPiA5OTkpIHtcblx0XHRcdFx0X2NvbnRleHQuZmlsbFRleHQoKChvcHQubiA+IDk5OTkpID8gOSA6IE1hdGguZmxvb3Iob3B0Lm4gLyAxMDAwKSkgKyAnaysnLCBNYXRoLmZsb29yKG9wdC54ICsgb3B0LncgLyAyKSwgTWF0aC5mbG9vcihvcHQueSArIG9wdC5oIC0gb3B0LmggKiAwLjIpKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdF9jb250ZXh0LmZpbGxUZXh0KG9wdC5uLCBNYXRoLmZsb29yKG9wdC54ICsgb3B0LncgLyAyKSwgTWF0aC5mbG9vcihvcHQueSArIG9wdC5oIC0gb3B0LmggKiAwLjE1KSk7XG5cdFx0XHR9XG5cdFx0XHRfY29udGV4dC5jbG9zZVBhdGgoKTtcblx0XHR9O1xuXG5cdFx0LyoqXG5cdFx0ICogU2V0IGJhZGdlXG5cdFx0ICovXG5cdFx0dmFyIGJhZGdlID0gZnVuY3Rpb24gKG51bWJlciwgb3B0cykge1xuXHRcdFx0b3B0cyA9ICgodHlwZW9mIG9wdHMpID09PSAnc3RyaW5nJyA/IHtcblx0XHRcdFx0YW5pbWF0aW9uOiBvcHRzXG5cdFx0XHR9IDogb3B0cykgfHwge307XG5cdFx0XHRfcmVhZHlDYiA9IGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRpZiAodHlwZW9mIChudW1iZXIpID09PSAnbnVtYmVyJyA/IChudW1iZXIgPiAwKSA6IChudW1iZXIgIT09ICcnKSkge1xuXHRcdFx0XHRcdFx0dmFyIHEgPSB7XG5cdFx0XHRcdFx0XHRcdHR5cGU6ICdiYWRnZScsXG5cdFx0XHRcdFx0XHRcdG9wdGlvbnM6IHtcblx0XHRcdFx0XHRcdFx0XHRuOiBudW1iZXJcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRcdGlmICgnYW5pbWF0aW9uJyBpbiBvcHRzICYmIGFuaW1hdGlvbi50eXBlc1snJyArIG9wdHMuYW5pbWF0aW9uXSkge1xuXHRcdFx0XHRcdFx0XHRxLm9wdGlvbnMuYW5pbWF0aW9uID0gJycgKyBvcHRzLmFuaW1hdGlvbjtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGlmICgndHlwZScgaW4gb3B0cyAmJiB0eXBlWycnICsgb3B0cy50eXBlXSkge1xuXHRcdFx0XHRcdFx0XHRxLm9wdGlvbnMudHlwZSA9ICcnICsgb3B0cy50eXBlO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0WydiZ0NvbG9yJywgJ3RleHRDb2xvciddLmZvckVhY2goZnVuY3Rpb24gKG8pIHtcblx0XHRcdFx0XHRcdFx0aWYgKG8gaW4gb3B0cykge1xuXHRcdFx0XHRcdFx0XHRcdHEub3B0aW9uc1tvXSA9IGhleFRvUmdiKG9wdHNbb10pO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdFsnZm9udFN0eWxlJywgJ2ZvbnRGYW1pbHknXS5mb3JFYWNoKGZ1bmN0aW9uIChvKSB7XG5cdFx0XHRcdFx0XHRcdGlmIChvIGluIG9wdHMpIHtcblx0XHRcdFx0XHRcdFx0XHRxLm9wdGlvbnNbb10gPSBvcHRzW29dO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdF9xdWV1ZS5wdXNoKHEpO1xuXHRcdFx0XHRcdFx0aWYgKF9xdWV1ZS5sZW5ndGggPiAxMDApIHtcblx0XHRcdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKCdUb28gbWFueSBiYWRnZXMgcmVxdWVzdHMgaW4gcXVldWUuJyk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRpY29uLnN0YXJ0KCk7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdGljb24ucmVzZXQoKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0gY2F0Y2ggKGUpIHtcblx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ0Vycm9yIHNldHRpbmcgYmFkZ2UuIE1lc3NhZ2U6ICcgKyBlLm1lc3NhZ2UpO1xuXHRcdFx0XHR9XG5cdFx0XHR9O1xuXHRcdFx0aWYgKF9yZWFkeSkge1xuXHRcdFx0XHRfcmVhZHlDYigpO1xuXHRcdFx0fVxuXHRcdH07XG5cblx0XHQvKipcblx0XHQgKiBTZXQgaW1hZ2UgYXMgaWNvblxuXHRcdCAqL1xuXHRcdHZhciBpbWFnZSA9IGZ1bmN0aW9uIChpbWFnZUVsZW1lbnQpIHtcblx0XHRcdF9yZWFkeUNiID0gZnVuY3Rpb24gKCkge1xuXHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdHZhciB3ID0gaW1hZ2VFbGVtZW50LndpZHRoO1xuXHRcdFx0XHRcdHZhciBoID0gaW1hZ2VFbGVtZW50LmhlaWdodDtcblx0XHRcdFx0XHR2YXIgbmV3SW1nID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW1nJyk7XG5cdFx0XHRcdFx0dmFyIHJhdGlvID0gKHcgLyBfdyA8IGggLyBfaCkgPyAodyAvIF93KSA6IChoIC8gX2gpO1xuXHRcdFx0XHRcdG5ld0ltZy5zZXRBdHRyaWJ1dGUoJ2Nyb3NzT3JpZ2luJywgJ2Fub255bW91cycpO1xuXHRcdFx0XHRcdG5ld0ltZy5vbmxvYWQ9ZnVuY3Rpb24oKXtcblx0XHRcdFx0XHRcdF9jb250ZXh0LmNsZWFyUmVjdCgwLCAwLCBfdywgX2gpO1xuXHRcdFx0XHRcdFx0X2NvbnRleHQuZHJhd0ltYWdlKG5ld0ltZywgMCwgMCwgX3csIF9oKTtcblx0XHRcdFx0XHRcdGxpbmsuc2V0SWNvbihfY2FudmFzKTtcblx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdG5ld0ltZy5zZXRBdHRyaWJ1dGUoJ3NyYycsIGltYWdlRWxlbWVudC5nZXRBdHRyaWJ1dGUoJ3NyYycpKTtcblx0XHRcdFx0XHRuZXdJbWcuaGVpZ2h0ID0gKGggLyByYXRpbyk7XG5cdFx0XHRcdFx0bmV3SW1nLndpZHRoID0gKHcgLyByYXRpbyk7XG5cdFx0XHRcdH0gY2F0Y2ggKGUpIHtcblx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ0Vycm9yIHNldHRpbmcgaW1hZ2UuIE1lc3NhZ2U6ICcgKyBlLm1lc3NhZ2UpO1xuXHRcdFx0XHR9XG5cdFx0XHR9O1xuXHRcdFx0aWYgKF9yZWFkeSkge1xuXHRcdFx0XHRfcmVhZHlDYigpO1xuXHRcdFx0fVxuXHRcdH07XG5cdFx0LyoqXG5cdFx0ICogU2V0IHZpZGVvIGFzIGljb25cblx0XHQgKi9cblx0XHR2YXIgdmlkZW8gPSBmdW5jdGlvbiAodmlkZW9FbGVtZW50KSB7XG5cdFx0XHRfcmVhZHlDYiA9IGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRpZiAodmlkZW9FbGVtZW50ID09PSAnc3RvcCcpIHtcblx0XHRcdFx0XHRcdF9zdG9wID0gdHJ1ZTtcblx0XHRcdFx0XHRcdGljb24ucmVzZXQoKTtcblx0XHRcdFx0XHRcdF9zdG9wID0gZmFsc2U7XG5cdFx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdC8vdmFyIHcgPSB2aWRlb0VsZW1lbnQud2lkdGg7XG5cdFx0XHRcdFx0Ly92YXIgaCA9IHZpZGVvRWxlbWVudC5oZWlnaHQ7XG5cdFx0XHRcdFx0Ly92YXIgcmF0aW8gPSAodyAvIF93IDwgaCAvIF9oKSA/ICh3IC8gX3cpIDogKGggLyBfaCk7XG5cdFx0XHRcdFx0dmlkZW9FbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3BsYXknLCBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0XHRkcmF3VmlkZW8odGhpcyk7XG5cdFx0XHRcdFx0fSwgZmFsc2UpO1xuXG5cdFx0XHRcdH0gY2F0Y2ggKGUpIHtcblx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ0Vycm9yIHNldHRpbmcgdmlkZW8uIE1lc3NhZ2U6ICcgKyBlLm1lc3NhZ2UpO1xuXHRcdFx0XHR9XG5cdFx0XHR9O1xuXHRcdFx0aWYgKF9yZWFkeSkge1xuXHRcdFx0XHRfcmVhZHlDYigpO1xuXHRcdFx0fVxuXHRcdH07XG5cdFx0LyoqXG5cdFx0ICogU2V0IHZpZGVvIGFzIGljb25cblx0XHQgKi9cblx0XHR2YXIgd2ViY2FtID0gZnVuY3Rpb24gKGFjdGlvbikge1xuXHRcdFx0Ly9VUlxuXHRcdFx0aWYgKCF3aW5kb3cuVVJMIHx8ICF3aW5kb3cuVVJMLmNyZWF0ZU9iamVjdFVSTCkge1xuXHRcdFx0XHR3aW5kb3cuVVJMID0gd2luZG93LlVSTCB8fCB7fTtcblx0XHRcdFx0d2luZG93LlVSTC5jcmVhdGVPYmplY3RVUkwgPSBmdW5jdGlvbiAob2JqKSB7XG5cdFx0XHRcdFx0cmV0dXJuIG9iajtcblx0XHRcdFx0fTtcblx0XHRcdH1cblx0XHRcdGlmIChfYnJvd3Nlci5zdXBwb3J0ZWQpIHtcblx0XHRcdFx0dmFyIG5ld1ZpZGVvID0gZmFsc2U7XG5cdFx0XHRcdG5hdmlnYXRvci5nZXRVc2VyTWVkaWEgPSBuYXZpZ2F0b3IuZ2V0VXNlck1lZGlhIHx8IG5hdmlnYXRvci5vR2V0VXNlck1lZGlhIHx8IG5hdmlnYXRvci5tc0dldFVzZXJNZWRpYSB8fCBuYXZpZ2F0b3IubW96R2V0VXNlck1lZGlhIHx8IG5hdmlnYXRvci53ZWJraXRHZXRVc2VyTWVkaWE7XG5cdFx0XHRcdF9yZWFkeUNiID0gZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0XHRpZiAoYWN0aW9uID09PSAnc3RvcCcpIHtcblx0XHRcdFx0XHRcdFx0X3N0b3AgPSB0cnVlO1xuXHRcdFx0XHRcdFx0XHRpY29uLnJlc2V0KCk7XG5cdFx0XHRcdFx0XHRcdF9zdG9wID0gZmFsc2U7XG5cdFx0XHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdG5ld1ZpZGVvID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndmlkZW8nKTtcblx0XHRcdFx0XHRcdG5ld1ZpZGVvLndpZHRoID0gX3c7XG5cdFx0XHRcdFx0XHRuZXdWaWRlby5oZWlnaHQgPSBfaDtcblx0XHRcdFx0XHRcdG5hdmlnYXRvci5nZXRVc2VyTWVkaWEoe1xuXHRcdFx0XHRcdFx0XHR2aWRlbzogdHJ1ZSxcblx0XHRcdFx0XHRcdFx0YXVkaW86IGZhbHNlXG5cdFx0XHRcdFx0XHR9LCBmdW5jdGlvbiAoc3RyZWFtKSB7XG5cdFx0XHRcdFx0XHRcdG5ld1ZpZGVvLnNyYyA9IFVSTC5jcmVhdGVPYmplY3RVUkwoc3RyZWFtKTtcblx0XHRcdFx0XHRcdFx0bmV3VmlkZW8ucGxheSgpO1xuXHRcdFx0XHRcdFx0XHRkcmF3VmlkZW8obmV3VmlkZW8pO1xuXHRcdFx0XHRcdFx0fSwgZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0fSBjYXRjaCAoZSkge1xuXHRcdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKCdFcnJvciBzZXR0aW5nIHdlYmNhbS4gTWVzc2FnZTogJyArIGUubWVzc2FnZSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9O1xuXHRcdFx0XHRpZiAoX3JlYWR5KSB7XG5cdFx0XHRcdFx0X3JlYWR5Q2IoKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0fTtcblxuXHRcdC8qKlxuXHRcdCAqIERyYXcgdmlkZW8gdG8gY29udGV4dCBhbmQgcmVwZWF0IDopXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gZHJhd1ZpZGVvKHZpZGVvKSB7XG5cdFx0XHRpZiAodmlkZW8ucGF1c2VkIHx8IHZpZGVvLmVuZGVkIHx8IF9zdG9wKSB7XG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdH1cblx0XHRcdC8vbmFzdHkgaGFjayBmb3IgRkYgd2ViY2FtIChUaGFua3MgdG8gSnVsaWFuIMSGd2lya28sIGtvbnRha3RAcmVkc3VubWVkaWEucGwpXG5cdFx0XHR0cnkge1xuXHRcdFx0XHRfY29udGV4dC5jbGVhclJlY3QoMCwgMCwgX3csIF9oKTtcblx0XHRcdFx0X2NvbnRleHQuZHJhd0ltYWdlKHZpZGVvLCAwLCAwLCBfdywgX2gpO1xuXHRcdFx0fSBjYXRjaCAoZSkge1xuXG5cdFx0XHR9XG5cdFx0XHRfZHJhd1RpbWVvdXQgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0ZHJhd1ZpZGVvKHZpZGVvKTtcblx0XHRcdH0sIGFuaW1hdGlvbi5kdXJhdGlvbik7XG5cdFx0XHRsaW5rLnNldEljb24oX2NhbnZhcyk7XG5cdFx0fVxuXG5cdFx0dmFyIGxpbmsgPSB7fTtcblx0XHQvKipcblx0XHQgKiBHZXQgaWNvbiBmcm9tIEhFQUQgdGFnIG9yIGNyZWF0ZSBhIG5ldyA8bGluaz4gZWxlbWVudFxuXHRcdCAqL1xuXHRcdGxpbmsuZ2V0SWNvbiA9IGZ1bmN0aW9uICgpIHtcblx0XHRcdHZhciBlbG0gPSBmYWxzZTtcblx0XHRcdC8vZ2V0IGxpbmsgZWxlbWVudFxuXHRcdFx0dmFyIGdldExpbmsgPSBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdHZhciBsaW5rID0gX2RvYy5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaGVhZCcpWzBdLmdldEVsZW1lbnRzQnlUYWdOYW1lKCdsaW5rJyk7XG5cdFx0XHRcdGZvciAodmFyIGwgPSBsaW5rLmxlbmd0aCwgaSA9IChsIC0gMSk7IGkgPj0gMDsgaS0tKSB7XG5cdFx0XHRcdFx0aWYgKCgvKF58XFxzKWljb24oXFxzfCQpL2kpLnRlc3QobGlua1tpXS5nZXRBdHRyaWJ1dGUoJ3JlbCcpKSkge1xuXHRcdFx0XHRcdFx0cmV0dXJuIGxpbmtbaV07XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdH07XG5cdFx0XHRpZiAoX29wdC5lbGVtZW50KSB7XG5cdFx0XHRcdGVsbSA9IF9vcHQuZWxlbWVudDtcblx0XHRcdH0gZWxzZSBpZiAoX29wdC5lbGVtZW50SWQpIHtcblx0XHRcdFx0Ly9pZiBpbWcgZWxlbWVudCBpZGVudGlmaWVkIGJ5IGVsZW1lbnRJZFxuXHRcdFx0XHRlbG0gPSBfZG9jLmdldEVsZW1lbnRCeUlkKF9vcHQuZWxlbWVudElkKTtcblx0XHRcdFx0ZWxtLnNldEF0dHJpYnV0ZSgnaHJlZicsIGVsbS5nZXRBdHRyaWJ1dGUoJ3NyYycpKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdC8vaWYgbGluayBlbGVtZW50XG5cdFx0XHRcdGVsbSA9IGdldExpbmsoKTtcblx0XHRcdFx0aWYgKGVsbSA9PT0gZmFsc2UpIHtcblx0XHRcdFx0XHRlbG0gPSBfZG9jLmNyZWF0ZUVsZW1lbnQoJ2xpbmsnKTtcblx0XHRcdFx0XHRlbG0uc2V0QXR0cmlidXRlKCdyZWwnLCAnaWNvbicpO1xuXHRcdFx0XHRcdF9kb2MuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2hlYWQnKVswXS5hcHBlbmRDaGlsZChlbG0pO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRlbG0uc2V0QXR0cmlidXRlKCd0eXBlJywgJ2ltYWdlL3BuZycpO1xuXHRcdFx0cmV0dXJuIGVsbTtcblx0XHR9O1xuXHRcdGxpbmsuc2V0SWNvbiA9IGZ1bmN0aW9uIChjYW52YXMpIHtcblx0XHRcdHZhciB1cmwgPSBjYW52YXMudG9EYXRhVVJMKCdpbWFnZS9wbmcnKTtcblx0XHRcdGlmIChfb3B0LmRhdGFVcmwpIHtcblx0XHRcdFx0Ly9pZiB1c2luZyBjdXN0b20gZXhwb3J0ZXJcblx0XHRcdFx0X29wdC5kYXRhVXJsKHVybCk7XG5cdFx0XHR9XG5cdFx0XHRpZiAoX29wdC5lbGVtZW50KSB7XG5cdFx0XHRcdF9vcHQuZWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2hyZWYnLCB1cmwpO1xuXHRcdFx0XHRfb3B0LmVsZW1lbnQuc2V0QXR0cmlidXRlKCdzcmMnLCB1cmwpO1xuXHRcdFx0fSBlbHNlIGlmIChfb3B0LmVsZW1lbnRJZCkge1xuXHRcdFx0XHQvL2lmIGlzIGF0dGFjaGVkIHRvIGVsZW1lbnQgKGltYWdlKVxuXHRcdFx0XHR2YXIgZWxtID0gX2RvYy5nZXRFbGVtZW50QnlJZChfb3B0LmVsZW1lbnRJZCk7XG5cdFx0XHRcdGVsbS5zZXRBdHRyaWJ1dGUoJ2hyZWYnLCB1cmwpO1xuXHRcdFx0XHRlbG0uc2V0QXR0cmlidXRlKCdzcmMnLCB1cmwpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Ly9pZiBpcyBhdHRhY2hlZCB0byBmYXYgaWNvblxuXHRcdFx0XHRpZiAoX2Jyb3dzZXIuZmYgfHwgX2Jyb3dzZXIub3BlcmEpIHtcblx0XHRcdFx0XHQvL2ZvciBGRiB3ZSBuZWVkIHRvIFwicmVjcmVhdGVcIiBlbGVtZW50LCBhdGFjaCB0byBkb20gYW5kIHJlbW92ZSBvbGQgPGxpbms+XG5cdFx0XHRcdFx0Ly92YXIgb3JpZ2luYWxUeXBlID0gX29yaWcuZ2V0QXR0cmlidXRlKCdyZWwnKTtcblx0XHRcdFx0XHR2YXIgb2xkID0gX29yaWc7XG5cdFx0XHRcdFx0X29yaWcgPSBfZG9jLmNyZWF0ZUVsZW1lbnQoJ2xpbmsnKTtcblx0XHRcdFx0XHQvL19vcmlnLnNldEF0dHJpYnV0ZSgncmVsJywgb3JpZ2luYWxUeXBlKTtcblx0XHRcdFx0XHRpZiAoX2Jyb3dzZXIub3BlcmEpIHtcblx0XHRcdFx0XHRcdF9vcmlnLnNldEF0dHJpYnV0ZSgncmVsJywgJ2ljb24nKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0X29yaWcuc2V0QXR0cmlidXRlKCdyZWwnLCAnaWNvbicpO1xuXHRcdFx0XHRcdF9vcmlnLnNldEF0dHJpYnV0ZSgndHlwZScsICdpbWFnZS9wbmcnKTtcblx0XHRcdFx0XHRfZG9jLmdldEVsZW1lbnRzQnlUYWdOYW1lKCdoZWFkJylbMF0uYXBwZW5kQ2hpbGQoX29yaWcpO1xuXHRcdFx0XHRcdF9vcmlnLnNldEF0dHJpYnV0ZSgnaHJlZicsIHVybCk7XG5cdFx0XHRcdFx0aWYgKG9sZC5wYXJlbnROb2RlKSB7XG5cdFx0XHRcdFx0XHRvbGQucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChvbGQpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRfb3JpZy5zZXRBdHRyaWJ1dGUoJ2hyZWYnLCB1cmwpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fTtcblxuXHRcdC8vaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy81NjIzODM4L3JnYi10by1oZXgtYW5kLWhleC10by1yZ2IjYW5zd2VyLTU2MjQxMzlcblx0XHQvL0hFWCB0byBSR0IgY29udmVydG9yXG5cdFx0ZnVuY3Rpb24gaGV4VG9SZ2IoaGV4KSB7XG5cdFx0XHR2YXIgc2hvcnRoYW5kUmVnZXggPSAvXiM/KFthLWZcXGRdKShbYS1mXFxkXSkoW2EtZlxcZF0pJC9pO1xuXHRcdFx0aGV4ID0gaGV4LnJlcGxhY2Uoc2hvcnRoYW5kUmVnZXgsIGZ1bmN0aW9uIChtLCByLCBnLCBiKSB7XG5cdFx0XHRcdHJldHVybiByICsgciArIGcgKyBnICsgYiArIGI7XG5cdFx0XHR9KTtcblx0XHRcdHZhciByZXN1bHQgPSAvXiM/KFthLWZcXGRdezJ9KShbYS1mXFxkXXsyfSkoW2EtZlxcZF17Mn0pJC9pLmV4ZWMoaGV4KTtcblx0XHRcdHJldHVybiByZXN1bHQgPyB7XG5cdFx0XHRcdHI6IHBhcnNlSW50KHJlc3VsdFsxXSwgMTYpLFxuXHRcdFx0XHRnOiBwYXJzZUludChyZXN1bHRbMl0sIDE2KSxcblx0XHRcdFx0YjogcGFyc2VJbnQocmVzdWx0WzNdLCAxNilcblx0XHRcdH0gOiBmYWxzZTtcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBNZXJnZSBvcHRpb25zXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gbWVyZ2UoZGVmLCBvcHQpIHtcblx0XHRcdHZhciBtZXJnZWRPcHQgPSB7fTtcblx0XHRcdHZhciBhdHRybmFtZTtcblx0XHRcdGZvciAoYXR0cm5hbWUgaW4gZGVmKSB7XG5cdFx0XHRcdG1lcmdlZE9wdFthdHRybmFtZV0gPSBkZWZbYXR0cm5hbWVdO1xuXHRcdFx0fVxuXHRcdFx0Zm9yIChhdHRybmFtZSBpbiBvcHQpIHtcblx0XHRcdFx0bWVyZ2VkT3B0W2F0dHJuYW1lXSA9IG9wdFthdHRybmFtZV07XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gbWVyZ2VkT3B0O1xuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIENyb3NzLWJyb3dzZXIgcGFnZSB2aXNpYmlsaXR5IHNoaW1cblx0XHQgKiBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzEyNTM2NTYyL2RldGVjdC13aGV0aGVyLWEtd2luZG93LWlzLXZpc2libGVcblx0XHQgKi9cblx0XHRmdW5jdGlvbiBpc1BhZ2VIaWRkZW4oKSB7XG5cdFx0XHRyZXR1cm4gX2RvYy5oaWRkZW4gfHwgX2RvYy5tc0hpZGRlbiB8fCBfZG9jLndlYmtpdEhpZGRlbiB8fCBfZG9jLm1vekhpZGRlbjtcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBAbmFtZXNwYWNlIGFuaW1hdGlvblxuXHRcdCAqL1xuXHRcdHZhciBhbmltYXRpb24gPSB7fTtcblx0XHQvKipcblx0XHQgKiBBbmltYXRpb24gXCJmcmFtZVwiIGR1cmF0aW9uXG5cdFx0ICovXG5cdFx0YW5pbWF0aW9uLmR1cmF0aW9uID0gNDA7XG5cdFx0LyoqXG5cdFx0ICogQW5pbWF0aW9uIHR5cGVzIChub25lLGZhZGUscG9wLHNsaWRlKVxuXHRcdCAqL1xuXHRcdGFuaW1hdGlvbi50eXBlcyA9IHt9O1xuXHRcdGFuaW1hdGlvbi50eXBlcy5mYWRlID0gW3tcblx0XHRcdHg6IDAuNCxcblx0XHRcdHk6IDAuNCxcblx0XHRcdHc6IDAuNixcblx0XHRcdGg6IDAuNixcblx0XHRcdG86IDAuMFxuXHRcdH0sIHtcblx0XHRcdFx0eDogMC40LFxuXHRcdFx0XHR5OiAwLjQsXG5cdFx0XHRcdHc6IDAuNixcblx0XHRcdFx0aDogMC42LFxuXHRcdFx0XHRvOiAwLjFcblx0XHRcdH0sIHtcblx0XHRcdFx0eDogMC40LFxuXHRcdFx0XHR5OiAwLjQsXG5cdFx0XHRcdHc6IDAuNixcblx0XHRcdFx0aDogMC42LFxuXHRcdFx0XHRvOiAwLjJcblx0XHRcdH0sIHtcblx0XHRcdFx0eDogMC40LFxuXHRcdFx0XHR5OiAwLjQsXG5cdFx0XHRcdHc6IDAuNixcblx0XHRcdFx0aDogMC42LFxuXHRcdFx0XHRvOiAwLjNcblx0XHRcdH0sIHtcblx0XHRcdFx0eDogMC40LFxuXHRcdFx0XHR5OiAwLjQsXG5cdFx0XHRcdHc6IDAuNixcblx0XHRcdFx0aDogMC42LFxuXHRcdFx0XHRvOiAwLjRcblx0XHRcdH0sIHtcblx0XHRcdFx0eDogMC40LFxuXHRcdFx0XHR5OiAwLjQsXG5cdFx0XHRcdHc6IDAuNixcblx0XHRcdFx0aDogMC42LFxuXHRcdFx0XHRvOiAwLjVcblx0XHRcdH0sIHtcblx0XHRcdFx0eDogMC40LFxuXHRcdFx0XHR5OiAwLjQsXG5cdFx0XHRcdHc6IDAuNixcblx0XHRcdFx0aDogMC42LFxuXHRcdFx0XHRvOiAwLjZcblx0XHRcdH0sIHtcblx0XHRcdFx0eDogMC40LFxuXHRcdFx0XHR5OiAwLjQsXG5cdFx0XHRcdHc6IDAuNixcblx0XHRcdFx0aDogMC42LFxuXHRcdFx0XHRvOiAwLjdcblx0XHRcdH0sIHtcblx0XHRcdFx0eDogMC40LFxuXHRcdFx0XHR5OiAwLjQsXG5cdFx0XHRcdHc6IDAuNixcblx0XHRcdFx0aDogMC42LFxuXHRcdFx0XHRvOiAwLjhcblx0XHRcdH0sIHtcblx0XHRcdFx0eDogMC40LFxuXHRcdFx0XHR5OiAwLjQsXG5cdFx0XHRcdHc6IDAuNixcblx0XHRcdFx0aDogMC42LFxuXHRcdFx0XHRvOiAwLjlcblx0XHRcdH0sIHtcblx0XHRcdFx0eDogMC40LFxuXHRcdFx0XHR5OiAwLjQsXG5cdFx0XHRcdHc6IDAuNixcblx0XHRcdFx0aDogMC42LFxuXHRcdFx0XHRvOiAxLjBcblx0XHRcdH1dO1xuXHRcdGFuaW1hdGlvbi50eXBlcy5ub25lID0gW3tcblx0XHRcdHg6IDAuNCxcblx0XHRcdHk6IDAuNCxcblx0XHRcdHc6IDAuNixcblx0XHRcdGg6IDAuNixcblx0XHRcdG86IDFcblx0XHR9XTtcblx0XHRhbmltYXRpb24udHlwZXMucG9wID0gW3tcblx0XHRcdHg6IDEsXG5cdFx0XHR5OiAxLFxuXHRcdFx0dzogMCxcblx0XHRcdGg6IDAsXG5cdFx0XHRvOiAxXG5cdFx0fSwge1xuXHRcdFx0XHR4OiAwLjksXG5cdFx0XHRcdHk6IDAuOSxcblx0XHRcdFx0dzogMC4xLFxuXHRcdFx0XHRoOiAwLjEsXG5cdFx0XHRcdG86IDFcblx0XHRcdH0sIHtcblx0XHRcdFx0eDogMC44LFxuXHRcdFx0XHR5OiAwLjgsXG5cdFx0XHRcdHc6IDAuMixcblx0XHRcdFx0aDogMC4yLFxuXHRcdFx0XHRvOiAxXG5cdFx0XHR9LCB7XG5cdFx0XHRcdHg6IDAuNyxcblx0XHRcdFx0eTogMC43LFxuXHRcdFx0XHR3OiAwLjMsXG5cdFx0XHRcdGg6IDAuMyxcblx0XHRcdFx0bzogMVxuXHRcdFx0fSwge1xuXHRcdFx0XHR4OiAwLjYsXG5cdFx0XHRcdHk6IDAuNixcblx0XHRcdFx0dzogMC40LFxuXHRcdFx0XHRoOiAwLjQsXG5cdFx0XHRcdG86IDFcblx0XHRcdH0sIHtcblx0XHRcdFx0eDogMC41LFxuXHRcdFx0XHR5OiAwLjUsXG5cdFx0XHRcdHc6IDAuNSxcblx0XHRcdFx0aDogMC41LFxuXHRcdFx0XHRvOiAxXG5cdFx0XHR9LCB7XG5cdFx0XHRcdHg6IDAuNCxcblx0XHRcdFx0eTogMC40LFxuXHRcdFx0XHR3OiAwLjYsXG5cdFx0XHRcdGg6IDAuNixcblx0XHRcdFx0bzogMVxuXHRcdFx0fV07XG5cdFx0YW5pbWF0aW9uLnR5cGVzLnBvcEZhZGUgPSBbe1xuXHRcdFx0eDogMC43NSxcblx0XHRcdHk6IDAuNzUsXG5cdFx0XHR3OiAwLFxuXHRcdFx0aDogMCxcblx0XHRcdG86IDBcblx0XHR9LCB7XG5cdFx0XHRcdHg6IDAuNjUsXG5cdFx0XHRcdHk6IDAuNjUsXG5cdFx0XHRcdHc6IDAuMSxcblx0XHRcdFx0aDogMC4xLFxuXHRcdFx0XHRvOiAwLjJcblx0XHRcdH0sIHtcblx0XHRcdFx0eDogMC42LFxuXHRcdFx0XHR5OiAwLjYsXG5cdFx0XHRcdHc6IDAuMixcblx0XHRcdFx0aDogMC4yLFxuXHRcdFx0XHRvOiAwLjRcblx0XHRcdH0sIHtcblx0XHRcdFx0eDogMC41NSxcblx0XHRcdFx0eTogMC41NSxcblx0XHRcdFx0dzogMC4zLFxuXHRcdFx0XHRoOiAwLjMsXG5cdFx0XHRcdG86IDAuNlxuXHRcdFx0fSwge1xuXHRcdFx0XHR4OiAwLjUwLFxuXHRcdFx0XHR5OiAwLjUwLFxuXHRcdFx0XHR3OiAwLjQsXG5cdFx0XHRcdGg6IDAuNCxcblx0XHRcdFx0bzogMC44XG5cdFx0XHR9LCB7XG5cdFx0XHRcdHg6IDAuNDUsXG5cdFx0XHRcdHk6IDAuNDUsXG5cdFx0XHRcdHc6IDAuNSxcblx0XHRcdFx0aDogMC41LFxuXHRcdFx0XHRvOiAwLjlcblx0XHRcdH0sIHtcblx0XHRcdFx0eDogMC40LFxuXHRcdFx0XHR5OiAwLjQsXG5cdFx0XHRcdHc6IDAuNixcblx0XHRcdFx0aDogMC42LFxuXHRcdFx0XHRvOiAxXG5cdFx0XHR9XTtcblx0XHRhbmltYXRpb24udHlwZXMuc2xpZGUgPSBbe1xuXHRcdFx0eDogMC40LFxuXHRcdFx0eTogMSxcblx0XHRcdHc6IDAuNixcblx0XHRcdGg6IDAuNixcblx0XHRcdG86IDFcblx0XHR9LCB7XG5cdFx0XHRcdHg6IDAuNCxcblx0XHRcdFx0eTogMC45LFxuXHRcdFx0XHR3OiAwLjYsXG5cdFx0XHRcdGg6IDAuNixcblx0XHRcdFx0bzogMVxuXHRcdFx0fSwge1xuXHRcdFx0XHR4OiAwLjQsXG5cdFx0XHRcdHk6IDAuOSxcblx0XHRcdFx0dzogMC42LFxuXHRcdFx0XHRoOiAwLjYsXG5cdFx0XHRcdG86IDFcblx0XHRcdH0sIHtcblx0XHRcdFx0eDogMC40LFxuXHRcdFx0XHR5OiAwLjgsXG5cdFx0XHRcdHc6IDAuNixcblx0XHRcdFx0aDogMC42LFxuXHRcdFx0XHRvOiAxXG5cdFx0XHR9LCB7XG5cdFx0XHRcdHg6IDAuNCxcblx0XHRcdFx0eTogMC43LFxuXHRcdFx0XHR3OiAwLjYsXG5cdFx0XHRcdGg6IDAuNixcblx0XHRcdFx0bzogMVxuXHRcdFx0fSwge1xuXHRcdFx0XHR4OiAwLjQsXG5cdFx0XHRcdHk6IDAuNixcblx0XHRcdFx0dzogMC42LFxuXHRcdFx0XHRoOiAwLjYsXG5cdFx0XHRcdG86IDFcblx0XHRcdH0sIHtcblx0XHRcdFx0eDogMC40LFxuXHRcdFx0XHR5OiAwLjUsXG5cdFx0XHRcdHc6IDAuNixcblx0XHRcdFx0aDogMC42LFxuXHRcdFx0XHRvOiAxXG5cdFx0XHR9LCB7XG5cdFx0XHRcdHg6IDAuNCxcblx0XHRcdFx0eTogMC40LFxuXHRcdFx0XHR3OiAwLjYsXG5cdFx0XHRcdGg6IDAuNixcblx0XHRcdFx0bzogMVxuXHRcdFx0fV07XG5cdFx0LyoqXG5cdFx0ICogUnVuIGFuaW1hdGlvblxuXHRcdCAqIEBwYXJhbSB7T2JqZWN0fSBvcHQgQW5pbWF0aW9uIG9wdGlvbnNcblx0XHQgKiBAcGFyYW0ge09iamVjdH0gY2IgQ2FsbGFiYWsgYWZ0ZXIgYWxsIHN0ZXBzIGFyZSBkb25lXG5cdFx0ICogQHBhcmFtIHtPYmplY3R9IHJldmVydCBSZXZlcnNlIG9yZGVyPyB0cnVlfGZhbHNlXG5cdFx0ICogQHBhcmFtIHtPYmplY3R9IHN0ZXAgT3B0aW9uYWwgc3RlcCBudW1iZXIgKGZyYW1lIGJ1bWJlcilcblx0XHQgKi9cblx0XHRhbmltYXRpb24ucnVuID0gZnVuY3Rpb24gKG9wdCwgY2IsIHJldmVydCwgc3RlcCkge1xuXHRcdFx0dmFyIGFuaW1hdGlvblR5cGUgPSBhbmltYXRpb24udHlwZXNbaXNQYWdlSGlkZGVuKCkgPyAnbm9uZScgOiBfb3B0LmFuaW1hdGlvbl07XG5cdFx0XHRpZiAocmV2ZXJ0ID09PSB0cnVlKSB7XG5cdFx0XHRcdHN0ZXAgPSAodHlwZW9mIHN0ZXAgIT09ICd1bmRlZmluZWQnKSA/IHN0ZXAgOiBhbmltYXRpb25UeXBlLmxlbmd0aCAtIDE7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRzdGVwID0gKHR5cGVvZiBzdGVwICE9PSAndW5kZWZpbmVkJykgPyBzdGVwIDogMDtcblx0XHRcdH1cblx0XHRcdGNiID0gKGNiKSA/IGNiIDogZnVuY3Rpb24gKCkge1xuXHRcdFx0fTtcblx0XHRcdGlmICgoc3RlcCA8IGFuaW1hdGlvblR5cGUubGVuZ3RoKSAmJiAoc3RlcCA+PSAwKSkge1xuXHRcdFx0XHR0eXBlW19vcHQudHlwZV0obWVyZ2Uob3B0LCBhbmltYXRpb25UeXBlW3N0ZXBdKSk7XG5cdFx0XHRcdF9hbmltVGltZW91dCA9IHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdGlmIChyZXZlcnQpIHtcblx0XHRcdFx0XHRcdHN0ZXAgPSBzdGVwIC0gMTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0c3RlcCA9IHN0ZXAgKyAxO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRhbmltYXRpb24ucnVuKG9wdCwgY2IsIHJldmVydCwgc3RlcCk7XG5cdFx0XHRcdH0sIGFuaW1hdGlvbi5kdXJhdGlvbik7XG5cblx0XHRcdFx0bGluay5zZXRJY29uKF9jYW52YXMpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Y2IoKTtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdH07XG5cdFx0Ly9hdXRvIGluaXRcblx0XHRpbml0KCk7XG5cdFx0cmV0dXJuIHtcblx0XHRcdGJhZGdlOiBiYWRnZSxcblx0XHRcdHZpZGVvOiB2aWRlbyxcblx0XHRcdGltYWdlOiBpbWFnZSxcblx0XHRcdHdlYmNhbTogd2ViY2FtLFxuXHRcdFx0cmVzZXQ6IGljb24ucmVzZXQsXG5cdFx0XHRicm93c2VyOiB7XG5cdFx0XHRcdHN1cHBvcnRlZDogX2Jyb3dzZXIuc3VwcG9ydGVkXG5cdFx0XHR9XG5cdFx0fTtcblx0fSk7XG5cblx0Ly8gQU1EIC8gUmVxdWlyZUpTXG5cdGlmICh0eXBlb2YgZGVmaW5lICE9PSAndW5kZWZpbmVkJyAmJiBkZWZpbmUuYW1kKSB7XG5cdFx0ZGVmaW5lKFtdLCBmdW5jdGlvbiAoKSB7XG5cdFx0XHRyZXR1cm4gRmF2aWNvO1xuXHRcdH0pO1xuXHR9XG5cdC8vIENvbW1vbkpTXG5cdGVsc2UgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnICYmIG1vZHVsZS5leHBvcnRzKSB7XG5cdFx0bW9kdWxlLmV4cG9ydHMgPSBGYXZpY287XG5cdH1cblx0Ly8gaW5jbHVkZWQgZGlyZWN0bHkgdmlhIDxzY3JpcHQ+IHRhZ1xuXHRlbHNlIHtcblx0XHR0aGlzLkZhdmljbyA9IEZhdmljbztcblx0fVxuXG59KSgpO1xuIiwiLy8gaW1wb3J0ICogYXMgaG0gZnJvbSAnLi5tb2R1bGVzL2htLmpzJ1xudmFyIGhtID0gcmVxdWlyZSgnLi9tb2R1bGVzL2htLmpzJylcblxuZnVuY3Rpb24gaW5pdCgpIHtcbiAgICBobS5ydW4oKTtcbn1cblxud2luZG93Lm9ubG9hZCA9ICgpID0+IGluaXQoKSIsIi8vIE5QTSBtb2R1bGVzXG52YXIgRmF2aWNvID0gcmVxdWlyZSgnZmF2aWNvLmpzJyk7XG5cbi8vIEdsb2JhbHNcbnZhciB0O1xudmFyIGlzVGltZXJHb2luZyA9IGZhbHNlO1xudmFyIGJlZW5XYXJuZWQgPSBmYWxzZTtcbnZhciBmYXZpY29uID0gbmV3IEZhdmljbyh7XG4gICAgYW5pbWF0aW9uOiAnc2xpZGUnXG59KTtcbnZhciBoYXNQcm9taXNlZFRvV29ya1dpdGhNZSA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCdzYmI6c2Vlbk1lc3NhZ2UnKTtcblxuZnVuY3Rpb24gcnVuKCkge1xuICAgIC8vIE9ubHkgcnVuIGlmIHlvdSdyZSBvbiBkZXNrdG9wXG5cbiAgICAvLyBJZiB5b3UgaGF2ZW4ndCBjb21lIHRvIHRoaXMgc2l0ZSBiZWZvcmUgc2V0IGRlZmF1bHRcbiAgICBpZiAobG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3NiYjpzZWVuTWVzc2FnZScpID09IHVuZGVmaW5lZCkge1xuICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnc2JiOnNlZW5NZXNzYWdlJywgZmFsc2UpO1xuICAgICAgICBoYXNQcm9taXNlZFRvV29ya1dpdGhNZSA9ICdmYWxzZSc7XG4gICAgfVxuXG4gICAgaWYgKGhhc1Byb21pc2VkVG9Xb3JrV2l0aE1lICE9PSAndHJ1ZScpIHtcbiAgICAgICAgYmluZE1lc3NhZ2VCdXR0b24oKVxuICAgICAgICAvLyBDaGVjayBoaWRkZW4gc3RhdHVzIGV2ZXJ5IHNlY29uZFxuICAgICAgICB3aW5kb3cuc2V0SW50ZXJ2YWwoY2hlY2tUYWJWaXNpYmlsaXR5LCAxMDAwKTtcbiAgICB9XG4gICAgXG59XG5cbmZ1bmN0aW9uIGJpbmRNZXNzYWdlQnV0dG9uKCkge1xuICAgIHZhciBidXR0b24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjaGlkZGVuLWJ1dHRvbicpXG5cbiAgICBidXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgICAgIHZhciBlbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNoaWRkZW4tbWVzc2FnZS1jb250YWluZXInKTtcbiAgICAgICAgZWwuY2xhc3NMaXN0LmFkZCgnbm90LXZpc2libGUnKTtcbiAgICAgICAgLy8gU29tZSB2YXIgZm9yIG5ldmVyIHNob3dpbmcgYWdhaW4uXG4gICAgICAgIGNsZWFyVGltZWRNZXNzYWdlKCk7XG4gICAgICAgIGhhc1Byb21pc2VkVG9Xb3JrV2l0aE1lID0gJ3RydWUnO1xuICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnc2JiOnNlZW5NZXNzYWdlJywgaGFzUHJvbWlzZWRUb1dvcmtXaXRoTWUpO1xuICAgIH0pXG59XG5cbmZ1bmN0aW9uIGNoZWNrVGFiVmlzaWJpbGl0eSgpIHtcbiAgICBpZiAoaGFzUHJvbWlzZWRUb1dvcmtXaXRoTWUgPT09ICdmYWxzZScpIHtcbiAgICAgICAgaWYgKGRvY3VtZW50LmhpZGRlbiAmJiBpc1RpbWVyR29pbmcgIT09IHRydWUpIHtcbiAgICAgICAgICAgIHRpbWVkTWVzc2FnZSgpO1xuICAgICAgICAgICAgLy8gU2V0IGd2YXIgb24gdGhpcyB0b29cbiAgICAgICAgICAgIGlzVGltZXJHb2luZyA9IHRydWU7XG4gICAgICAgIH0gZWxzZSBpZiAoIWRvY3VtZW50LmhpZGRlbikge1xuICAgICAgICAgICAgLy8gUmVzZXQgVGltZXJcbiAgICAgICAgICAgIGZhdmljb24uYmFkZ2UoMCk7XG4gICAgICAgICAgICBpZiAoaXNUaW1lckdvaW5nKSB7XG4gICAgICAgICAgICAgICAgY2xlYXJUaW1lZE1lc3NhZ2UoKVxuICAgICAgICAgICAgICAgIGlzVGltZXJHb2luZyA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgeyByZXR1cm4gfVxuICAgIH1cbn07XG5cbmZ1bmN0aW9uIHRpbWVkTWVzc2FnZSgpIHtcbiAgICB0ID0gd2luZG93LnNldFRpbWVvdXQoc2JiTWVzc2FnZSwgKDMwICogNjAgKiAxMDAwKSlcbn07XG5cbmZ1bmN0aW9uIGNsZWFyVGltZWRNZXNzYWdlKCkge1xuICAgIHdpbmRvdy5jbGVhclRpbWVvdXQodCk7XG59XG5cbmZ1bmN0aW9uIHNiYk1lc3NhZ2UoKSB7XG4gICAgaWYgKCFiZWVuV2FybmVkKSB7XG4gICAgICAgIGZhdmljb24uYmFkZ2UoMSk7XG4gICAgICAgIHZhciBlbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNoaWRkZW4tbWVzc2FnZS1jb250YWluZXInKTtcbiAgICAgICAgZWwuY2xhc3NMaXN0LnJlbW92ZSgnbm90LXZpc2libGUnKTtcbiAgICB9XG4gICAgYmVlbldhcm5lZCA9IHRydWU7XG59XG5cbm1vZHVsZS5leHBvcnRzID0geyBydW4gfTsiXX0=
