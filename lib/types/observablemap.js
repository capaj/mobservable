"use strict";
var modifiers_1 = require("./modifiers");
var simpleeventemitter_1 = require("../utils/simpleeventemitter");
var transaction_1 = require("../core/transaction");
var observablearray_1 = require("./observablearray");
var observablevalue_1 = require("./observablevalue");
var utils_1 = require("../utils/utils");
var globalstate_1 = require("../core/globalstate");
var ObservableMapMarker = {};
var ObservableMap = (function () {
    function ObservableMap(initialData, valueModeFunc) {
        var _this = this;
        this.$mobx = ObservableMapMarker;
        this._data = {};
        this._hasMap = {}; // hasMap, not hashMap >-).
        this._events = undefined;
        this.name = "ObservableMap";
        this.id = globalstate_1.getNextId();
        this._keys = new observablearray_1.ObservableArray(null, modifiers_1.ValueMode.Reference, this.name + "@" + this.id + " / keys()");
        this._valueMode = modifiers_1.getValueModeFromModifierFunc(valueModeFunc);
        if (utils_1.isPlainObject(initialData))
            this.merge(initialData);
        else if (Array.isArray(initialData))
            initialData.forEach(function (_a) {
                var key = _a[0], value = _a[1];
                return _this.set(key, value);
            });
    }
    ObservableMap.prototype._has = function (key) {
        return typeof this._data[key] !== "undefined";
    };
    ObservableMap.prototype.has = function (key) {
        if (!this.isValidKey(key))
            return false;
        if (this._hasMap[key])
            return this._hasMap[key].get();
        return this._updateHasMapEntry(key, false).get();
    };
    ObservableMap.prototype.set = function (key, value) {
        var _this = this;
        this.assertValidKey(key);
        modifiers_1.assertUnwrapped(value, "[mobx.map.set] Expected unwrapped value to be inserted to key '" + key + "'. If you need to use modifiers pass them as second argument to the constructor");
        if (this._has(key)) {
            var oldValue = this._data[key].value;
            var changed = this._data[key].set(value);
            if (changed && this._events) {
                this._events.emit({
                    type: "update",
                    object: this,
                    name: key,
                    oldValue: oldValue
                });
            }
        }
        else {
            transaction_1.transaction(function () {
                _this._data[key] = new observablevalue_1.ObservableValue(value, _this._valueMode, _this.name + "@" + _this.id + " / Entry \"" + key + "\"");
                _this._updateHasMapEntry(key, true);
                _this._keys.push(key);
            });
            this._events && this._events.emit({
                type: "add",
                object: this,
                name: key
            });
        }
    };
    ObservableMap.prototype.delete = function (key) {
        var _this = this;
        if (this._has(key)) {
            var oldValue = this._data[key].value;
            transaction_1.transaction(function () {
                _this._keys.remove(key);
                _this._updateHasMapEntry(key, false);
                var observable = _this._data[key];
                observable.set(undefined);
                _this._data[key] = undefined;
            });
            this._events && this._events.emit({
                type: "delete",
                object: this,
                name: key,
                oldValue: oldValue
            });
        }
    };
    ObservableMap.prototype._updateHasMapEntry = function (key, value) {
        // optimization; don't fill the hasMap if we are not observing, or remove entry if there are no observers anymore
        var entry = this._hasMap[key];
        if (entry) {
            entry.set(value);
        }
        else {
            entry = this._hasMap[key] = new observablevalue_1.ObservableValue(value, modifiers_1.ValueMode.Reference, this.name + "@" + this.id + " / Contains \"" + key + "\"");
        }
        return entry;
    };
    ObservableMap.prototype.get = function (key) {
        if (this.has(key))
            return this._data[key].get();
        return undefined;
    };
    ObservableMap.prototype.keys = function () {
        return this._keys.slice();
    };
    ObservableMap.prototype.values = function () {
        return this.keys().map(this.get, this);
    };
    ObservableMap.prototype.entries = function () {
        var _this = this;
        return this.keys().map(function (key) { return [key, _this.get(key)]; });
    };
    ObservableMap.prototype.forEach = function (callback, thisArg) {
        var _this = this;
        this.keys().forEach(function (key) { return callback.call(thisArg, _this.get(key), key); });
    };
    /** Merge another object into this object, returns this. */
    ObservableMap.prototype.merge = function (other) {
        var _this = this;
        transaction_1.transaction(function () {
            if (other instanceof ObservableMap)
                other.keys().forEach(function (key) { return _this.set(key, other.get(key)); });
            else
                Object.keys(other).forEach(function (key) { return _this.set(key, other[key]); });
        });
        return this;
    };
    ObservableMap.prototype.clear = function () {
        var _this = this;
        transaction_1.transaction(function () {
            _this.keys().forEach(_this.delete, _this);
        });
    };
    Object.defineProperty(ObservableMap.prototype, "size", {
        get: function () {
            return this._keys.length;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Returns a shallow non observable object clone of this map.
     * Note that the values migth still be observable. For a deep clone use mobx.toJSON.
     */
    ObservableMap.prototype.toJs = function () {
        var _this = this;
        var res = {};
        this.keys().forEach(function (key) { return res[key] = _this.get(key); });
        return res;
    };
    ObservableMap.prototype.isValidKey = function (key) {
        if (key === null || key === undefined)
            return false;
        if (typeof key !== "string" && typeof key !== "number")
            return false;
        return true;
    };
    ObservableMap.prototype.assertValidKey = function (key) {
        if (!this.isValidKey(key))
            throw new Error("[mobx.map] Invalid key: '" + key + "'");
    };
    ObservableMap.prototype.toString = function () {
        var _this = this;
        return "[mobx.map { " + this.keys().map(function (key) { return (key + ": " + ("" + _this.get(key))); }).join(", ") + " }]";
    };
    /**
     * Observes this object. Triggers for the events 'add', 'update' and 'delete'.
     * See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/observe
     * for callback details
     */
    ObservableMap.prototype.observe = function (callback) {
        if (!this._events)
            this._events = new simpleeventemitter_1.SimpleEventEmitter();
        return this._events.on(callback);
    };
    return ObservableMap;
}());
exports.ObservableMap = ObservableMap;
/**
 * Creates a map, similar to ES6 maps (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map),
 * yet observable.
 */
function map(initialValues, valueModifier) {
    return new ObservableMap(initialValues, valueModifier);
}
exports.map = map;
function isObservableMap(thing) {
    return thing instanceof ObservableMap;
}
exports.isObservableMap = isObservableMap;
