"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var atom_1 = require("../core/atom");
var derivation_1 = require("../core/derivation");
var modifiers_1 = require("./modifiers");
var utils_1 = require("../utils/utils");
var simpleeventemitter_1 = require("../utils/simpleeventemitter");
var ObservableValue = (function (_super) {
    __extends(ObservableValue, _super);
    function ObservableValue(value, mode, name) {
        if (name === void 0) { name = "ObservableValue"; }
        _super.call(this, name);
        this.mode = mode;
        this.hasUnreportedChange = false;
        this.events = null;
        this.value = undefined;
        var _a = modifiers_1.getValueModeFromValue(value, modifiers_1.ValueMode.Recursive), childmode = _a[0], unwrappedValue = _a[1];
        // If the value mode is recursive, modifiers like 'structure', 'reference', or 'flat' could apply
        if (this.mode === modifiers_1.ValueMode.Recursive)
            this.mode = childmode;
        this.value = modifiers_1.makeChildObservable(unwrappedValue, this.mode, this.name);
    }
    ObservableValue.prototype.set = function (newValue) {
        modifiers_1.assertUnwrapped(newValue, "Modifiers cannot be used on non-initial values.");
        derivation_1.checkIfStateModificationsAreAllowed();
        var oldValue = this.value;
        var changed = utils_1.valueDidChange(this.mode === modifiers_1.ValueMode.Structure, oldValue, newValue);
        if (changed) {
            this.value = modifiers_1.makeChildObservable(newValue, this.mode, this.name);
            this.reportChanged();
            if (this.events)
                this.events.emit(newValue, oldValue);
        }
        return changed;
    };
    ObservableValue.prototype.get = function () {
        this.reportObserved();
        return this.value;
    };
    ObservableValue.prototype.observe = function (listener, fireImmediately) {
        if (!this.events)
            this.events = new simpleeventemitter_1.SimpleEventEmitter();
        if (fireImmediately)
            listener(this.value, undefined);
        return this.events.on(listener);
    };
    ObservableValue.prototype.toString = function () {
        return this.name + "@" + this.id + "[" + this.value + "]";
    };
    return ObservableValue;
}(atom_1.Atom));
exports.ObservableValue = ObservableValue;
