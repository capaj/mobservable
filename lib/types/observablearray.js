"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var utils_1 = require("../utils/utils");
var atom_1 = require("../core/atom");
var simpleeventemitter_1 = require("../utils/simpleeventemitter");
var modifiers_1 = require("./modifiers");
var derivation_1 = require("../core/derivation");
/**
 * This array buffer contains two lists of properties, so that all arrays
 * can recycle their property definitions, which significantly improves performance of creating
 * properties on the fly.
 */
var OBSERVABLE_ARRAY_BUFFER_SIZE = 0;
// Typescript workaround to make sure ObservableArray extends Array
var StubArray = (function () {
    function StubArray() {
    }
    return StubArray;
}());
exports.StubArray = StubArray;
StubArray.prototype = [];
function getArrayLength(adm) {
    adm.atom.reportObserved();
    return adm.values.length;
}
function setArrayLength(adm, newLength) {
    if (typeof newLength !== "number" || newLength < 0)
        throw new Error("[mobx.array] Out of range: " + newLength);
    var currentLength = adm.values.length;
    if (newLength === currentLength)
        return;
    else if (newLength > currentLength)
        spliceWithArray(adm, currentLength, 0, new Array(newLength - currentLength));
    else
        spliceWithArray(adm, newLength, currentLength - newLength);
}
// adds / removes the necessary numeric properties to this object
function updateArrayLength(adm, oldLength, delta) {
    if (oldLength !== adm.lastKnownLength)
        throw new Error("[mobx] Modification exception: the internal structure of an observable array was changed. Did you use peek() to change it?");
    derivation_1.checkIfStateModificationsAreAllowed();
    adm.lastKnownLength += delta;
    if (delta > 0 && oldLength + delta > OBSERVABLE_ARRAY_BUFFER_SIZE)
        reserveArrayBuffer(oldLength + delta);
}
function spliceWithArray(adm, index, deleteCount, newItems) {
    var length = adm.values.length;
    if ((newItems === undefined || newItems.length === 0) && (deleteCount === 0 || length === 0))
        return [];
    if (index === undefined)
        index = 0;
    else if (index > length)
        index = length;
    else if (index < 0)
        index = Math.max(0, length + index);
    if (arguments.length === 2)
        deleteCount = length - index;
    else if (deleteCount === undefined || deleteCount === null)
        deleteCount = 0;
    else
        deleteCount = Math.max(0, Math.min(deleteCount, length - index));
    if (newItems === undefined)
        newItems = utils_1.EMPTY_ARRAY;
    else
        newItems = newItems.map(adm.makeChildReactive);
    var lengthDelta = newItems.length - deleteCount;
    updateArrayLength(adm, length, lengthDelta); // create or remove new entries
    var res = (_a = adm.values).splice.apply(_a, [index, deleteCount].concat(newItems));
    notifyArraySplice(adm, index, res, newItems);
    return res;
    var _a;
}
function makeReactiveArrayItem(value) {
    // this = IObservableArrayAdministration, bound during construction
    modifiers_1.assertUnwrapped(value, "Array values cannot have modifiers");
    if (this.mode === modifiers_1.ValueMode.Flat || this.mode === modifiers_1.ValueMode.Reference)
        return value;
    return modifiers_1.makeChildObservable(value, this.mode, this.atom.name + "@" + this.atom.id + " / ArrayEntry");
}
function notifyArrayChildUpdate(adm, index, oldValue) {
    adm.atom.reportChanged();
    // conform: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/observe
    if (adm.changeEvent)
        adm.changeEvent.emit({ object: adm.array, type: "update", index: index, oldValue: oldValue });
}
function notifyArraySplice(adm, index, deleted, added) {
    if (deleted.length === 0 && added.length === 0)
        return;
    adm.atom.reportChanged();
    // conform: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/observe
    if (adm.changeEvent)
        adm.changeEvent.emit({ object: adm.array, type: "splice", index: index, addedCount: added.length, removed: deleted });
}
var ObservableArray = (function (_super) {
    __extends(ObservableArray, _super);
    function ObservableArray(initialValues, mode, name) {
        _super.call(this);
        var adm = this.$mobx = {
            atom: new atom_1.Atom(name || "ObservableArray"),
            values: undefined,
            changeEvent: undefined,
            lastKnownLength: 0,
            mode: mode,
            array: this,
            makeChildReactive: function (v) { return makeReactiveArrayItem.call(adm, v); }
        };
        Object.defineProperty(this, "$mobx", {
            enumerable: false,
            configurable: false,
            writable: false
        });
        if (initialValues && initialValues.length) {
            updateArrayLength(adm, 0, initialValues.length);
            adm.values = initialValues.map(adm.makeChildReactive);
        }
        else
            adm.values = [];
    }
    ObservableArray.prototype.observe = function (listener, fireImmediately) {
        if (fireImmediately === void 0) { fireImmediately = false; }
        if (this.$mobx.changeEvent === undefined)
            this.$mobx.changeEvent = new simpleeventemitter_1.SimpleEventEmitter();
        if (fireImmediately)
            listener({ object: this, type: "splice", index: 0, addedCount: this.$mobx.values.length, removed: [] });
        return this.$mobx.changeEvent.on(listener);
    };
    ObservableArray.prototype.clear = function () {
        return this.splice(0);
    };
    ObservableArray.prototype.replace = function (newItems) {
        return spliceWithArray(this.$mobx, 0, this.$mobx.values.length, newItems);
    };
    ObservableArray.prototype.toJSON = function () {
        this.$mobx.atom.reportObserved();
        // JSON.stringify recurses on returned objects, so this will work fine
        return this.$mobx.values.slice();
    };
    ObservableArray.prototype.peek = function () {
        return this.$mobx.values;
    };
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/find
    ObservableArray.prototype.find = function (predicate, thisArg, fromIndex) {
        if (fromIndex === void 0) { fromIndex = 0; }
        this.$mobx.atom.reportObserved();
        var items = this.$mobx.values, l = items.length;
        for (var i = fromIndex; i < l; i++)
            if (predicate.call(thisArg, items[i], i, this))
                return items[i];
        return null;
    };
    /*
        functions that do alter the internal structure of the array, (based on lib.es6.d.ts)
        since these functions alter the inner structure of the array, the have side effects.
        Because the have side effects, they should not be used in computed function,
        and for that reason the do not call dependencyState.notifyObserved
        */
    ObservableArray.prototype.splice = function (index, deleteCount) {
        var newItems = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            newItems[_i - 2] = arguments[_i];
        }
        switch (arguments.length) {
            case 0:
                return [];
            case 1:
                return spliceWithArray(this.$mobx, index);
            case 2:
                return spliceWithArray(this.$mobx, index, deleteCount);
        }
        return spliceWithArray(this.$mobx, index, deleteCount, newItems);
    };
    ObservableArray.prototype.push = function () {
        var items = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            items[_i - 0] = arguments[_i];
        }
        spliceWithArray(this.$mobx, this.$mobx.values.length, 0, items);
        return this.$mobx.values.length;
    };
    ObservableArray.prototype.pop = function () {
        return this.splice(Math.max(this.$mobx.values.length - 1, 0), 1)[0];
    };
    ObservableArray.prototype.shift = function () {
        return this.splice(0, 1)[0];
    };
    ObservableArray.prototype.unshift = function () {
        var items = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            items[_i - 0] = arguments[_i];
        }
        spliceWithArray(this.$mobx, 0, 0, items);
        return this.$mobx.values.length;
    };
    ObservableArray.prototype.reverse = function () {
        this.$mobx.atom.reportObserved();
        // reverse by default mutates in place before returning the result
        // which makes it both a 'derivation' and a 'mutation'.
        // so we deviate from the default and just make it an dervitation
        var clone = this.slice();
        return clone.reverse.apply(clone, arguments);
    };
    ObservableArray.prototype.sort = function (compareFn) {
        this.$mobx.atom.reportObserved();
        // sort by default mutates in place before returning the result
        // which goes against all good practices. Let's not change the array in place!
        var clone = this.slice();
        return clone.sort.apply(clone, arguments);
    };
    ObservableArray.prototype.remove = function (value) {
        var idx = this.$mobx.values.indexOf(value);
        if (idx > -1) {
            this.splice(idx, 1);
            return true;
        }
        return false;
    };
    ObservableArray.prototype.toString = function () {
        return "[mobx.array] " + Array.prototype.toString.apply(this.$mobx.values, arguments);
    };
    ObservableArray.prototype.toLocaleString = function () {
        return "[mobx.array] " + Array.prototype.toLocaleString.apply(this.$mobx.values, arguments);
    };
    return ObservableArray;
}(StubArray));
exports.ObservableArray = ObservableArray;
/**
 * We don't want those to show up in `for (const key in ar)` ...
 */
