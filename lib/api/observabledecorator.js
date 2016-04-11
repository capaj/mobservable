"use strict";
var modifiers_1 = require("../types/modifiers");
var extras_1 = require("../api/extras");
var computeddecorator_1 = require("../api/computeddecorator");
var observableobject_1 = require("../types/observableobject");
var utils_1 = require("../utils/utils");
/**
 * ES6 / Typescript decorator which can to make class properties and getter functions reactive.
 * Use this annotation to wrap properties of an object in an observable, for example:
 * class OrderLine {
 *   @observable amount = 3;
 *   @observable price = 2;
 *   @observable total() {
 *      return this.amount * this.price;
 *   }
 * }
 */
function observableDecorator(target, key, baseDescriptor) {
    utils_1.invariant(arguments.length >= 2 && arguments.length <= 3, "Illegal decorator config", key);
    utils_1.assertPropertyConfigurable(target, key);
    // - In typescript, observable annotations are invoked on the prototype, not on actual instances,
    // so upon invocation, determine the 'this' instance, and define a property on the
    // instance as well (that hides the propotype property)
    // - In typescript, the baseDescriptor is empty for attributes without initial value
    // - In babel, the initial value is passed as the closure baseDiscriptor.initializer'
    if (baseDescriptor && baseDescriptor.hasOwnProperty("get")) {
        utils_1.deprecated("Using @observable on computed values is deprecated. Use @computed instead.");
        return computeddecorator_1.computed.apply(null, arguments);
    }
    var descriptor = {};
    var baseValue = undefined;
    if (baseDescriptor) {
        if (baseDescriptor.hasOwnProperty("value"))
            baseValue = baseDescriptor.value;
        else if (baseDescriptor.initializer) {
            baseValue = baseDescriptor.initializer();
            if (typeof baseValue === "function")
                baseValue = modifiers_1.asReference(baseValue);
        }
    }
    utils_1.invariant(typeof target === "object", "The @observable decorator can only be used on objects", key);
    descriptor.configurable = true;
    descriptor.enumerable = true;
    descriptor.get = function () {
        var _this = this;
        // the getter might create a reactive property lazily, so this might even happen during a view.
        extras_1.allowStateChanges(true, function () {
            observableobject_1.setObservableObjectProperty(observableobject_1.asObservableObject(_this, undefined, modifiers_1.ValueMode.Recursive), key, baseValue);
        });
        return this[key];
    };
    descriptor.set = function (value) {
        observableobject_1.setObservableObjectProperty(observableobject_1.asObservableObject(this, undefined, modifiers_1.ValueMode.Recursive), key, typeof value === "function" ? modifiers_1.asReference(value) : value);
    };
    if (!baseDescriptor) {
        Object.defineProperty(target, key, descriptor); // For typescript
    }
    else {
        return descriptor;
    }
}
exports.observableDecorator = observableDecorator;
