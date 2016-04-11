"use strict";
var observablearray_1 = require("../types/observablearray");
var observablemap_1 = require("../types/observablemap");
var observableobject_1 = require("../types/observableobject");
var observable_1 = require("./observable");
var computedvalue_1 = require("../core/computedvalue");
var observablevalue_1 = require("../types/observablevalue");
var utils_1 = require("../utils/utils");
var isobservable_1 = require("./isobservable");
var extendobservable_1 = require("./extendobservable");
function observe(thing, propOrCb, cbOrFire, fireImmediately) {
    if (typeof cbOrFire === "function")
        return observeObservableProperty(thing, propOrCb, cbOrFire, fireImmediately);
    else
        return observeObservable(thing, propOrCb, cbOrFire);
}
exports.observe = observe;
function observeObservable(thing, listener, fireImmediately) {
    if (observablearray_1.isObservableArray(thing))
        return thing.observe(listener);
    if (observablemap_1.isObservableMap(thing))
        return thing.observe(listener);
    if (observableobject_1.isObservableObject(thing))
        return observableobject_1.observeObservableObject(thing, listener, fireImmediately);
    if (thing instanceof observablevalue_1.ObservableValue || thing instanceof computedvalue_1.ComputedValue)
        return thing.observe(listener, fireImmediately);
    if (utils_1.isPlainObject(thing))
        return observeObservable(observable_1.observable(thing), listener, fireImmediately);
    utils_1.invariant(false, "first argument of observe should be some observable value or plain object");
}
function observeObservableProperty(thing, property, listener, fireImmediately) {
    var propError = "[mobx.observe] the provided observable map has no key with name: " + property;
    if (observablemap_1.isObservableMap(thing)) {
        if (!thing._has(property))
            throw new Error(propError);
        return observe(thing._data[property], listener);
    }
    if (observableobject_1.isObservableObject(thing)) {
        if (!isobservable_1.isObservable(thing, property))
            throw new Error(propError);
        return observe(thing.$mobx.values[property], listener, fireImmediately);
    }
    if (utils_1.isPlainObject(thing)) {
        extendobservable_1.extendObservable(thing, {
            property: thing[property]
        });
        return observeObservableProperty(thing, property, listener, fireImmediately);
    }
    utils_1.invariant(false, "first argument of observe should be an (observable)object or observableMap if a property name is given");
}
