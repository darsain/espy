;(function ($, w, undefined) {
	'use strict';

	// Plugin names
	var pluginName = 'espy',
		pluginClass = 'Espy',
		namespace  = pluginName;

	$[pluginClass] = function(context, callback, options) {
		// Optional arguments delay
		if (typeof callback !== 'function') {
			options = callback;
			callback = 0;
		}

		// Private variables
		var self     = this;
		var $context = $(context);
		var defaults = $.extend({}, $.fn[pluginName].defaults, options);
		var spies    = {};
		var lastId   = 0;
		var pos      = {
			top: $context.scrollTop(),
			left: $context.scrollLeft(),
			width: $context.innerWidth(),
			height: $context.innerHeight(),
			offset: $context.offset() || {
				top: 0,
				left: 0
			}
		};

		/**
		 * Add new element(s) to spies list.
		 *
		 * @param {Node}     element
		 * @param {Function} callback
		 * @param {Object}   options
		 *
		 * @return {Object} Spy object with basic control methods.
		 */
		self.add = function (element, callback, options) {
			// Optional arguments logic
			if ($.isPlainObject(callback)) {
				options = callback;
				callback = 0;
			}

			$(element).each(function (i, el) {
				var spyId = getId(el) || 's' + lastId++;

				// Add new element to spying list
				spies[spyId] = $.extend({
					id: spyId,
					el:  el,
					$el: $(el),
					callback: callback
				}, defaults, options);

				// Load the element data
				load(spyId);
			});
		};

		/**
		 * (Re)Load spy object's dimensions.
		 *
		 * @param  {Mixed} element
		 *
		 * @return {Void}
		 */
		function load(element) {
			var spy = getSpy(element);
			if (!spy) {
				return;
			}

			var start = spy.$el.offset()[spy.horizontal ? 'left' : 'top'] - pos.offset[spy.horizontal ? 'left' : 'top'];
			var size  = spy.$el[spy.horizontal ? 'outerWidth' : 'outerHeight']();

			// Add new element to spying list
			$.extend(spy, {
				start: start,
				elSize: size,
				end: start + size
			});

			// Check the element for its state
			check(spy);
		}

		/**
		 * Reload element's dimensions.
		 *
		 * @param  {Node} element
		 *
		 * @return {Void}
		 */
		self.reload = function (element) {
			$(element).each(function (i, el) {
				var spyId = getId(el);
				if (spyId) {
					load(spyId);
				}
			});
		};

		/**
		 * Remove element(s) from spying list.
		 *
		 * @param  {Node} element
		 *
		 * @return {Void}
		 */
		self.remove = function (element) {
			$(element).each(function (i, el) {
				var spyId = getId(el);
				if (spyId) {
					delete spies[spyId];
				}
			});
		};

		/**
		 * Check element state, and trigger callback on change.
		 *
		 * @param  {Mixed} element Can be element node, spy ID, or spy object. Omit to check all elements.
		 *
		 * @return {Void}
		 */
		function check(element) {
			if (element === undefined) {
				$.each(spies, check);
				return;
			}

			// Check whether the element/ID exist in spying list.
			var spy = getSpy(element);
			if (!spy) {
				return;
			}

			// Variables necessary for determination.
			var viewSize     = pos[spy.horizontal ? 'width' : 'height'];
			var triggerSize  = parseRatio(spy.size, viewSize);
			var triggerStart = pos[spy.horizontal ? 'left' : 'top'] + parseRatio(spy.offset, viewSize, -triggerSize);
			var triggerEnd   = triggerStart + triggerSize;
			var newState;

			// Calculate element state in relation to trigger area.
			if (spy.contain) {
				if (triggerStart <= spy.start && triggerEnd >= spy.end) {
					newState = 'inside';
				} else if (triggerStart + triggerSize / 2 > spy.start + spy.elSize / 2) {
					newState = spy.horizontal ? 'left' : 'up';
				} else {
					newState = spy.horizontal ? 'right' : 'down';
				}
			} else {
				if (
					triggerStart > spy.start && triggerStart < spy.end ||
					triggerEnd > spy.start && triggerEnd < spy.end ||
					triggerStart <= spy.start && triggerEnd >= spy.start ||
					triggerStart <= spy.end && triggerEnd >= spy.end
				) {
					newState = 'inside';
				} else if (triggerStart > spy.end) {
					newState = spy.horizontal ? 'left' : 'up';
				} else {
					newState = spy.horizontal ? 'right' : 'down';
				}
			}

			// Trigger callbacks on change.
			if (spy.state !== newState) {
				spy.state = newState;
				if (typeof callback === 'function') {
					callback.call(spy.el, newState === 'inside', newState);
				}
				if (typeof spy.callback === 'function') {
					spy.callback.call(spy.el, newState === 'inside', newState);
				}
			}
		}

		/**
		 * Check whether the element is already spied on, and return the spy ID.
		 *
		 * @param  {Node}  element
		 *
		 * @return {Mixed} Spy ID string, or false.
		 */
		function getId(element) {
			// Return when ID has been passed.
			if (spies.hasOwnProperty(element)) {
				return element;
			}

			// Return ID when spy object has been passed.
			if ($.isPlainObject(element) && spies.hasOwnProperty(element.id)) {
				return element.id;
			}

			// Ensure the element is a single Node
			element = $(element)[0];

			// Check for existence and return the ID.
			var is = false;
			$.each(spies, function (id, spy) {
				if (spy.el === element) {
					is = id;
				}
			});
			return is;
		}

		/**
		 * Return spy object of an element.
		 *
		 * @param  {Node}  element
		 *
		 * @return {Object} Spy ID string, or false.
		 */
		function getSpy(element) {
			var spyId = getId(element);
			return spyId ? spies[spyId] : false;
		}

		/**
		 * Destroy Espy instance.
		 *
		 * @return {Void}
		 */
		self.destroy = function () {
			$context.off('.' + namespace);
			spies = {};
			self = undefined;
		};

		// Register scroll handler
		$context.on('scroll.' + namespace, throttle(defaults.delay, function () {
			pos.top  = $context.scrollTop();
			pos.left = $context.scrollLeft();
			check();
		}));

		// Register resize handler
		$context.on('resize.' + namespace, throttle(defaults.delay, function () {
			pos.width  = $context.innerWidth();
			pos.height = $context.innerHeight();
			check();
		}));
	};

	/**
	 * Parse string like -200% and return the final dimension.
	 *
	 * @param  {Mixed}   value  Integer, or percent string.
	 * @param  {Integer} total  Total value representing 100%.
	 * @param  {Integer} offset Optional offset for negative numbers.
	 *
	 * @return {Integer}
	 */
	function parseRatio(value, total, offset) {
		var matches = (value+'').match(/^(-?[0-9]+)(%)?$/);
		if (!matches) {
			return false;
		}
		var num = parseInt(matches[1], 10);
		if (matches[2]) {
			num = total / 100 * num;
		}
		return num < 0 ? total + num + (offset || 0) : num;
	}

	/**
	 * Create a throttled version of a callback function.
	 *
	 * Copied & pasted with slight adjustments from
	 * https://github.com/cowboy/jquery-throttle-debounce/
	 *
	 * @param  {Integer}  delay
	 * @param  {Function} callback
	 *
	 * @return {Function}
	 */
	function throttle(delay, callback) {
		var timeoutId;
		var lastExec = 0;

		// The `wrapper` function encapsulates all of the throttling functionality
		// and when executed will limit the rate at which `callback` is executed.
		function wrapper() {
			/*jshint validthis:true */
			var that = this;
			var elapsed = +new Date() - lastExec;
			var args = arguments;

			function clear() {
				if (timeoutId) {
					timeoutId = clearTimeout(timeoutId);
				}
			}

			function exec() {
				lastExec = +new Date();
				callback.apply(that, args);
				clear();
			}

			clear();

			if (elapsed > delay) {
				exec();
			} else {
				timeoutId = setTimeout(exec, delay - elapsed);
			}
		}

		// Set the guid of `wrapper` function to the same of original callback, so it can be
		// removed in jQuery 1.4+ .unbind or .off by using the original callback as a reference.
		if ($.guid) {
			wrapper.guid = callback.guid = callback.guid || $.guid++;
		}

		// Return the wrapper function.
		return wrapper;
	}

	// Extend jQuery
	$.fn[pluginName] = function (callback, options) {
		var method, methodArgs;
		var context = options && options.context || w;
		var espy = $.data(context, namespace) || $.data(context, namespace, new $[pluginClass](context));

		// Attributes logic
		if (typeof callback === 'string') {
			method = options === false || options === 'destroy' ? 'remove' : options;
			methodArgs = Array.prototype.slice.call(arguments, 1);
			options = {};
		}

		// Apply to all elements
		return this.each(function (i, element) {
			if (!method) {
				// Adding element to spy on
				espy.add(element, callback, options);
			} else {
				// Call plugin method
				if (typeof espy[method] === 'function') {
					espy[method].apply(espy, methodArgs);
				}
			}
		});
	};

	// Default options
	$.fn[pluginName].defaults = {
		delay:      100,    // Events throttling delay in milliseconds.
		context:    window, // Scrolling context.
		horizontal: 0,      // Enable for horizontal scrolling.
		offset:     0,      // Target area offset from start (top in vert., left in hor.).
		size:       '100%', // Target area size (height in vert., width in hor.).
		contain:    0       // Trigger as entered only when element is completely within the target area.
	};
}(jQuery, window));