"use strict";
const CustomError       = require('custom-error-instance');
const defineGetter      = require('./define-getter');
const path              = require('path');

let coreEmitter;
const emitters = {};
const handlers = {};

const Err = CustomError('ScopedEvent');
Err.args = CustomError(Err, { code: 'EARGS', message: 'Event subscription missing arguments' });
Err.callback = CustomError(Err, { code: 'ECLBK', message: 'Event callback must be a function' });
Err.exists = CustomError(Err, { code: 'EEXIST', message: 'Event callback is already applied' });
Err.namespace = CustomError(Err, { code: 'ENS', message: 'Event namespace must be a string'});
Err.type = CustomError(Err, { code: 'ETYPE', message: 'Event type must be a string'});

/**
 * Create an event emitter with the specified namespace.
 * @param namespace
 * @throws Error
 * @returns {Function}
 */
exports.emitter = function(namespace) {
    if (emitters.hasOwnProperty(namespace)) throw Err.exists('Namespace already claimed');
    emitters[namespace] = true;
    if (coreEmitter) coreEmitter('register', namespace);

    /**
     * Emit an event from this namespace.
     * @param event
     * @param data
     */
    function emit(event, data) {
        if (emitters.hasOwnProperty(namespace) && handlers.hasOwnProperty(namespace) && handlers[namespace].hasOwnProperty(event)) {
            handlers[namespace][event].slice(0).forEach(function(item) {
                item.callback(data);
                if (item.once) removeCallback(namespace, event, item.callback);
            });
        }
    }

    emit.deRegister = function() {
        delete emitters[namespace];
        coreEmitter('de-register', namespace);
    };

    return emit;
};

/**
 * Get the error object for this module.
 * @property
 * @readonly
 * @type Error
 */
exports.error = defineGetter(exports, 'error', () => Err);

/**
 * Get the number of subscribed listeners.
 * @param {string} namespace The namespace to count.
 * @param {string} [event] The event type to count.
 * @returns {number}
 */
exports.listenerCount = function(namespace, event) {
    if (!handlers.hasOwnProperty(namespace)) return 0;
    if (arguments.length > 1) {
        return handlers[namespace].hasOwnProperty(event) ? handlers[namespace][event].length : 0;
    } else {
        return Object
            .keys(handlers[namespace])
            .reduce(function(sum, event) {
                return sum + handlers[namespace][event].length
            }, 0);
    }
};

/**
 * Create a shortcut object to set and remove event listeners for a single namespace.
 * @param {string} namespace
 * @returns {{off: (function()), on: (function()), once: (function())}}
 */
exports.namespace = function(namespace) {
    return {
        off: (event, callback) => exports.off(namespace, event, callback),
        on: (event, callback) => exports.on(namespace, event, callback),
        once: (event, callback) => exports.once(namespace, event, callback)
    };
};

/**
 * Get the namespaces registered by emitters.
 * @property
 * @readonly
 * @type string[]
 */
exports.namespaces = defineGetter(exports, 'namespaces', () => Object.keys(emitters));

/**
 * Remove an event listener.
 * @function
 * @param {string} namespace The namespace for the event.
 * @param {string} event The event type.
 * @param {function} callback The function to call.
 * @throws Error
 */
exports.off = function(namespace, event, callback) {
    validateArguments(namespace, event, callback);
    removeCallback(namespace, event, callback);
};

/**
 * Add an event listener.
 * @param {string} namespace The namespace for the event.
 * @param {string} event The event type.
 * @param {function} callback The function to call.
 * @throws Error
 */
exports.on = function(namespace, event, callback) {
    validateArguments(namespace, event, callback);
    addCallback(namespace, event, callback, false);
};

/**
 * Add an event listener that only triggers once.
 * @param {string} namespace The namespace for the event.
 * @param {string} event The event type.
 * @param {function} callback The function to call.
 * @throws Error
 */
exports.once = function(namespace, event, callback) {
    validateArguments(namespace, event, callback);
    addCallback(namespace, event, callback, true);
};


// register the event core emitter
coreEmitter = exports.emitter('event-core');



function addCallback(namespace, key, callback, once) {
    if (getIndex(namespace, key, callback) !== -1) throw Err.exists;
    if (!handlers.hasOwnProperty(namespace)) handlers[namespace] = {};
    if (!handlers[namespace].hasOwnProperty(key)) handlers[namespace][key] = [];
    handlers[namespace][key].push({ callback: callback, once: once });
    coreEmitter(once ? 'once' : 'on', { namespace: namespace, event: key, callback: callback });
}

function getIndex(namespace, key, callback) {
    if (!handlers.hasOwnProperty(namespace) || !handlers[namespace].hasOwnProperty(key)) return -1;
    for (let i = 0; i < handlers[namespace][key].length; i++) {
        if (handlers[namespace][key][i].callback === callback) return i;
    }
    return -1;
}

function removeCallback(namespace, key, callback) {
    let index = getIndex(namespace, key, callback);
    if (index !== -1) {
        handlers[namespace][key].splice(index, 1);
        if (handlers[namespace][key].length === 0) delete handlers[namespace][key];
        if (Object.keys(handlers[namespace]).length === 0) delete handlers[namespace];
        coreEmitter('off', { namespace: namespace, event: key, callback: callback });
    }
}

function validateArguments(namespace, type, callback) {
    if (typeof namespace !== 'string') throw Err.namespace;
    if (typeof type !== 'string') throw Err.type;
    if (typeof callback !== 'function') throw Err.callback;
}