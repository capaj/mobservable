"use strict";
var observablevalue_1 = require("./observablevalue");
var computedvalue_1 = require("../core/computedvalue");
var modifiers_1 = require("./modifiers");
var utils_1 = require("../utils/utils");
var simpleeventemitter_1 = require("../utils/simpleeventemitter");
var globalstate_1 = require("../core/globalstate");
var computeddecorator_1 = require("../api/computeddecorator");
var ObservableObjectMarker = {};
function asObservableObject(target, name, mode) {
    if (name === void 0) { name = "ObservableObject"; }
    if (mode === void 0) { mode = modifiers_1.ValueMode.Recursive; }
    if (target.$mobx) {
        if (target.$mobx.type !== ObservableObjectMarker)
            throw new Error("The given object is observable but not an observable object");
        return target.$mobx;
    }
    var adm = {
        type: ObservableObjectMarker,
        values: {},
        events: undefined,
        id: globalstate_1.getNextId(),
        target: target, name: name, mode: mode
    };
    Object.defineProperty(target, "$mobx", {
        enumerable: false,
        configurable: false,
        writable: false,
        value: adm
    });
    return adm;
}
exports.asObservableObject = asObservableObject;
function setObservableObjectProperty(adm, propName, value) {
    if (adm.values[propName])
        adm.target[propName] = value; // the property setter will make 'value' reactive if needed.
    else
        defineObservableProperty(adm, propName, value);
}
exports.setObservableObjectProperty = setObservableObjectProperty;
function defineObservableProperty(adm, propName, value) {
    utils_1.assertPropertyConfigurable(adm.target, propName);
    var observable;
    var name = adm.name + "@" + adm.id + " / Prop \"" + propName + "\"";
    var isComputed = true;
    if (typeof value === "function" && value.length === 0)
        observable = new computedvalue_1.ComputedValue(value, adm.target, false, name);
    else if (value instanceof modifiers_1.AsStructure && typeof value.value === "function" && value.value.length === 0)
        observable = new computedvalue_1.ComputedValue(value.value, adm.target, true, name);
    else {
        isComputed = false;
        observable = new observablevalue_1.ObservableValue(value, adm.mode, name);
    }
    adm.values[propName] = observable;
    Object.defineProperty(adm.target, propName, {
        configurable: true,
        enumerable: !isComputed,
        get: function () {
            return observable.get();
        },
        set: isComputed
            ? computeddecorator_1.throwingComputedValueSetter
            : function (newValue) {
                var oldValue = observable.value;
                if (adm.events) {
                    adm.events.emit({
                        type: "preupdate",
                        object: this,
                        name: propName,
                        oldValue: oldValue,
                        newValue: newValue
                    });
                }
                if (observable.set(newValue) && adm.events !== undefined) {
                    adm.events.emit({
                        type: "update",
                        object: this,
                        name: propName,
                        oldValue: oldValue
                    });
                }
            }
    });
    if (adm.events !== undefined) {
        adm.events.emit({
            type: "add",
            object: adm.target,
            name: propName
        });
    }
    ;
}
/**
    * Observes this object. Triggers for the events 'add', 'update', 'preupdate' and 'delete'.
    * See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/observe
    * for callback details
    */
function observeObservableObject(object, callback, fireImmediately) {
    utils_1.invariant(isObservableObject(object), "Expected observable object");
    utils_1.invariant(fireImmediately !== true, "`observe` doesn't support the fire immediately property for observable objects.");
    var adm = object.$mobx;
    if (adm.events === undefined)
        adm.events = new simpleeventemitter_1.SimpleEventEmitter();
    return object.$mobx.events.on(callback);
}
exports.observeObservableObject = observeObservableObject;
function isObservableObject(thing) {
    return thing && thing.$mobx && thing.$mobx.type === ObservableObjectMarker;
}
exports.isObservableObject = isObservableObject;
