"use strict";
var modifiers_1 = require("../types/modifiers");
var observableobject_1 = require("../types/observableobject");
var utils_1 = require("../utils/utils");
var computedvalue_1 = require("../core/computedvalue");
function computed(targetOrExpr, keyOrScope, baseDescriptor, options) {
    if (arguments.length < 3 && typeof targetOrExpr === "function")
        return computedExpr(targetOrExpr, keyOrScope);
    return computedDecorator.apply(null, arguments);
}
exports.computed = computed;
function computedExpr(expr, scope) {
    var _a = modifiers_1.getValueModeFromValue(expr, modifiers_1.ValueMode.Recursive), mode = _a[0], value = _a[1];
    return new computedvalue_1.ComputedValue(value, scope, mode === modifiers_1.ValueMode.Structure, value.name || "ComputedValue");
}
function computedDecorator(target, key, baseDescriptor, options) {
    // invoked as decorator factory with options
    if (arguments.length === 1) {
        var options_1 = target;
        return function (target, key, baseDescriptor) { return computedDecorator.call(null, target, key, baseDescriptor, options_1); };
    }
    utils_1.invariant(baseDescriptor && baseDescriptor.hasOwnProperty("get"), "@computed can only be used on getter functions, like: '@computed get myProps() { return ...; }'");
    utils_1.assertPropertyConfigurable(target, key);
    var descriptor = {};
    var getter = baseDescriptor.get;
    utils_1.invariant(typeof target === "object", "The @observable decorator can only be used on objects", key);
    utils_1.invariant(typeof getter === "function", "@observable expects a getter function if used on a property.", key);
    utils_1.invariant(!baseDescriptor.set, "@observable properties cannot have a setter.", key);
    utils_1.invariant(getter.length === 0, "@observable getter functions should not take arguments.", key);
    descriptor.configurable = true;
    descriptor.enumerable = false;
    descriptor.get = function () {
        observableobject_1.setObservableObjectProperty(observableobject_1.asObservableObject(this, undefined, modifiers_1.ValueMode.Recursive), key, options && options.asStructure === true ? modifiers_1.asStructure(getter) : getter);
        return this[key];
    };
    // by default, assignments to properties without setter are ignored. Let's fail fast instead.
    descriptor.set = throwingComputedValueSetter;
    if (!baseDescriptor) {
        Object.defineProperty(target, key, descriptor); // For typescript
    }
    else {
        return descriptor;
    }
}
function throwingComputedValueSetter() {
    throw new Error("[ComputedValue] It is not allowed to assign new values to computed properties.");
}
exports.throwingComputedValueSetter = throwingComputedValueSetter;
