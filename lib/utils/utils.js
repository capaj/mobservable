"use strict";
exports.EMPTY_ARRAY = [];
Object.freeze(exports.EMPTY_ARRAY);
function invariant(check, message, thing) {
    if (!check)
        throw new Error("[mobx] Invariant failed: " + message + (thing ? " in '" + thing + "'" : ""));
}
exports.invariant = invariant;
var deprecatedMessages = [];
function deprecated(msg) {
    if (deprecatedMessages.indexOf(msg) !== -1)
        return;
    deprecatedMessages.push(msg);
    console.error("[mobx] Deprecated: " + msg);
}
exports.deprecated = deprecated;
/**
 * Makes sure that the provided function is invoked at most once.
 */
function once(func) {
    var invoked = false;
    return function () {
        if (invoked)
            return;
        invoked = true;
        return func.apply(this, arguments);
    };
}
exports.once = once;
exports.noop = function () { };
function unique(list) {
    var res = [];
    list.forEach(function (item) {
        if (res.indexOf(item) === -1)
            res.push(item);
    });
    return res;
}
exports.unique = unique;
function isPlainObject(value) {
    return value !== null && typeof value === "object" && Object.getPrototypeOf(value) === Object.prototype;
}
exports.isPlainObject = isPlainObject;
function valueDidChange(compareStructural, oldValue, newValue) {
    return compareStructural
        ? !deepEquals(oldValue, newValue)
        : oldValue !== newValue;
}
exports.valueDidChange = valueDidChange;
function makeNonEnumerable(object, props) {
    for (var i = 0; i < props.length; i++) {
        Object.defineProperty(object, props[i], {
            configurable: true,
            writable: true,
            enumerable: false,
            value: object[props[i]]
        });
    }
}
exports.makeNonEnumerable = makeNonEnumerable;
function isPropertyConfigurable(object, prop) {
    var descriptor = Object.getOwnPropertyDescriptor(object, prop);
    return !descriptor || (descriptor.configurable !== false && descriptor.writable !== false);
}
exports.isPropertyConfigurable = isPropertyConfigurable;
function assertPropertyConfigurable(object, prop) {
    invariant(isPropertyConfigurable(object, prop), "Cannot make property '" + prop + "' observable, it is not configurable and writable in the target object");
}
exports.assertPropertyConfigurable = assertPropertyConfigurable;
/**
 * Naive deepEqual. Doesn't check for prototype, non-enumerable or out-of-range properties on arrays.
 * If you have such a case, you probably should use this function but something fancier :).
 */
function deepEquals(a, b) {
    if (a === null && b === null)
        return true;
    if (a === undefined && b === undefined)
        return true;
    var aIsArray = Array.isArray(a) || observablearray_1.isObservableArray(a);
    if (aIsArray !== (Array.isArray(b) || observablearray_1.isObservableArray(b))) {
        return false;
    }
    else if (aIsArray) {
        if (a.length !== b.length)
            return false;
        for (var i = a.length; i >= 0; i--)
            if (!deepEquals(a[i], b[i]))
                return false;
        return true;
    }
    else if (typeof a === "object" && typeof b === "object") {
        if (a === null || b === null)
            return false;
        if (Object.keys(a).length !== Object.keys(b).length)
            return false;
        for (var prop in a) {
            if (!b.hasOwnProperty(prop))
                return false;
            if (!deepEquals(a[prop], b[prop]))
                return false;
        }
        return true;
    }
    return a === b;
}
exports.deepEquals = deepEquals;
/**
 * Given a new and an old list, tries to determine which items are added or removed
 * in linear time. The algorithm is heuristic and does not give the optimal results in all cases.
 * (For example, [a,b] -> [b, a] yiels [[b,a],[a,b]])
 * its basic assumptions is that the difference between base and current are a few splices.
 *
 * returns a tuple<addedItems, removedItems>
 * @type {T[]}
 */
function quickDiff(current, base) {
    if (!base || !base.length)
        return [current, []];
    if (!current || !current.length)
        return [[], base];
    var added = [];
    var removed = [];
    var currentIndex = 0, currentSearch = 0, currentLength = current.length, currentExhausted = false, baseIndex = 0, baseSearch = 0, baseLength = base.length, isSearching = false, baseExhausted = false;
    while (!baseExhausted && !currentExhausted) {
        if (!isSearching) {
            // within rang and still the same
            if (currentIndex < currentLength && baseIndex < baseLength && current[currentIndex] === base[baseIndex]) {
                currentIndex++;
                baseIndex++;
                // early exit; ends where equal
                if (currentIndex === currentLength && baseIndex === baseLength)
                    return [added, removed];
                continue;
            }
            currentSearch = currentIndex;
            baseSearch = baseIndex;
            isSearching = true;
        }
        baseSearch += 1;
        currentSearch += 1;
        if (baseSearch >= baseLength)
            baseExhausted = true;
        if (currentSearch >= currentLength)
            currentExhausted = true;
        if (!currentExhausted && current[currentSearch] === base[baseIndex]) {
            // items where added
            added.push.apply(added, current.slice(currentIndex, currentSearch));
            currentIndex = currentSearch + 1;
            baseIndex++;
            isSearching = false;
        }
        else if (!baseExhausted && base[baseSearch] === current[currentIndex]) {
            // items where removed
            removed.push.apply(removed, base.slice(baseIndex, baseSearch));
            baseIndex = baseSearch + 1;
            currentIndex++;
            isSearching = false;
        }
    }
    added.push.apply(added, current.slice(currentIndex));
    removed.push.apply(removed, base.slice(baseIndex));
    return [added, removed];
}
exports.quickDiff = quickDiff;
var observablearray_1 = require("../types/observablearray");
