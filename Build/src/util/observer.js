/**
 * Created by jacob.mendt@pikobytes.de on 17.11.21.
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 */

/**
 * Basic implementation of the observer pattern.
 */
export class Observer {
    constructor() {
        this.listeners_ = [];
    }

    /**
     * Subscribes / Registers a new listeners
     * @param {string} eventName
     * @param {Function} listener
     */
    on(eventName, listener) {
        this.listeners_[eventName] = this.listeners_[eventName] || [];
        this.listeners_[eventName].push(listener);
    }

    /**
     * Unsubscribes / Unregisters a new listeners
     * @param {string} eventName
     * @param {Function} listener
     */
    off(eventName, listener) {
        const eventListeners = this.listeners_[eventName];
        if (eventListeners) {
            let index = eventListeners.indexOf(listener);
            if (index > -1) {
                this.listeners_[eventName].slice(index, 1);
            }
        }
    }

    /**
     * Dispatches / Publish an event
     * @param eventName
     * @param eventObj
     */
    dispatch(eventName, eventObj) {
        const eventListeners = this.listeners_[eventName];
        if (eventListeners) {
            for (let i = 0, l = eventListeners.length; i < l; ++i) {
                eventListeners[i].call({}, eventObj);
            }
        }
    }
}

export default Observer;
