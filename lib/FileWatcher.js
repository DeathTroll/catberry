/*
 * catberry
 *
 * Copyright (c) 2015 Denis Rechkunov and project contributors.
 *
 * catberry's license follows:
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without restriction,
 * including without limitation the rights to use, copy, modify, merge,
 * publish, distribute, sublicense, and/or sell copies of the Software,
 * and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included
 * in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
 * OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 * This license applies to all parts of catberry that are not externally
 * maintained libraries.
 */

'use strict';

module.exports = FileWatcher;

var Gaze = require('gaze').Gaze;

var GLOB_OPTIONS = {
	interval: 1000,
	debounceDelay: 5000
};

/**
 * Creates new instance of the file watcher.
 * @constructor
 */
function FileWatcher() {
	this._watchObjects = [];
}

/**
 * Current list of watched objects.
 * @type {Array<Gaze>}
 * @private
 */
FileWatcher.prototype._watchObjects = null;

/**
 * Watches after specified resources and invokes handler on changes.
 * @param {Array} globs Array of globs to watch.
 * @param {Function} handler Handler of all changes.
 */
FileWatcher.prototype.watch = function (globs, handler) {
	var self = this,
		lastTriggered = 0,
		safeHandler = function () {
			var now = Date.now();
			if (lastTriggered !== 0 &&
				now - lastTriggered <= GLOB_OPTIONS.debounceDelay) {
				return;
			}
			lastTriggered = now;
			handler();
		};

	var watcher = new Gaze(globs, GLOB_OPTIONS,  function () {
		this.on('error', function (error) {
			self._eventBus.emit('error', error);
		})
			.on('added', safeHandler)
			.on('changed', safeHandler)
			.on('deleted', safeHandler)
			.on('renamed', safeHandler);
	});
	this._watchObjects.push(watcher);
};

/**
 * Removes all watches from the list.
 */
FileWatcher.prototype.unwatch = function () {
	this._watchObjects.forEach(function (watch) {
		watch.close();
	});
	this._watchObjects = [];
};