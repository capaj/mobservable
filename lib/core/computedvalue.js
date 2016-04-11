"use strict";
var observable_1 = require("./observable");
var derivation_1 = require("./derivation");
var globalstate_1 = require("./globalstate");
var utils_1 = require("../utils/utils");
var extras_1 = require("../api/extras");
var autorun_1 = require("../api/autorun");
/**
 * A node in the state dependency root that observes other nodes, and can be observed itself.
 *
 * Computed values will update automatically if any observed value changes and if they are observed themselves.
 * If a computed value isn't actively used by another observer, but is inspect, it will compute lazily to return at least a consistent value.
 */
var ComputedValue = (function () {
    /**
     * Create a new computed value based on a function expression.
     *
     * The `name` property is for debug purposes only.
     *
     * The `compareStructural` property indicates whether the return values should be compared structurally.
     * Normally, a computed value will not notify an upstream observer if a newly produced value is strictly equal to the previously produced value.
     * However, enabling compareStructural can be convienent if you always produce an new aggregated object and don't want to notify observers if it is structurally the same.
     * This is useful for working with vectors, mouse coordinates etc.
     */
    function ComputedValue(derivation, scope, compareStructural, name) {
        var _this = this;
        if (name === void 0) { name = "ComputedValue"; }
        this.derivation = derivation;
        this.scope = scope;
        this.compareStructural = compareStructural;
        this.name = name;
        this.id = globalstate_1.getNextId();
        this.isLazy = true; // nobody is observing this derived value, so don't bother tracking upstream values
        this.isComputing = false;
        this.staleObservers = [];
        this.observers = []; // nodes that are dependent on this node. Will be notified when our state change
        this.observing = []; // nodes we are looking at. Our value depends on these nodes
        this.dependencyChangeCount = 0; // nr of nodes being observed that have received a new value. If > 0, we should recompute
        this.dependencyStaleCount = 0; // nr of nodes being observed that are currently not ready
        this.value = undefined;
        this.peek = function () {
            // MWE: hmm.. to many state vars here...
            _this.isComputing = true;
            globalstate_1.globalState.isComputingComputedValue++;
            var prevAllowStateChanges = globalstate_1.globalState.allowStateChanges;
            globalstate_1.globalState.allowStateChanges = false;
            var res = derivation.call(scope);
            globalstate_1.globalState.allowStateChanges = prevAllowStateChanges;
            globalstate_1.globalState.isComputingComputedValue--;
            _this.isComputing = false;
            return res;
        };
    }
    ComputedValue.prototype.onBecomeObserved = function () {
        // noop, handled by .get()
    };
    ComputedValue.prototype.onBecomeUnobserved = function () {
        for (var i = 0, l = this.observing.length; i < l; i++)
            observable_1.removeObserver(this.observing[i], this);
        this.observing = [];
        this.isLazy = true;
        this.value = undefined;
    };
    ComputedValue.prototype.onDependenciesReady = function () {
        var changed = this.trackAndCompute();
        extras_1.reportTransition(this, "READY", changed);
        return changed;
    };
    /**
     * Returns the current value of this computed value.
     * Will evaluate it's computation first if needed.
     */
    ComputedValue.prototype.get = function () {
        utils_1.invariant(!this.isComputing, "Cycle detected", this.derivation);
        observable_1.reportObserved(this);
        if (this.dependencyStaleCount > 0) {
            // This is worst case, somebody is inspecting our value while we are stale.
            // This can happen in two cases:
            // 1) somebody explicitly requests our value during a transaction
            // 2) this computed value is used in another computed value in which it wasn't used
            //    before, and hence it is required now 'too early'. See for an example issue 165.
            // we have no other option than to (possible recursively) forcefully recompute.
            return this.peek();
        }
        if (this.isLazy) {
            if (derivation_1.isComputingDerivation()) {
                // somebody depends on the outcome of this computation
                this.isLazy = false;
                this.trackAndCompute();
            }
            else {
                // nobody depends on this computable;
                // so just compute fresh value and continue to sleep
                return this.peek();
            }
        }
        // we are up to date. Return the value
        return this.value;
    };
    ComputedValue.prototype.set = function (_) {
        throw new Error("[ComputedValue '" + name + "'] It is not possible to assign a new value to a computed value.");
    };
    ComputedValue.prototype.trackAndCompute = function () {
        var oldValue = this.value;
        this.value = derivation_1.trackDerivedFunction(this, this.peek);
        return utils_1.valueDidChange(this.compareStructural, this.value, oldValue);
    };
    ComputedValue.prototype.observe = function (listener, fireImmediately) {
        var _this = this;
        var firstTime = true;
        var prevValue = undefined;
        return autorun_1.autorun(function () {
            var newValue = _this.get();
            if (!firstTime || fireImmediately) {
                listener(newValue, prevValue);
            }
            firstTime = false;
            prevValue = newValue;
        });
    };
    ComputedValue.prototype.toString = function () {
        return this.name + "@" + this.id + "[" + this.derivation.toString() + "]";
    };
    return ComputedValue;
}());
exports.ComputedValue = ComputedValue;
