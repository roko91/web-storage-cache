'use strict';

const event = new Event('webstoragecachechanged');

module.exports = class WebStorageCache {
    constructor(storeKey, options = {}, storage = null) {
        this.storeKey = storeKey;
        this.options = options;
        this.storage = storage || window.localStorage;
        this.loadStore();
        window.addEventListener('webstoragecachechanged', () => this.loadStore());
    }

    loadStore() {
        this.store = JSON.parse(this.storage.getItem(this.storeKey)) || {};
    }

    updateStore() {
        this.storage.setItem(this.storeKey, JSON.stringify(this.store, this.options.storeReplacer));
        window.dispatchEvent(event);
    }

    get(key) {
        const item = this.store[key];
        return (item && item.ttl && (Date.now() - item.updatedAt) > (item.ttl * 1000)) ? undefined : (item ? item.value : undefined);
    }

    put(key, value, ttl = null) {
        this.store[key] = {value, 'ttl': ttl || this.options.defaultTtl, 'updatedAt': Date.now()};
        this.updateStore();
    }

    forget(key) {
        delete this.store[key];
        this.updateStore();
    }

    async remember(key, callback = null, ttl = null) {
        if (callback && this.get(key) === undefined) {
            this.put(key, await callback(), ttl);
        }
        return this.get(key);
    }
}
