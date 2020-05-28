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
var hm = require('./modules/hm.js')

function init() {
    hm.run();
}


window.onload = () => init();


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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvZmF2aWNvLmpzL2Zhdmljby5qcyIsIl9zdHJlYW1fMC5qcyIsIm1vZHVsZXMvaG0uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDejFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiLyoqXG4gKiBAbGljZW5zZSBNSVRcbiAqIEBmaWxlT3ZlcnZpZXcgRmF2aWNvIGFuaW1hdGlvbnNcbiAqIEBhdXRob3IgTWlyb3NsYXYgTWFnZGEsIGh0dHA6Ly9ibG9nLmVqY2kubmV0XG4gKiBAdmVyc2lvbiAwLjMuMTBcbiAqL1xuXG4vKipcbiAqIENyZWF0ZSBuZXcgZmF2aWNvIGluc3RhbmNlXG4gKiBAcGFyYW0ge09iamVjdH0gT3B0aW9uc1xuICogQHJldHVybiB7T2JqZWN0fSBGYXZpY28gb2JqZWN0XG4gKiBAZXhhbXBsZVxuICogdmFyIGZhdmljbyA9IG5ldyBGYXZpY28oe1xuICogICAgYmdDb2xvciA6ICcjZDAwJyxcbiAqICAgIHRleHRDb2xvciA6ICcjZmZmJyxcbiAqICAgIGZvbnRGYW1pbHkgOiAnc2Fucy1zZXJpZicsXG4gKiAgICBmb250U3R5bGUgOiAnYm9sZCcsXG4gKiAgICBwb3NpdGlvbiA6ICdkb3duJyxcbiAqICAgIHR5cGUgOiAnY2lyY2xlJyxcbiAqICAgIGFuaW1hdGlvbiA6ICdzbGlkZScsXG4gKiAgICBkYXRhVXJsOiBmdW5jdGlvbih1cmwpe30sXG4gKiAgICB3aW46IHRvcFxuICogfSk7XG4gKi9cbihmdW5jdGlvbiAoKSB7XG5cblx0dmFyIEZhdmljbyA9IChmdW5jdGlvbiAob3B0KSB7XG5cdFx0J3VzZSBzdHJpY3QnO1xuXHRcdG9wdCA9IChvcHQpID8gb3B0IDoge307XG5cdFx0dmFyIF9kZWYgPSB7XG5cdFx0XHRiZ0NvbG9yOiAnI2QwMCcsXG5cdFx0XHR0ZXh0Q29sb3I6ICcjZmZmJyxcblx0XHRcdGZvbnRGYW1pbHk6ICdzYW5zLXNlcmlmJywgLy9BcmlhbCxWZXJkYW5hLFRpbWVzIE5ldyBSb21hbixzZXJpZixzYW5zLXNlcmlmLC4uLlxuXHRcdFx0Zm9udFN0eWxlOiAnYm9sZCcsIC8vbm9ybWFsLGl0YWxpYyxvYmxpcXVlLGJvbGQsYm9sZGVyLGxpZ2h0ZXIsMTAwLDIwMCwzMDAsNDAwLDUwMCw2MDAsNzAwLDgwMCw5MDBcblx0XHRcdHR5cGU6ICdjaXJjbGUnLFxuXHRcdFx0cG9zaXRpb246ICdkb3duJywgLy8gZG93biwgdXAsIGxlZnQsIGxlZnR1cCAodXBsZWZ0KVxuXHRcdFx0YW5pbWF0aW9uOiAnc2xpZGUnLFxuXHRcdFx0ZWxlbWVudElkOiBmYWxzZSxcblx0XHRcdGRhdGFVcmw6IGZhbHNlLFxuXHRcdFx0d2luOiB3aW5kb3dcblx0XHR9O1xuXHRcdHZhciBfb3B0LCBfb3JpZywgX2gsIF93LCBfY2FudmFzLCBfY29udGV4dCwgX2ltZywgX3JlYWR5LCBfbGFzdEJhZGdlLCBfcnVubmluZywgX3JlYWR5Q2IsIF9zdG9wLCBfYnJvd3NlciwgX2FuaW1UaW1lb3V0LCBfZHJhd1RpbWVvdXQsIF9kb2M7XG5cblx0XHRfYnJvd3NlciA9IHt9O1xuXHRcdF9icm93c2VyLmZmID0gdHlwZW9mIEluc3RhbGxUcmlnZ2VyICE9ICd1bmRlZmluZWQnO1xuXHRcdF9icm93c2VyLmNocm9tZSA9ICEhd2luZG93LmNocm9tZTtcblx0XHRfYnJvd3Nlci5vcGVyYSA9ICEhd2luZG93Lm9wZXJhIHx8IG5hdmlnYXRvci51c2VyQWdlbnQuaW5kZXhPZignT3BlcmEnKSA+PSAwO1xuXHRcdF9icm93c2VyLmllID0gLypAY2Nfb24hQCovZmFsc2U7XG5cdFx0X2Jyb3dzZXIuc2FmYXJpID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHdpbmRvdy5IVE1MRWxlbWVudCkuaW5kZXhPZignQ29uc3RydWN0b3InKSA+IDA7XG5cdFx0X2Jyb3dzZXIuc3VwcG9ydGVkID0gKF9icm93c2VyLmNocm9tZSB8fCBfYnJvd3Nlci5mZiB8fCBfYnJvd3Nlci5vcGVyYSk7XG5cblx0XHR2YXIgX3F1ZXVlID0gW107XG5cdFx0X3JlYWR5Q2IgPSBmdW5jdGlvbiAoKSB7XG5cdFx0fTtcblx0XHRfcmVhZHkgPSBfc3RvcCA9IGZhbHNlO1xuXHRcdC8qKlxuXHRcdCAqIEluaXRpYWxpemUgZmF2aWNvXG5cdFx0ICovXG5cdFx0dmFyIGluaXQgPSBmdW5jdGlvbiAoKSB7XG5cdFx0XHQvL21lcmdlIGluaXRpYWwgb3B0aW9uc1xuXHRcdFx0X29wdCA9IG1lcmdlKF9kZWYsIG9wdCk7XG5cdFx0XHRfb3B0LmJnQ29sb3IgPSBoZXhUb1JnYihfb3B0LmJnQ29sb3IpO1xuXHRcdFx0X29wdC50ZXh0Q29sb3IgPSBoZXhUb1JnYihfb3B0LnRleHRDb2xvcik7XG5cdFx0XHRfb3B0LnBvc2l0aW9uID0gX29wdC5wb3NpdGlvbi50b0xvd2VyQ2FzZSgpO1xuXHRcdFx0X29wdC5hbmltYXRpb24gPSAoYW5pbWF0aW9uLnR5cGVzWycnICsgX29wdC5hbmltYXRpb25dKSA/IF9vcHQuYW5pbWF0aW9uIDogX2RlZi5hbmltYXRpb247XG5cblx0XHRcdF9kb2MgPSBfb3B0Lndpbi5kb2N1bWVudDtcblxuXHRcdFx0dmFyIGlzVXAgPSBfb3B0LnBvc2l0aW9uLmluZGV4T2YoJ3VwJykgPiAtMTtcblx0XHRcdHZhciBpc0xlZnQgPSBfb3B0LnBvc2l0aW9uLmluZGV4T2YoJ2xlZnQnKSA+IC0xO1xuXG5cdFx0XHQvL3RyYW5zZm9ybSBhbmltYXRpb25cblx0XHRcdGlmIChpc1VwIHx8IGlzTGVmdCkge1xuXHRcdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGFuaW1hdGlvbi50eXBlc1snJyArIF9vcHQuYW5pbWF0aW9uXS5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRcdHZhciBzdGVwID0gYW5pbWF0aW9uLnR5cGVzWycnICsgX29wdC5hbmltYXRpb25dW2ldO1xuXG5cdFx0XHRcdFx0aWYgKGlzVXApIHtcblx0XHRcdFx0XHRcdGlmIChzdGVwLnkgPCAwLjYpIHtcblx0XHRcdFx0XHRcdFx0c3RlcC55ID0gc3RlcC55IC0gMC40O1xuXHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0c3RlcC55ID0gc3RlcC55IC0gMiAqIHN0ZXAueSArICgxIC0gc3RlcC53KTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRpZiAoaXNMZWZ0KSB7XG5cdFx0XHRcdFx0XHRpZiAoc3RlcC54IDwgMC42KSB7XG5cdFx0XHRcdFx0XHRcdHN0ZXAueCA9IHN0ZXAueCAtIDAuNDtcblx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdHN0ZXAueCA9IHN0ZXAueCAtIDIgKiBzdGVwLnggKyAoMSAtIHN0ZXAuaCk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0YW5pbWF0aW9uLnR5cGVzWycnICsgX29wdC5hbmltYXRpb25dW2ldID0gc3RlcDtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0X29wdC50eXBlID0gKHR5cGVbJycgKyBfb3B0LnR5cGVdKSA/IF9vcHQudHlwZSA6IF9kZWYudHlwZTtcblxuXHRcdFx0X29yaWcgPSBsaW5rLmdldEljb24oKTtcblx0XHRcdC8vY3JlYXRlIHRlbXAgY2FudmFzXG5cdFx0XHRfY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG5cdFx0XHQvL2NyZWF0ZSB0ZW1wIGltYWdlXG5cdFx0XHRfaW1nID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW1nJyk7XG5cdFx0XHRpZiAoX29yaWcuaGFzQXR0cmlidXRlKCdocmVmJykpIHtcblx0XHRcdFx0X2ltZy5zZXRBdHRyaWJ1dGUoJ2Nyb3NzT3JpZ2luJywgJ2Fub255bW91cycpO1xuXHRcdFx0XHQvL2dldCB3aWR0aC9oZWlnaHRcblx0XHRcdFx0X2ltZy5vbmxvYWQgPSBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0X2ggPSAoX2ltZy5oZWlnaHQgPiAwKSA/IF9pbWcuaGVpZ2h0IDogMzI7XG5cdFx0XHRcdFx0X3cgPSAoX2ltZy53aWR0aCA+IDApID8gX2ltZy53aWR0aCA6IDMyO1xuXHRcdFx0XHRcdF9jYW52YXMuaGVpZ2h0ID0gX2g7XG5cdFx0XHRcdFx0X2NhbnZhcy53aWR0aCA9IF93O1xuXHRcdFx0XHRcdF9jb250ZXh0ID0gX2NhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuXHRcdFx0XHRcdGljb24ucmVhZHkoKTtcblx0XHRcdFx0fTtcblx0XHRcdFx0X2ltZy5zZXRBdHRyaWJ1dGUoJ3NyYycsIF9vcmlnLmdldEF0dHJpYnV0ZSgnaHJlZicpKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdF9pbWcub25sb2FkID0gZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdF9oID0gMzI7XG5cdFx0XHRcdFx0X3cgPSAzMjtcblx0XHRcdFx0XHRfaW1nLmhlaWdodCA9IF9oO1xuXHRcdFx0XHRcdF9pbWcud2lkdGggPSBfdztcblx0XHRcdFx0XHRfY2FudmFzLmhlaWdodCA9IF9oO1xuXHRcdFx0XHRcdF9jYW52YXMud2lkdGggPSBfdztcblx0XHRcdFx0XHRfY29udGV4dCA9IF9jYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcblx0XHRcdFx0XHRpY29uLnJlYWR5KCk7XG5cdFx0XHRcdH07XG5cdFx0XHRcdF9pbWcuc2V0QXR0cmlidXRlKCdzcmMnLCAnJyk7XG5cdFx0XHR9XG5cblx0XHR9O1xuXHRcdC8qKlxuXHRcdCAqIEljb24gbmFtZXNwYWNlXG5cdFx0ICovXG5cdFx0dmFyIGljb24gPSB7fTtcblx0XHQvKipcblx0XHQgKiBJY29uIGlzIHJlYWR5IChyZXNldCBpY29uKSBhbmQgc3RhcnQgYW5pbWF0aW9uIChpZiB0aGVyIGlzIGFueSlcblx0XHQgKi9cblx0XHRpY29uLnJlYWR5ID0gZnVuY3Rpb24gKCkge1xuXHRcdFx0X3JlYWR5ID0gdHJ1ZTtcblx0XHRcdGljb24ucmVzZXQoKTtcblx0XHRcdF9yZWFkeUNiKCk7XG5cdFx0fTtcblx0XHQvKipcblx0XHQgKiBSZXNldCBpY29uIHRvIGRlZmF1bHQgc3RhdGVcblx0XHQgKi9cblx0XHRpY29uLnJlc2V0ID0gZnVuY3Rpb24gKCkge1xuXHRcdFx0Ly9yZXNldFxuXHRcdFx0aWYgKCFfcmVhZHkpIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdFx0X3F1ZXVlID0gW107XG5cdFx0XHRfbGFzdEJhZGdlID0gZmFsc2U7XG5cdFx0XHRfcnVubmluZyA9IGZhbHNlO1xuXHRcdFx0X2NvbnRleHQuY2xlYXJSZWN0KDAsIDAsIF93LCBfaCk7XG5cdFx0XHRfY29udGV4dC5kcmF3SW1hZ2UoX2ltZywgMCwgMCwgX3csIF9oKTtcblx0XHRcdC8vX3N0b3A9dHJ1ZTtcblx0XHRcdGxpbmsuc2V0SWNvbihfY2FudmFzKTtcblx0XHRcdC8vd2ViY2FtKCdzdG9wJyk7XG5cdFx0XHQvL3ZpZGVvKCdzdG9wJyk7XG5cdFx0XHR3aW5kb3cuY2xlYXJUaW1lb3V0KF9hbmltVGltZW91dCk7XG5cdFx0XHR3aW5kb3cuY2xlYXJUaW1lb3V0KF9kcmF3VGltZW91dCk7XG5cdFx0fTtcblx0XHQvKipcblx0XHQgKiBTdGFydCBhbmltYXRpb25cblx0XHQgKi9cblx0XHRpY29uLnN0YXJ0ID0gZnVuY3Rpb24gKCkge1xuXHRcdFx0aWYgKCFfcmVhZHkgfHwgX3J1bm5pbmcpIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdFx0dmFyIGZpbmlzaGVkID0gZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRfbGFzdEJhZGdlID0gX3F1ZXVlWzBdO1xuXHRcdFx0XHRfcnVubmluZyA9IGZhbHNlO1xuXHRcdFx0XHRpZiAoX3F1ZXVlLmxlbmd0aCA+IDApIHtcblx0XHRcdFx0XHRfcXVldWUuc2hpZnQoKTtcblx0XHRcdFx0XHRpY29uLnN0YXJ0KCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cblx0XHRcdFx0fVxuXHRcdFx0fTtcblx0XHRcdGlmIChfcXVldWUubGVuZ3RoID4gMCkge1xuXHRcdFx0XHRfcnVubmluZyA9IHRydWU7XG5cdFx0XHRcdHZhciBydW4gPSBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0Ly8gYXBwbHkgb3B0aW9ucyBmb3IgdGhpcyBhbmltYXRpb25cblx0XHRcdFx0XHRbJ3R5cGUnLCAnYW5pbWF0aW9uJywgJ2JnQ29sb3InLCAndGV4dENvbG9yJywgJ2ZvbnRGYW1pbHknLCAnZm9udFN0eWxlJ10uZm9yRWFjaChmdW5jdGlvbiAoYSkge1xuXHRcdFx0XHRcdFx0aWYgKGEgaW4gX3F1ZXVlWzBdLm9wdGlvbnMpIHtcblx0XHRcdFx0XHRcdFx0X29wdFthXSA9IF9xdWV1ZVswXS5vcHRpb25zW2FdO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdGFuaW1hdGlvbi5ydW4oX3F1ZXVlWzBdLm9wdGlvbnMsIGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRcdGZpbmlzaGVkKCk7XG5cdFx0XHRcdFx0fSwgZmFsc2UpO1xuXHRcdFx0XHR9O1xuXHRcdFx0XHRpZiAoX2xhc3RCYWRnZSkge1xuXHRcdFx0XHRcdGFuaW1hdGlvbi5ydW4oX2xhc3RCYWRnZS5vcHRpb25zLCBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0XHRydW4oKTtcblx0XHRcdFx0XHR9LCB0cnVlKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRydW4oKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH07XG5cblx0XHQvKipcblx0XHQgKiBCYWRnZSB0eXBlc1xuXHRcdCAqL1xuXHRcdHZhciB0eXBlID0ge307XG5cdFx0dmFyIG9wdGlvbnMgPSBmdW5jdGlvbiAob3B0KSB7XG5cdFx0XHRvcHQubiA9ICgodHlwZW9mIG9wdC5uKSA9PT0gJ251bWJlcicpID8gTWF0aC5hYnMob3B0Lm4gfCAwKSA6IG9wdC5uO1xuXHRcdFx0b3B0LnggPSBfdyAqIG9wdC54O1xuXHRcdFx0b3B0LnkgPSBfaCAqIG9wdC55O1xuXHRcdFx0b3B0LncgPSBfdyAqIG9wdC53O1xuXHRcdFx0b3B0LmggPSBfaCAqIG9wdC5oO1xuXHRcdFx0b3B0LmxlbiA9IChcIlwiICsgb3B0Lm4pLmxlbmd0aDtcblx0XHRcdHJldHVybiBvcHQ7XG5cdFx0fTtcblx0XHQvKipcblx0XHQgKiBHZW5lcmF0ZSBjaXJjbGVcblx0XHQgKiBAcGFyYW0ge09iamVjdH0gb3B0IEJhZGdlIG9wdGlvbnNcblx0XHQgKi9cblx0XHR0eXBlLmNpcmNsZSA9IGZ1bmN0aW9uIChvcHQpIHtcblx0XHRcdG9wdCA9IG9wdGlvbnMob3B0KTtcblx0XHRcdHZhciBtb3JlID0gZmFsc2U7XG5cdFx0XHRpZiAob3B0LmxlbiA9PT0gMikge1xuXHRcdFx0XHRvcHQueCA9IG9wdC54IC0gb3B0LncgKiAwLjQ7XG5cdFx0XHRcdG9wdC53ID0gb3B0LncgKiAxLjQ7XG5cdFx0XHRcdG1vcmUgPSB0cnVlO1xuXHRcdFx0fSBlbHNlIGlmIChvcHQubGVuID49IDMpIHtcblx0XHRcdFx0b3B0LnggPSBvcHQueCAtIG9wdC53ICogMC42NTtcblx0XHRcdFx0b3B0LncgPSBvcHQudyAqIDEuNjU7XG5cdFx0XHRcdG1vcmUgPSB0cnVlO1xuXHRcdFx0fVxuXHRcdFx0X2NvbnRleHQuY2xlYXJSZWN0KDAsIDAsIF93LCBfaCk7XG5cdFx0XHRfY29udGV4dC5kcmF3SW1hZ2UoX2ltZywgMCwgMCwgX3csIF9oKTtcblx0XHRcdF9jb250ZXh0LmJlZ2luUGF0aCgpO1xuXHRcdFx0X2NvbnRleHQuZm9udCA9IF9vcHQuZm9udFN0eWxlICsgXCIgXCIgKyBNYXRoLmZsb29yKG9wdC5oICogKG9wdC5uID4gOTkgPyAwLjg1IDogMSkpICsgXCJweCBcIiArIF9vcHQuZm9udEZhbWlseTtcblx0XHRcdF9jb250ZXh0LnRleHRBbGlnbiA9ICdjZW50ZXInO1xuXHRcdFx0aWYgKG1vcmUpIHtcblx0XHRcdFx0X2NvbnRleHQubW92ZVRvKG9wdC54ICsgb3B0LncgLyAyLCBvcHQueSk7XG5cdFx0XHRcdF9jb250ZXh0LmxpbmVUbyhvcHQueCArIG9wdC53IC0gb3B0LmggLyAyLCBvcHQueSk7XG5cdFx0XHRcdF9jb250ZXh0LnF1YWRyYXRpY0N1cnZlVG8ob3B0LnggKyBvcHQudywgb3B0LnksIG9wdC54ICsgb3B0LncsIG9wdC55ICsgb3B0LmggLyAyKTtcblx0XHRcdFx0X2NvbnRleHQubGluZVRvKG9wdC54ICsgb3B0LncsIG9wdC55ICsgb3B0LmggLSBvcHQuaCAvIDIpO1xuXHRcdFx0XHRfY29udGV4dC5xdWFkcmF0aWNDdXJ2ZVRvKG9wdC54ICsgb3B0LncsIG9wdC55ICsgb3B0LmgsIG9wdC54ICsgb3B0LncgLSBvcHQuaCAvIDIsIG9wdC55ICsgb3B0LmgpO1xuXHRcdFx0XHRfY29udGV4dC5saW5lVG8ob3B0LnggKyBvcHQuaCAvIDIsIG9wdC55ICsgb3B0LmgpO1xuXHRcdFx0XHRfY29udGV4dC5xdWFkcmF0aWNDdXJ2ZVRvKG9wdC54LCBvcHQueSArIG9wdC5oLCBvcHQueCwgb3B0LnkgKyBvcHQuaCAtIG9wdC5oIC8gMik7XG5cdFx0XHRcdF9jb250ZXh0LmxpbmVUbyhvcHQueCwgb3B0LnkgKyBvcHQuaCAvIDIpO1xuXHRcdFx0XHRfY29udGV4dC5xdWFkcmF0aWNDdXJ2ZVRvKG9wdC54LCBvcHQueSwgb3B0LnggKyBvcHQuaCAvIDIsIG9wdC55KTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdF9jb250ZXh0LmFyYyhvcHQueCArIG9wdC53IC8gMiwgb3B0LnkgKyBvcHQuaCAvIDIsIG9wdC5oIC8gMiwgMCwgMiAqIE1hdGguUEkpO1xuXHRcdFx0fVxuXHRcdFx0X2NvbnRleHQuZmlsbFN0eWxlID0gJ3JnYmEoJyArIF9vcHQuYmdDb2xvci5yICsgJywnICsgX29wdC5iZ0NvbG9yLmcgKyAnLCcgKyBfb3B0LmJnQ29sb3IuYiArICcsJyArIG9wdC5vICsgJyknO1xuXHRcdFx0X2NvbnRleHQuZmlsbCgpO1xuXHRcdFx0X2NvbnRleHQuY2xvc2VQYXRoKCk7XG5cdFx0XHRfY29udGV4dC5iZWdpblBhdGgoKTtcblx0XHRcdF9jb250ZXh0LnN0cm9rZSgpO1xuXHRcdFx0X2NvbnRleHQuZmlsbFN0eWxlID0gJ3JnYmEoJyArIF9vcHQudGV4dENvbG9yLnIgKyAnLCcgKyBfb3B0LnRleHRDb2xvci5nICsgJywnICsgX29wdC50ZXh0Q29sb3IuYiArICcsJyArIG9wdC5vICsgJyknO1xuXHRcdFx0Ly9fY29udGV4dC5maWxsVGV4dCgobW9yZSkgPyAnOSsnIDogb3B0Lm4sIE1hdGguZmxvb3Iob3B0LnggKyBvcHQudyAvIDIpLCBNYXRoLmZsb29yKG9wdC55ICsgb3B0LmggLSBvcHQuaCAqIDAuMTUpKTtcblx0XHRcdGlmICgodHlwZW9mIG9wdC5uKSA9PT0gJ251bWJlcicgJiYgb3B0Lm4gPiA5OTkpIHtcblx0XHRcdFx0X2NvbnRleHQuZmlsbFRleHQoKChvcHQubiA+IDk5OTkpID8gOSA6IE1hdGguZmxvb3Iob3B0Lm4gLyAxMDAwKSkgKyAnaysnLCBNYXRoLmZsb29yKG9wdC54ICsgb3B0LncgLyAyKSwgTWF0aC5mbG9vcihvcHQueSArIG9wdC5oIC0gb3B0LmggKiAwLjIpKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdF9jb250ZXh0LmZpbGxUZXh0KG9wdC5uLCBNYXRoLmZsb29yKG9wdC54ICsgb3B0LncgLyAyKSwgTWF0aC5mbG9vcihvcHQueSArIG9wdC5oIC0gb3B0LmggKiAwLjE1KSk7XG5cdFx0XHR9XG5cdFx0XHRfY29udGV4dC5jbG9zZVBhdGgoKTtcblx0XHR9O1xuXHRcdC8qKlxuXHRcdCAqIEdlbmVyYXRlIHJlY3RhbmdsZVxuXHRcdCAqIEBwYXJhbSB7T2JqZWN0fSBvcHQgQmFkZ2Ugb3B0aW9uc1xuXHRcdCAqL1xuXHRcdHR5cGUucmVjdGFuZ2xlID0gZnVuY3Rpb24gKG9wdCkge1xuXHRcdFx0b3B0ID0gb3B0aW9ucyhvcHQpO1xuXHRcdFx0dmFyIG1vcmUgPSBmYWxzZTtcblx0XHRcdGlmIChvcHQubGVuID09PSAyKSB7XG5cdFx0XHRcdG9wdC54ID0gb3B0LnggLSBvcHQudyAqIDAuNDtcblx0XHRcdFx0b3B0LncgPSBvcHQudyAqIDEuNDtcblx0XHRcdFx0bW9yZSA9IHRydWU7XG5cdFx0XHR9IGVsc2UgaWYgKG9wdC5sZW4gPj0gMykge1xuXHRcdFx0XHRvcHQueCA9IG9wdC54IC0gb3B0LncgKiAwLjY1O1xuXHRcdFx0XHRvcHQudyA9IG9wdC53ICogMS42NTtcblx0XHRcdFx0bW9yZSA9IHRydWU7XG5cdFx0XHR9XG5cdFx0XHRfY29udGV4dC5jbGVhclJlY3QoMCwgMCwgX3csIF9oKTtcblx0XHRcdF9jb250ZXh0LmRyYXdJbWFnZShfaW1nLCAwLCAwLCBfdywgX2gpO1xuXHRcdFx0X2NvbnRleHQuYmVnaW5QYXRoKCk7XG5cdFx0XHRfY29udGV4dC5mb250ID0gX29wdC5mb250U3R5bGUgKyBcIiBcIiArIE1hdGguZmxvb3Iob3B0LmggKiAob3B0Lm4gPiA5OSA/IDAuOSA6IDEpKSArIFwicHggXCIgKyBfb3B0LmZvbnRGYW1pbHk7XG5cdFx0XHRfY29udGV4dC50ZXh0QWxpZ24gPSAnY2VudGVyJztcblx0XHRcdF9jb250ZXh0LmZpbGxTdHlsZSA9ICdyZ2JhKCcgKyBfb3B0LmJnQ29sb3IuciArICcsJyArIF9vcHQuYmdDb2xvci5nICsgJywnICsgX29wdC5iZ0NvbG9yLmIgKyAnLCcgKyBvcHQubyArICcpJztcblx0XHRcdF9jb250ZXh0LmZpbGxSZWN0KG9wdC54LCBvcHQueSwgb3B0LncsIG9wdC5oKTtcblx0XHRcdF9jb250ZXh0LmZpbGxTdHlsZSA9ICdyZ2JhKCcgKyBfb3B0LnRleHRDb2xvci5yICsgJywnICsgX29wdC50ZXh0Q29sb3IuZyArICcsJyArIF9vcHQudGV4dENvbG9yLmIgKyAnLCcgKyBvcHQubyArICcpJztcblx0XHRcdC8vX2NvbnRleHQuZmlsbFRleHQoKG1vcmUpID8gJzkrJyA6IG9wdC5uLCBNYXRoLmZsb29yKG9wdC54ICsgb3B0LncgLyAyKSwgTWF0aC5mbG9vcihvcHQueSArIG9wdC5oIC0gb3B0LmggKiAwLjE1KSk7XG5cdFx0XHRpZiAoKHR5cGVvZiBvcHQubikgPT09ICdudW1iZXInICYmIG9wdC5uID4gOTk5KSB7XG5cdFx0XHRcdF9jb250ZXh0LmZpbGxUZXh0KCgob3B0Lm4gPiA5OTk5KSA/IDkgOiBNYXRoLmZsb29yKG9wdC5uIC8gMTAwMCkpICsgJ2srJywgTWF0aC5mbG9vcihvcHQueCArIG9wdC53IC8gMiksIE1hdGguZmxvb3Iob3B0LnkgKyBvcHQuaCAtIG9wdC5oICogMC4yKSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRfY29udGV4dC5maWxsVGV4dChvcHQubiwgTWF0aC5mbG9vcihvcHQueCArIG9wdC53IC8gMiksIE1hdGguZmxvb3Iob3B0LnkgKyBvcHQuaCAtIG9wdC5oICogMC4xNSkpO1xuXHRcdFx0fVxuXHRcdFx0X2NvbnRleHQuY2xvc2VQYXRoKCk7XG5cdFx0fTtcblxuXHRcdC8qKlxuXHRcdCAqIFNldCBiYWRnZVxuXHRcdCAqL1xuXHRcdHZhciBiYWRnZSA9IGZ1bmN0aW9uIChudW1iZXIsIG9wdHMpIHtcblx0XHRcdG9wdHMgPSAoKHR5cGVvZiBvcHRzKSA9PT0gJ3N0cmluZycgPyB7XG5cdFx0XHRcdGFuaW1hdGlvbjogb3B0c1xuXHRcdFx0fSA6IG9wdHMpIHx8IHt9O1xuXHRcdFx0X3JlYWR5Q2IgPSBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0aWYgKHR5cGVvZiAobnVtYmVyKSA9PT0gJ251bWJlcicgPyAobnVtYmVyID4gMCkgOiAobnVtYmVyICE9PSAnJykpIHtcblx0XHRcdFx0XHRcdHZhciBxID0ge1xuXHRcdFx0XHRcdFx0XHR0eXBlOiAnYmFkZ2UnLFxuXHRcdFx0XHRcdFx0XHRvcHRpb25zOiB7XG5cdFx0XHRcdFx0XHRcdFx0bjogbnVtYmVyXG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XHRpZiAoJ2FuaW1hdGlvbicgaW4gb3B0cyAmJiBhbmltYXRpb24udHlwZXNbJycgKyBvcHRzLmFuaW1hdGlvbl0pIHtcblx0XHRcdFx0XHRcdFx0cS5vcHRpb25zLmFuaW1hdGlvbiA9ICcnICsgb3B0cy5hbmltYXRpb247XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRpZiAoJ3R5cGUnIGluIG9wdHMgJiYgdHlwZVsnJyArIG9wdHMudHlwZV0pIHtcblx0XHRcdFx0XHRcdFx0cS5vcHRpb25zLnR5cGUgPSAnJyArIG9wdHMudHlwZTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFsnYmdDb2xvcicsICd0ZXh0Q29sb3InXS5mb3JFYWNoKGZ1bmN0aW9uIChvKSB7XG5cdFx0XHRcdFx0XHRcdGlmIChvIGluIG9wdHMpIHtcblx0XHRcdFx0XHRcdFx0XHRxLm9wdGlvbnNbb10gPSBoZXhUb1JnYihvcHRzW29dKTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHRbJ2ZvbnRTdHlsZScsICdmb250RmFtaWx5J10uZm9yRWFjaChmdW5jdGlvbiAobykge1xuXHRcdFx0XHRcdFx0XHRpZiAobyBpbiBvcHRzKSB7XG5cdFx0XHRcdFx0XHRcdFx0cS5vcHRpb25zW29dID0gb3B0c1tvXTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHRfcXVldWUucHVzaChxKTtcblx0XHRcdFx0XHRcdGlmIChfcXVldWUubGVuZ3RoID4gMTAwKSB7XG5cdFx0XHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcignVG9vIG1hbnkgYmFkZ2VzIHJlcXVlc3RzIGluIHF1ZXVlLicpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0aWNvbi5zdGFydCgpO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRpY29uLnJlc2V0KCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9IGNhdGNoIChlKSB7XG5cdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKCdFcnJvciBzZXR0aW5nIGJhZGdlLiBNZXNzYWdlOiAnICsgZS5tZXNzYWdlKTtcblx0XHRcdFx0fVxuXHRcdFx0fTtcblx0XHRcdGlmIChfcmVhZHkpIHtcblx0XHRcdFx0X3JlYWR5Q2IoKTtcblx0XHRcdH1cblx0XHR9O1xuXG5cdFx0LyoqXG5cdFx0ICogU2V0IGltYWdlIGFzIGljb25cblx0XHQgKi9cblx0XHR2YXIgaW1hZ2UgPSBmdW5jdGlvbiAoaW1hZ2VFbGVtZW50KSB7XG5cdFx0XHRfcmVhZHlDYiA9IGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHR2YXIgdyA9IGltYWdlRWxlbWVudC53aWR0aDtcblx0XHRcdFx0XHR2YXIgaCA9IGltYWdlRWxlbWVudC5oZWlnaHQ7XG5cdFx0XHRcdFx0dmFyIG5ld0ltZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2ltZycpO1xuXHRcdFx0XHRcdHZhciByYXRpbyA9ICh3IC8gX3cgPCBoIC8gX2gpID8gKHcgLyBfdykgOiAoaCAvIF9oKTtcblx0XHRcdFx0XHRuZXdJbWcuc2V0QXR0cmlidXRlKCdjcm9zc09yaWdpbicsICdhbm9ueW1vdXMnKTtcblx0XHRcdFx0XHRuZXdJbWcub25sb2FkPWZ1bmN0aW9uKCl7XG5cdFx0XHRcdFx0XHRfY29udGV4dC5jbGVhclJlY3QoMCwgMCwgX3csIF9oKTtcblx0XHRcdFx0XHRcdF9jb250ZXh0LmRyYXdJbWFnZShuZXdJbWcsIDAsIDAsIF93LCBfaCk7XG5cdFx0XHRcdFx0XHRsaW5rLnNldEljb24oX2NhbnZhcyk7XG5cdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRuZXdJbWcuc2V0QXR0cmlidXRlKCdzcmMnLCBpbWFnZUVsZW1lbnQuZ2V0QXR0cmlidXRlKCdzcmMnKSk7XG5cdFx0XHRcdFx0bmV3SW1nLmhlaWdodCA9IChoIC8gcmF0aW8pO1xuXHRcdFx0XHRcdG5ld0ltZy53aWR0aCA9ICh3IC8gcmF0aW8pO1xuXHRcdFx0XHR9IGNhdGNoIChlKSB7XG5cdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKCdFcnJvciBzZXR0aW5nIGltYWdlLiBNZXNzYWdlOiAnICsgZS5tZXNzYWdlKTtcblx0XHRcdFx0fVxuXHRcdFx0fTtcblx0XHRcdGlmIChfcmVhZHkpIHtcblx0XHRcdFx0X3JlYWR5Q2IoKTtcblx0XHRcdH1cblx0XHR9O1xuXHRcdC8qKlxuXHRcdCAqIFNldCB2aWRlbyBhcyBpY29uXG5cdFx0ICovXG5cdFx0dmFyIHZpZGVvID0gZnVuY3Rpb24gKHZpZGVvRWxlbWVudCkge1xuXHRcdFx0X3JlYWR5Q2IgPSBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0aWYgKHZpZGVvRWxlbWVudCA9PT0gJ3N0b3AnKSB7XG5cdFx0XHRcdFx0XHRfc3RvcCA9IHRydWU7XG5cdFx0XHRcdFx0XHRpY29uLnJlc2V0KCk7XG5cdFx0XHRcdFx0XHRfc3RvcCA9IGZhbHNlO1xuXHRcdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHQvL3ZhciB3ID0gdmlkZW9FbGVtZW50LndpZHRoO1xuXHRcdFx0XHRcdC8vdmFyIGggPSB2aWRlb0VsZW1lbnQuaGVpZ2h0O1xuXHRcdFx0XHRcdC8vdmFyIHJhdGlvID0gKHcgLyBfdyA8IGggLyBfaCkgPyAodyAvIF93KSA6IChoIC8gX2gpO1xuXHRcdFx0XHRcdHZpZGVvRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdwbGF5JywgZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdFx0ZHJhd1ZpZGVvKHRoaXMpO1xuXHRcdFx0XHRcdH0sIGZhbHNlKTtcblxuXHRcdFx0XHR9IGNhdGNoIChlKSB7XG5cdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKCdFcnJvciBzZXR0aW5nIHZpZGVvLiBNZXNzYWdlOiAnICsgZS5tZXNzYWdlKTtcblx0XHRcdFx0fVxuXHRcdFx0fTtcblx0XHRcdGlmIChfcmVhZHkpIHtcblx0XHRcdFx0X3JlYWR5Q2IoKTtcblx0XHRcdH1cblx0XHR9O1xuXHRcdC8qKlxuXHRcdCAqIFNldCB2aWRlbyBhcyBpY29uXG5cdFx0ICovXG5cdFx0dmFyIHdlYmNhbSA9IGZ1bmN0aW9uIChhY3Rpb24pIHtcblx0XHRcdC8vVVJcblx0XHRcdGlmICghd2luZG93LlVSTCB8fCAhd2luZG93LlVSTC5jcmVhdGVPYmplY3RVUkwpIHtcblx0XHRcdFx0d2luZG93LlVSTCA9IHdpbmRvdy5VUkwgfHwge307XG5cdFx0XHRcdHdpbmRvdy5VUkwuY3JlYXRlT2JqZWN0VVJMID0gZnVuY3Rpb24gKG9iaikge1xuXHRcdFx0XHRcdHJldHVybiBvYmo7XG5cdFx0XHRcdH07XG5cdFx0XHR9XG5cdFx0XHRpZiAoX2Jyb3dzZXIuc3VwcG9ydGVkKSB7XG5cdFx0XHRcdHZhciBuZXdWaWRlbyA9IGZhbHNlO1xuXHRcdFx0XHRuYXZpZ2F0b3IuZ2V0VXNlck1lZGlhID0gbmF2aWdhdG9yLmdldFVzZXJNZWRpYSB8fCBuYXZpZ2F0b3Iub0dldFVzZXJNZWRpYSB8fCBuYXZpZ2F0b3IubXNHZXRVc2VyTWVkaWEgfHwgbmF2aWdhdG9yLm1vekdldFVzZXJNZWRpYSB8fCBuYXZpZ2F0b3Iud2Via2l0R2V0VXNlck1lZGlhO1xuXHRcdFx0XHRfcmVhZHlDYiA9IGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdFx0aWYgKGFjdGlvbiA9PT0gJ3N0b3AnKSB7XG5cdFx0XHRcdFx0XHRcdF9zdG9wID0gdHJ1ZTtcblx0XHRcdFx0XHRcdFx0aWNvbi5yZXNldCgpO1xuXHRcdFx0XHRcdFx0XHRfc3RvcCA9IGZhbHNlO1xuXHRcdFx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRuZXdWaWRlbyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3ZpZGVvJyk7XG5cdFx0XHRcdFx0XHRuZXdWaWRlby53aWR0aCA9IF93O1xuXHRcdFx0XHRcdFx0bmV3VmlkZW8uaGVpZ2h0ID0gX2g7XG5cdFx0XHRcdFx0XHRuYXZpZ2F0b3IuZ2V0VXNlck1lZGlhKHtcblx0XHRcdFx0XHRcdFx0dmlkZW86IHRydWUsXG5cdFx0XHRcdFx0XHRcdGF1ZGlvOiBmYWxzZVxuXHRcdFx0XHRcdFx0fSwgZnVuY3Rpb24gKHN0cmVhbSkge1xuXHRcdFx0XHRcdFx0XHRuZXdWaWRlby5zcmMgPSBVUkwuY3JlYXRlT2JqZWN0VVJMKHN0cmVhbSk7XG5cdFx0XHRcdFx0XHRcdG5ld1ZpZGVvLnBsYXkoKTtcblx0XHRcdFx0XHRcdFx0ZHJhd1ZpZGVvKG5ld1ZpZGVvKTtcblx0XHRcdFx0XHRcdH0sIGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdH0gY2F0Y2ggKGUpIHtcblx0XHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcignRXJyb3Igc2V0dGluZyB3ZWJjYW0uIE1lc3NhZ2U6ICcgKyBlLm1lc3NhZ2UpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fTtcblx0XHRcdFx0aWYgKF9yZWFkeSkge1xuXHRcdFx0XHRcdF9yZWFkeUNiKCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdH07XG5cblx0XHQvKipcblx0XHQgKiBEcmF3IHZpZGVvIHRvIGNvbnRleHQgYW5kIHJlcGVhdCA6KVxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIGRyYXdWaWRlbyh2aWRlbykge1xuXHRcdFx0aWYgKHZpZGVvLnBhdXNlZCB8fCB2aWRlby5lbmRlZCB8fCBfc3RvcCkge1xuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHR9XG5cdFx0XHQvL25hc3R5IGhhY2sgZm9yIEZGIHdlYmNhbSAoVGhhbmtzIHRvIEp1bGlhbiDEhndpcmtvLCBrb250YWt0QHJlZHN1bm1lZGlhLnBsKVxuXHRcdFx0dHJ5IHtcblx0XHRcdFx0X2NvbnRleHQuY2xlYXJSZWN0KDAsIDAsIF93LCBfaCk7XG5cdFx0XHRcdF9jb250ZXh0LmRyYXdJbWFnZSh2aWRlbywgMCwgMCwgX3csIF9oKTtcblx0XHRcdH0gY2F0Y2ggKGUpIHtcblxuXHRcdFx0fVxuXHRcdFx0X2RyYXdUaW1lb3V0ID0gc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdGRyYXdWaWRlbyh2aWRlbyk7XG5cdFx0XHR9LCBhbmltYXRpb24uZHVyYXRpb24pO1xuXHRcdFx0bGluay5zZXRJY29uKF9jYW52YXMpO1xuXHRcdH1cblxuXHRcdHZhciBsaW5rID0ge307XG5cdFx0LyoqXG5cdFx0ICogR2V0IGljb24gZnJvbSBIRUFEIHRhZyBvciBjcmVhdGUgYSBuZXcgPGxpbms+IGVsZW1lbnRcblx0XHQgKi9cblx0XHRsaW5rLmdldEljb24gPSBmdW5jdGlvbiAoKSB7XG5cdFx0XHR2YXIgZWxtID0gZmFsc2U7XG5cdFx0XHQvL2dldCBsaW5rIGVsZW1lbnRcblx0XHRcdHZhciBnZXRMaW5rID0gZnVuY3Rpb24gKCkge1xuXHRcdFx0XHR2YXIgbGluayA9IF9kb2MuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2hlYWQnKVswXS5nZXRFbGVtZW50c0J5VGFnTmFtZSgnbGluaycpO1xuXHRcdFx0XHRmb3IgKHZhciBsID0gbGluay5sZW5ndGgsIGkgPSAobCAtIDEpOyBpID49IDA7IGktLSkge1xuXHRcdFx0XHRcdGlmICgoLyhefFxccylpY29uKFxcc3wkKS9pKS50ZXN0KGxpbmtbaV0uZ2V0QXR0cmlidXRlKCdyZWwnKSkpIHtcblx0XHRcdFx0XHRcdHJldHVybiBsaW5rW2ldO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHR9O1xuXHRcdFx0aWYgKF9vcHQuZWxlbWVudCkge1xuXHRcdFx0XHRlbG0gPSBfb3B0LmVsZW1lbnQ7XG5cdFx0XHR9IGVsc2UgaWYgKF9vcHQuZWxlbWVudElkKSB7XG5cdFx0XHRcdC8vaWYgaW1nIGVsZW1lbnQgaWRlbnRpZmllZCBieSBlbGVtZW50SWRcblx0XHRcdFx0ZWxtID0gX2RvYy5nZXRFbGVtZW50QnlJZChfb3B0LmVsZW1lbnRJZCk7XG5cdFx0XHRcdGVsbS5zZXRBdHRyaWJ1dGUoJ2hyZWYnLCBlbG0uZ2V0QXR0cmlidXRlKCdzcmMnKSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQvL2lmIGxpbmsgZWxlbWVudFxuXHRcdFx0XHRlbG0gPSBnZXRMaW5rKCk7XG5cdFx0XHRcdGlmIChlbG0gPT09IGZhbHNlKSB7XG5cdFx0XHRcdFx0ZWxtID0gX2RvYy5jcmVhdGVFbGVtZW50KCdsaW5rJyk7XG5cdFx0XHRcdFx0ZWxtLnNldEF0dHJpYnV0ZSgncmVsJywgJ2ljb24nKTtcblx0XHRcdFx0XHRfZG9jLmdldEVsZW1lbnRzQnlUYWdOYW1lKCdoZWFkJylbMF0uYXBwZW5kQ2hpbGQoZWxtKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0ZWxtLnNldEF0dHJpYnV0ZSgndHlwZScsICdpbWFnZS9wbmcnKTtcblx0XHRcdHJldHVybiBlbG07XG5cdFx0fTtcblx0XHRsaW5rLnNldEljb24gPSBmdW5jdGlvbiAoY2FudmFzKSB7XG5cdFx0XHR2YXIgdXJsID0gY2FudmFzLnRvRGF0YVVSTCgnaW1hZ2UvcG5nJyk7XG5cdFx0XHRpZiAoX29wdC5kYXRhVXJsKSB7XG5cdFx0XHRcdC8vaWYgdXNpbmcgY3VzdG9tIGV4cG9ydGVyXG5cdFx0XHRcdF9vcHQuZGF0YVVybCh1cmwpO1xuXHRcdFx0fVxuXHRcdFx0aWYgKF9vcHQuZWxlbWVudCkge1xuXHRcdFx0XHRfb3B0LmVsZW1lbnQuc2V0QXR0cmlidXRlKCdocmVmJywgdXJsKTtcblx0XHRcdFx0X29wdC5lbGVtZW50LnNldEF0dHJpYnV0ZSgnc3JjJywgdXJsKTtcblx0XHRcdH0gZWxzZSBpZiAoX29wdC5lbGVtZW50SWQpIHtcblx0XHRcdFx0Ly9pZiBpcyBhdHRhY2hlZCB0byBlbGVtZW50IChpbWFnZSlcblx0XHRcdFx0dmFyIGVsbSA9IF9kb2MuZ2V0RWxlbWVudEJ5SWQoX29wdC5lbGVtZW50SWQpO1xuXHRcdFx0XHRlbG0uc2V0QXR0cmlidXRlKCdocmVmJywgdXJsKTtcblx0XHRcdFx0ZWxtLnNldEF0dHJpYnV0ZSgnc3JjJywgdXJsKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdC8vaWYgaXMgYXR0YWNoZWQgdG8gZmF2IGljb25cblx0XHRcdFx0aWYgKF9icm93c2VyLmZmIHx8IF9icm93c2VyLm9wZXJhKSB7XG5cdFx0XHRcdFx0Ly9mb3IgRkYgd2UgbmVlZCB0byBcInJlY3JlYXRlXCIgZWxlbWVudCwgYXRhY2ggdG8gZG9tIGFuZCByZW1vdmUgb2xkIDxsaW5rPlxuXHRcdFx0XHRcdC8vdmFyIG9yaWdpbmFsVHlwZSA9IF9vcmlnLmdldEF0dHJpYnV0ZSgncmVsJyk7XG5cdFx0XHRcdFx0dmFyIG9sZCA9IF9vcmlnO1xuXHRcdFx0XHRcdF9vcmlnID0gX2RvYy5jcmVhdGVFbGVtZW50KCdsaW5rJyk7XG5cdFx0XHRcdFx0Ly9fb3JpZy5zZXRBdHRyaWJ1dGUoJ3JlbCcsIG9yaWdpbmFsVHlwZSk7XG5cdFx0XHRcdFx0aWYgKF9icm93c2VyLm9wZXJhKSB7XG5cdFx0XHRcdFx0XHRfb3JpZy5zZXRBdHRyaWJ1dGUoJ3JlbCcsICdpY29uJyk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdF9vcmlnLnNldEF0dHJpYnV0ZSgncmVsJywgJ2ljb24nKTtcblx0XHRcdFx0XHRfb3JpZy5zZXRBdHRyaWJ1dGUoJ3R5cGUnLCAnaW1hZ2UvcG5nJyk7XG5cdFx0XHRcdFx0X2RvYy5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaGVhZCcpWzBdLmFwcGVuZENoaWxkKF9vcmlnKTtcblx0XHRcdFx0XHRfb3JpZy5zZXRBdHRyaWJ1dGUoJ2hyZWYnLCB1cmwpO1xuXHRcdFx0XHRcdGlmIChvbGQucGFyZW50Tm9kZSkge1xuXHRcdFx0XHRcdFx0b2xkLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQob2xkKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0X29yaWcuc2V0QXR0cmlidXRlKCdocmVmJywgdXJsKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH07XG5cblx0XHQvL2h0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvNTYyMzgzOC9yZ2ItdG8taGV4LWFuZC1oZXgtdG8tcmdiI2Fuc3dlci01NjI0MTM5XG5cdFx0Ly9IRVggdG8gUkdCIGNvbnZlcnRvclxuXHRcdGZ1bmN0aW9uIGhleFRvUmdiKGhleCkge1xuXHRcdFx0dmFyIHNob3J0aGFuZFJlZ2V4ID0gL14jPyhbYS1mXFxkXSkoW2EtZlxcZF0pKFthLWZcXGRdKSQvaTtcblx0XHRcdGhleCA9IGhleC5yZXBsYWNlKHNob3J0aGFuZFJlZ2V4LCBmdW5jdGlvbiAobSwgciwgZywgYikge1xuXHRcdFx0XHRyZXR1cm4gciArIHIgKyBnICsgZyArIGIgKyBiO1xuXHRcdFx0fSk7XG5cdFx0XHR2YXIgcmVzdWx0ID0gL14jPyhbYS1mXFxkXXsyfSkoW2EtZlxcZF17Mn0pKFthLWZcXGRdezJ9KSQvaS5leGVjKGhleCk7XG5cdFx0XHRyZXR1cm4gcmVzdWx0ID8ge1xuXHRcdFx0XHRyOiBwYXJzZUludChyZXN1bHRbMV0sIDE2KSxcblx0XHRcdFx0ZzogcGFyc2VJbnQocmVzdWx0WzJdLCAxNiksXG5cdFx0XHRcdGI6IHBhcnNlSW50KHJlc3VsdFszXSwgMTYpXG5cdFx0XHR9IDogZmFsc2U7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogTWVyZ2Ugb3B0aW9uc1xuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIG1lcmdlKGRlZiwgb3B0KSB7XG5cdFx0XHR2YXIgbWVyZ2VkT3B0ID0ge307XG5cdFx0XHR2YXIgYXR0cm5hbWU7XG5cdFx0XHRmb3IgKGF0dHJuYW1lIGluIGRlZikge1xuXHRcdFx0XHRtZXJnZWRPcHRbYXR0cm5hbWVdID0gZGVmW2F0dHJuYW1lXTtcblx0XHRcdH1cblx0XHRcdGZvciAoYXR0cm5hbWUgaW4gb3B0KSB7XG5cdFx0XHRcdG1lcmdlZE9wdFthdHRybmFtZV0gPSBvcHRbYXR0cm5hbWVdO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIG1lcmdlZE9wdDtcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBDcm9zcy1icm93c2VyIHBhZ2UgdmlzaWJpbGl0eSBzaGltXG5cdFx0ICogaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8xMjUzNjU2Mi9kZXRlY3Qtd2hldGhlci1hLXdpbmRvdy1pcy12aXNpYmxlXG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gaXNQYWdlSGlkZGVuKCkge1xuXHRcdFx0cmV0dXJuIF9kb2MuaGlkZGVuIHx8IF9kb2MubXNIaWRkZW4gfHwgX2RvYy53ZWJraXRIaWRkZW4gfHwgX2RvYy5tb3pIaWRkZW47XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogQG5hbWVzcGFjZSBhbmltYXRpb25cblx0XHQgKi9cblx0XHR2YXIgYW5pbWF0aW9uID0ge307XG5cdFx0LyoqXG5cdFx0ICogQW5pbWF0aW9uIFwiZnJhbWVcIiBkdXJhdGlvblxuXHRcdCAqL1xuXHRcdGFuaW1hdGlvbi5kdXJhdGlvbiA9IDQwO1xuXHRcdC8qKlxuXHRcdCAqIEFuaW1hdGlvbiB0eXBlcyAobm9uZSxmYWRlLHBvcCxzbGlkZSlcblx0XHQgKi9cblx0XHRhbmltYXRpb24udHlwZXMgPSB7fTtcblx0XHRhbmltYXRpb24udHlwZXMuZmFkZSA9IFt7XG5cdFx0XHR4OiAwLjQsXG5cdFx0XHR5OiAwLjQsXG5cdFx0XHR3OiAwLjYsXG5cdFx0XHRoOiAwLjYsXG5cdFx0XHRvOiAwLjBcblx0XHR9LCB7XG5cdFx0XHRcdHg6IDAuNCxcblx0XHRcdFx0eTogMC40LFxuXHRcdFx0XHR3OiAwLjYsXG5cdFx0XHRcdGg6IDAuNixcblx0XHRcdFx0bzogMC4xXG5cdFx0XHR9LCB7XG5cdFx0XHRcdHg6IDAuNCxcblx0XHRcdFx0eTogMC40LFxuXHRcdFx0XHR3OiAwLjYsXG5cdFx0XHRcdGg6IDAuNixcblx0XHRcdFx0bzogMC4yXG5cdFx0XHR9LCB7XG5cdFx0XHRcdHg6IDAuNCxcblx0XHRcdFx0eTogMC40LFxuXHRcdFx0XHR3OiAwLjYsXG5cdFx0XHRcdGg6IDAuNixcblx0XHRcdFx0bzogMC4zXG5cdFx0XHR9LCB7XG5cdFx0XHRcdHg6IDAuNCxcblx0XHRcdFx0eTogMC40LFxuXHRcdFx0XHR3OiAwLjYsXG5cdFx0XHRcdGg6IDAuNixcblx0XHRcdFx0bzogMC40XG5cdFx0XHR9LCB7XG5cdFx0XHRcdHg6IDAuNCxcblx0XHRcdFx0eTogMC40LFxuXHRcdFx0XHR3OiAwLjYsXG5cdFx0XHRcdGg6IDAuNixcblx0XHRcdFx0bzogMC41XG5cdFx0XHR9LCB7XG5cdFx0XHRcdHg6IDAuNCxcblx0XHRcdFx0eTogMC40LFxuXHRcdFx0XHR3OiAwLjYsXG5cdFx0XHRcdGg6IDAuNixcblx0XHRcdFx0bzogMC42XG5cdFx0XHR9LCB7XG5cdFx0XHRcdHg6IDAuNCxcblx0XHRcdFx0eTogMC40LFxuXHRcdFx0XHR3OiAwLjYsXG5cdFx0XHRcdGg6IDAuNixcblx0XHRcdFx0bzogMC43XG5cdFx0XHR9LCB7XG5cdFx0XHRcdHg6IDAuNCxcblx0XHRcdFx0eTogMC40LFxuXHRcdFx0XHR3OiAwLjYsXG5cdFx0XHRcdGg6IDAuNixcblx0XHRcdFx0bzogMC44XG5cdFx0XHR9LCB7XG5cdFx0XHRcdHg6IDAuNCxcblx0XHRcdFx0eTogMC40LFxuXHRcdFx0XHR3OiAwLjYsXG5cdFx0XHRcdGg6IDAuNixcblx0XHRcdFx0bzogMC45XG5cdFx0XHR9LCB7XG5cdFx0XHRcdHg6IDAuNCxcblx0XHRcdFx0eTogMC40LFxuXHRcdFx0XHR3OiAwLjYsXG5cdFx0XHRcdGg6IDAuNixcblx0XHRcdFx0bzogMS4wXG5cdFx0XHR9XTtcblx0XHRhbmltYXRpb24udHlwZXMubm9uZSA9IFt7XG5cdFx0XHR4OiAwLjQsXG5cdFx0XHR5OiAwLjQsXG5cdFx0XHR3OiAwLjYsXG5cdFx0XHRoOiAwLjYsXG5cdFx0XHRvOiAxXG5cdFx0fV07XG5cdFx0YW5pbWF0aW9uLnR5cGVzLnBvcCA9IFt7XG5cdFx0XHR4OiAxLFxuXHRcdFx0eTogMSxcblx0XHRcdHc6IDAsXG5cdFx0XHRoOiAwLFxuXHRcdFx0bzogMVxuXHRcdH0sIHtcblx0XHRcdFx0eDogMC45LFxuXHRcdFx0XHR5OiAwLjksXG5cdFx0XHRcdHc6IDAuMSxcblx0XHRcdFx0aDogMC4xLFxuXHRcdFx0XHRvOiAxXG5cdFx0XHR9LCB7XG5cdFx0XHRcdHg6IDAuOCxcblx0XHRcdFx0eTogMC44LFxuXHRcdFx0XHR3OiAwLjIsXG5cdFx0XHRcdGg6IDAuMixcblx0XHRcdFx0bzogMVxuXHRcdFx0fSwge1xuXHRcdFx0XHR4OiAwLjcsXG5cdFx0XHRcdHk6IDAuNyxcblx0XHRcdFx0dzogMC4zLFxuXHRcdFx0XHRoOiAwLjMsXG5cdFx0XHRcdG86IDFcblx0XHRcdH0sIHtcblx0XHRcdFx0eDogMC42LFxuXHRcdFx0XHR5OiAwLjYsXG5cdFx0XHRcdHc6IDAuNCxcblx0XHRcdFx0aDogMC40LFxuXHRcdFx0XHRvOiAxXG5cdFx0XHR9LCB7XG5cdFx0XHRcdHg6IDAuNSxcblx0XHRcdFx0eTogMC41LFxuXHRcdFx0XHR3OiAwLjUsXG5cdFx0XHRcdGg6IDAuNSxcblx0XHRcdFx0bzogMVxuXHRcdFx0fSwge1xuXHRcdFx0XHR4OiAwLjQsXG5cdFx0XHRcdHk6IDAuNCxcblx0XHRcdFx0dzogMC42LFxuXHRcdFx0XHRoOiAwLjYsXG5cdFx0XHRcdG86IDFcblx0XHRcdH1dO1xuXHRcdGFuaW1hdGlvbi50eXBlcy5wb3BGYWRlID0gW3tcblx0XHRcdHg6IDAuNzUsXG5cdFx0XHR5OiAwLjc1LFxuXHRcdFx0dzogMCxcblx0XHRcdGg6IDAsXG5cdFx0XHRvOiAwXG5cdFx0fSwge1xuXHRcdFx0XHR4OiAwLjY1LFxuXHRcdFx0XHR5OiAwLjY1LFxuXHRcdFx0XHR3OiAwLjEsXG5cdFx0XHRcdGg6IDAuMSxcblx0XHRcdFx0bzogMC4yXG5cdFx0XHR9LCB7XG5cdFx0XHRcdHg6IDAuNixcblx0XHRcdFx0eTogMC42LFxuXHRcdFx0XHR3OiAwLjIsXG5cdFx0XHRcdGg6IDAuMixcblx0XHRcdFx0bzogMC40XG5cdFx0XHR9LCB7XG5cdFx0XHRcdHg6IDAuNTUsXG5cdFx0XHRcdHk6IDAuNTUsXG5cdFx0XHRcdHc6IDAuMyxcblx0XHRcdFx0aDogMC4zLFxuXHRcdFx0XHRvOiAwLjZcblx0XHRcdH0sIHtcblx0XHRcdFx0eDogMC41MCxcblx0XHRcdFx0eTogMC41MCxcblx0XHRcdFx0dzogMC40LFxuXHRcdFx0XHRoOiAwLjQsXG5cdFx0XHRcdG86IDAuOFxuXHRcdFx0fSwge1xuXHRcdFx0XHR4OiAwLjQ1LFxuXHRcdFx0XHR5OiAwLjQ1LFxuXHRcdFx0XHR3OiAwLjUsXG5cdFx0XHRcdGg6IDAuNSxcblx0XHRcdFx0bzogMC45XG5cdFx0XHR9LCB7XG5cdFx0XHRcdHg6IDAuNCxcblx0XHRcdFx0eTogMC40LFxuXHRcdFx0XHR3OiAwLjYsXG5cdFx0XHRcdGg6IDAuNixcblx0XHRcdFx0bzogMVxuXHRcdFx0fV07XG5cdFx0YW5pbWF0aW9uLnR5cGVzLnNsaWRlID0gW3tcblx0XHRcdHg6IDAuNCxcblx0XHRcdHk6IDEsXG5cdFx0XHR3OiAwLjYsXG5cdFx0XHRoOiAwLjYsXG5cdFx0XHRvOiAxXG5cdFx0fSwge1xuXHRcdFx0XHR4OiAwLjQsXG5cdFx0XHRcdHk6IDAuOSxcblx0XHRcdFx0dzogMC42LFxuXHRcdFx0XHRoOiAwLjYsXG5cdFx0XHRcdG86IDFcblx0XHRcdH0sIHtcblx0XHRcdFx0eDogMC40LFxuXHRcdFx0XHR5OiAwLjksXG5cdFx0XHRcdHc6IDAuNixcblx0XHRcdFx0aDogMC42LFxuXHRcdFx0XHRvOiAxXG5cdFx0XHR9LCB7XG5cdFx0XHRcdHg6IDAuNCxcblx0XHRcdFx0eTogMC44LFxuXHRcdFx0XHR3OiAwLjYsXG5cdFx0XHRcdGg6IDAuNixcblx0XHRcdFx0bzogMVxuXHRcdFx0fSwge1xuXHRcdFx0XHR4OiAwLjQsXG5cdFx0XHRcdHk6IDAuNyxcblx0XHRcdFx0dzogMC42LFxuXHRcdFx0XHRoOiAwLjYsXG5cdFx0XHRcdG86IDFcblx0XHRcdH0sIHtcblx0XHRcdFx0eDogMC40LFxuXHRcdFx0XHR5OiAwLjYsXG5cdFx0XHRcdHc6IDAuNixcblx0XHRcdFx0aDogMC42LFxuXHRcdFx0XHRvOiAxXG5cdFx0XHR9LCB7XG5cdFx0XHRcdHg6IDAuNCxcblx0XHRcdFx0eTogMC41LFxuXHRcdFx0XHR3OiAwLjYsXG5cdFx0XHRcdGg6IDAuNixcblx0XHRcdFx0bzogMVxuXHRcdFx0fSwge1xuXHRcdFx0XHR4OiAwLjQsXG5cdFx0XHRcdHk6IDAuNCxcblx0XHRcdFx0dzogMC42LFxuXHRcdFx0XHRoOiAwLjYsXG5cdFx0XHRcdG86IDFcblx0XHRcdH1dO1xuXHRcdC8qKlxuXHRcdCAqIFJ1biBhbmltYXRpb25cblx0XHQgKiBAcGFyYW0ge09iamVjdH0gb3B0IEFuaW1hdGlvbiBvcHRpb25zXG5cdFx0ICogQHBhcmFtIHtPYmplY3R9IGNiIENhbGxhYmFrIGFmdGVyIGFsbCBzdGVwcyBhcmUgZG9uZVxuXHRcdCAqIEBwYXJhbSB7T2JqZWN0fSByZXZlcnQgUmV2ZXJzZSBvcmRlcj8gdHJ1ZXxmYWxzZVxuXHRcdCAqIEBwYXJhbSB7T2JqZWN0fSBzdGVwIE9wdGlvbmFsIHN0ZXAgbnVtYmVyIChmcmFtZSBidW1iZXIpXG5cdFx0ICovXG5cdFx0YW5pbWF0aW9uLnJ1biA9IGZ1bmN0aW9uIChvcHQsIGNiLCByZXZlcnQsIHN0ZXApIHtcblx0XHRcdHZhciBhbmltYXRpb25UeXBlID0gYW5pbWF0aW9uLnR5cGVzW2lzUGFnZUhpZGRlbigpID8gJ25vbmUnIDogX29wdC5hbmltYXRpb25dO1xuXHRcdFx0aWYgKHJldmVydCA9PT0gdHJ1ZSkge1xuXHRcdFx0XHRzdGVwID0gKHR5cGVvZiBzdGVwICE9PSAndW5kZWZpbmVkJykgPyBzdGVwIDogYW5pbWF0aW9uVHlwZS5sZW5ndGggLSAxO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0c3RlcCA9ICh0eXBlb2Ygc3RlcCAhPT0gJ3VuZGVmaW5lZCcpID8gc3RlcCA6IDA7XG5cdFx0XHR9XG5cdFx0XHRjYiA9IChjYikgPyBjYiA6IGZ1bmN0aW9uICgpIHtcblx0XHRcdH07XG5cdFx0XHRpZiAoKHN0ZXAgPCBhbmltYXRpb25UeXBlLmxlbmd0aCkgJiYgKHN0ZXAgPj0gMCkpIHtcblx0XHRcdFx0dHlwZVtfb3B0LnR5cGVdKG1lcmdlKG9wdCwgYW5pbWF0aW9uVHlwZVtzdGVwXSkpO1xuXHRcdFx0XHRfYW5pbVRpbWVvdXQgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRpZiAocmV2ZXJ0KSB7XG5cdFx0XHRcdFx0XHRzdGVwID0gc3RlcCAtIDE7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdHN0ZXAgPSBzdGVwICsgMTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0YW5pbWF0aW9uLnJ1bihvcHQsIGNiLCByZXZlcnQsIHN0ZXApO1xuXHRcdFx0XHR9LCBhbmltYXRpb24uZHVyYXRpb24pO1xuXG5cdFx0XHRcdGxpbmsuc2V0SWNvbihfY2FudmFzKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGNiKCk7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHR9O1xuXHRcdC8vYXV0byBpbml0XG5cdFx0aW5pdCgpO1xuXHRcdHJldHVybiB7XG5cdFx0XHRiYWRnZTogYmFkZ2UsXG5cdFx0XHR2aWRlbzogdmlkZW8sXG5cdFx0XHRpbWFnZTogaW1hZ2UsXG5cdFx0XHR3ZWJjYW06IHdlYmNhbSxcblx0XHRcdHJlc2V0OiBpY29uLnJlc2V0LFxuXHRcdFx0YnJvd3Nlcjoge1xuXHRcdFx0XHRzdXBwb3J0ZWQ6IF9icm93c2VyLnN1cHBvcnRlZFxuXHRcdFx0fVxuXHRcdH07XG5cdH0pO1xuXG5cdC8vIEFNRCAvIFJlcXVpcmVKU1xuXHRpZiAodHlwZW9mIGRlZmluZSAhPT0gJ3VuZGVmaW5lZCcgJiYgZGVmaW5lLmFtZCkge1xuXHRcdGRlZmluZShbXSwgZnVuY3Rpb24gKCkge1xuXHRcdFx0cmV0dXJuIEZhdmljbztcblx0XHR9KTtcblx0fVxuXHQvLyBDb21tb25KU1xuXHRlbHNlIGlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyAmJiBtb2R1bGUuZXhwb3J0cykge1xuXHRcdG1vZHVsZS5leHBvcnRzID0gRmF2aWNvO1xuXHR9XG5cdC8vIGluY2x1ZGVkIGRpcmVjdGx5IHZpYSA8c2NyaXB0PiB0YWdcblx0ZWxzZSB7XG5cdFx0dGhpcy5GYXZpY28gPSBGYXZpY287XG5cdH1cblxufSkoKTtcbiIsInZhciBobSA9IHJlcXVpcmUoJy4vbW9kdWxlcy9obS5qcycpXG5cbmZ1bmN0aW9uIGluaXQoKSB7XG4gICAgaG0ucnVuKCk7XG59XG5cblxud2luZG93Lm9ubG9hZCA9ICgpID0+IGluaXQoKTtcblxuIiwiLy8gTlBNIG1vZHVsZXNcbnZhciBGYXZpY28gPSByZXF1aXJlKCdmYXZpY28uanMnKTtcblxuLy8gR2xvYmFsc1xudmFyIHQ7XG52YXIgaXNUaW1lckdvaW5nID0gZmFsc2U7XG52YXIgYmVlbldhcm5lZCA9IGZhbHNlO1xudmFyIGZhdmljb24gPSBuZXcgRmF2aWNvKHtcbiAgICBhbmltYXRpb246ICdzbGlkZSdcbn0pO1xudmFyIGhhc1Byb21pc2VkVG9Xb3JrV2l0aE1lID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3NiYjpzZWVuTWVzc2FnZScpO1xuXG5mdW5jdGlvbiBydW4oKSB7XG4gICAgLy8gT25seSBydW4gaWYgeW91J3JlIG9uIGRlc2t0b3BcblxuICAgIC8vIElmIHlvdSBoYXZlbid0IGNvbWUgdG8gdGhpcyBzaXRlIGJlZm9yZSBzZXQgZGVmYXVsdFxuICAgIGlmIChsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnc2JiOnNlZW5NZXNzYWdlJykgPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCdzYmI6c2Vlbk1lc3NhZ2UnLCBmYWxzZSk7XG4gICAgICAgIGhhc1Byb21pc2VkVG9Xb3JrV2l0aE1lID0gJ2ZhbHNlJztcbiAgICB9XG5cbiAgICBpZiAoaGFzUHJvbWlzZWRUb1dvcmtXaXRoTWUgIT09ICd0cnVlJykge1xuICAgICAgICBiaW5kTWVzc2FnZUJ1dHRvbigpXG4gICAgICAgIC8vIENoZWNrIGhpZGRlbiBzdGF0dXMgZXZlcnkgc2Vjb25kXG4gICAgICAgIHdpbmRvdy5zZXRJbnRlcnZhbChjaGVja1RhYlZpc2liaWxpdHksIDEwMDApO1xuICAgIH1cbiAgICBcbn1cblxuZnVuY3Rpb24gYmluZE1lc3NhZ2VCdXR0b24oKSB7XG4gICAgdmFyIGJ1dHRvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNoaWRkZW4tYnV0dG9uJylcblxuICAgIGJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgICAgdmFyIGVsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2hpZGRlbi1tZXNzYWdlLWNvbnRhaW5lcicpO1xuICAgICAgICBlbC5jbGFzc0xpc3QuYWRkKCdub3QtdmlzaWJsZScpO1xuICAgICAgICAvLyBTb21lIHZhciBmb3IgbmV2ZXIgc2hvd2luZyBhZ2Fpbi5cbiAgICAgICAgY2xlYXJUaW1lZE1lc3NhZ2UoKTtcbiAgICAgICAgaGFzUHJvbWlzZWRUb1dvcmtXaXRoTWUgPSAndHJ1ZSc7XG4gICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKCdzYmI6c2Vlbk1lc3NhZ2UnLCBoYXNQcm9taXNlZFRvV29ya1dpdGhNZSk7XG4gICAgfSlcbn1cblxuZnVuY3Rpb24gY2hlY2tUYWJWaXNpYmlsaXR5KCkge1xuICAgIGlmIChoYXNQcm9taXNlZFRvV29ya1dpdGhNZSA9PT0gJ2ZhbHNlJykge1xuICAgICAgICBpZiAoZG9jdW1lbnQuaGlkZGVuICYmIGlzVGltZXJHb2luZyAhPT0gdHJ1ZSkge1xuICAgICAgICAgICAgdGltZWRNZXNzYWdlKCk7XG4gICAgICAgICAgICAvLyBTZXQgZ3ZhciBvbiB0aGlzIHRvb1xuICAgICAgICAgICAgaXNUaW1lckdvaW5nID0gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIGlmICghZG9jdW1lbnQuaGlkZGVuKSB7XG4gICAgICAgICAgICAvLyBSZXNldCBUaW1lclxuICAgICAgICAgICAgZmF2aWNvbi5iYWRnZSgwKTtcbiAgICAgICAgICAgIGlmIChpc1RpbWVyR29pbmcpIHtcbiAgICAgICAgICAgICAgICBjbGVhclRpbWVkTWVzc2FnZSgpXG4gICAgICAgICAgICAgICAgaXNUaW1lckdvaW5nID0gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7IHJldHVybiB9XG4gICAgfVxufTtcblxuZnVuY3Rpb24gdGltZWRNZXNzYWdlKCkge1xuICAgIHQgPSB3aW5kb3cuc2V0VGltZW91dChzYmJNZXNzYWdlLCAoMzAgKiA2MCAqIDEwMDApKVxufTtcblxuZnVuY3Rpb24gY2xlYXJUaW1lZE1lc3NhZ2UoKSB7XG4gICAgd2luZG93LmNsZWFyVGltZW91dCh0KTtcbn1cblxuZnVuY3Rpb24gc2JiTWVzc2FnZSgpIHtcbiAgICBpZiAoIWJlZW5XYXJuZWQpIHtcbiAgICAgICAgZmF2aWNvbi5iYWRnZSgxKTtcbiAgICAgICAgdmFyIGVsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2hpZGRlbi1tZXNzYWdlLWNvbnRhaW5lcicpO1xuICAgICAgICBlbC5jbGFzc0xpc3QucmVtb3ZlKCdub3QtdmlzaWJsZScpO1xuICAgIH1cbiAgICBiZWVuV2FybmVkID0gdHJ1ZTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7IHJ1biB9OyJdfQ==