utils_1.makeNonEnumerable(ObservableArray.prototype, [
    "constructor",
    "clear",
    "find",
    "observe",
    "pop",
    "peek",
    "push",
    "remove",
    "replace",
    "reverse",
    "shift",
    "sort",
    "splice",
    "split",
    "toJSON",
    "toLocaleString",
    "toString",
    "unshift"
]);
Object.defineProperty(ObservableArray.prototype, "length", {
    enumerable: false,
    configurable: true,
    get: function () {
        return getArrayLength(this.$mobx);
    },
    set: function (newLength) {
        setArrayLength(this.$mobx, newLength);
    }
});
/**
 * Wrap function from prototype
 */
[
    "concat",
    "every",
    "filter",
    "forEach",
    "indexOf",
    "join",
    "lastIndexOf",
    "map",
    "reduce",
    "reduceRight",
    "slice",
    "some"
].forEach(function (funcName) {
    var baseFunc = Array.prototype[funcName];
    Object.defineProperty(ObservableArray.prototype, funcName, {
        configurable: false,
        writable: true,
        enumerable: false,
        value: function () {
            this.$mobx.atom.reportObserved();
            return baseFunc.apply(this.$mobx.values, arguments);
        }
    });
});
function createArrayBufferItem(index) {
    Object.defineProperty(ObservableArray.prototype, "" + index, {
        enumerable: false,
        configurable: false,
        set: function (value) {
            var impl = this.$mobx;
            var values = impl.values;
            modifiers_1.assertUnwrapped(value, "Modifiers cannot be used on array values. For non-reactive array values use makeReactive(asFlat(array)).");
            if (index < values.length) {
                derivation_1.checkIfStateModificationsAreAllowed();
                var oldValue = values[index];
                var changed = impl.mode === modifiers_1.ValueMode.Structure ? !utils_1.deepEquals(oldValue, value) : oldValue !== value;
                if (changed) {
                    values[index] = impl.makeChildReactive(value);
                    notifyArrayChildUpdate(impl, index, oldValue);
                }
            }
            else if (index === values.length)
                spliceWithArray(impl, index, 0, [value]);
            else
                throw new Error("[mobx.array] Index out of bounds, " + index + " is larger than " + values.length);
        },
        get: function () {
            var impl = this.$mobx;
            if (impl && index < impl.values.length) {
                impl.atom.reportObserved();
                return impl.values[index];
            }
            return undefined;
        }
    });
}
function reserveArrayBuffer(max) {
    for (var index = OBSERVABLE_ARRAY_BUFFER_SIZE; index < max; index++)
        createArrayBufferItem(index);
    OBSERVABLE_ARRAY_BUFFER_SIZE = max;
}
reserveArrayBuffer(1000);
function createObservableArray(initialValues, mode, name) {
    return new ObservableArray(initialValues, mode, name);
}
exports.createObservableArray = createObservableArray;
function fastArray(initialValues) {
    utils_1.deprecated("fastArray is deprecated. Please use `observable(asFlat([]))`");
    return createObservableArray(initialValues, modifiers_1.ValueMode.Flat, null);
}
exports.fastArray = fastArray;
function isObservableArray(thing) {
    return thing instanceof ObservableArray;
}
exports.isObservableArray = isObservableArray;
