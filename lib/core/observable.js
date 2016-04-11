"use strict";
var derivation_1 = require("./derivation");
var globalstate_1 = require("./globalstate");
var utils_1 = require("../utils/utils");
function addObserver(observable, node) {
    var obs = observable.observers, l = obs.length;
    obs[l] = node;
    if (l === 0)
        observable.onBecomeObserved();
}
exports.addObserver = addObserver;
function removeObserver(observable, node) {
    var obs = observable.observers, idx = obs.indexOf(node);
    if (idx !== -1)
        obs.splice(idx, 1);
    if (obs.length === 0)
        observable.onBecomeUnobserved();
}
exports.removeObserver = removeObserver;
function reportObserved(observable) {
    if (globalstate_1.globalState.inUntracked > 0)
        return;
    var derivationStack = globalstate_1.globalState.derivationStack;
    var l = derivationStack.length;
    if (l > 0) {
        var deps = derivationStack[l - 1].observing, depslength = deps.length;
        // this last item added check is an optimization especially for array loops,
        // because an array.length read with subsequent reads from the array
        // might trigger many observed events, while just checking the latest added items is cheap
        if (deps[depslength - 1] !== observable && deps[depslength - 2] !== observable)
            deps[depslength] = observable;
    }
}
exports.reportObserved = reportObserved;
function propagateStaleness(observable) {
    var os = observable.observers.slice();
    os.forEach(derivation_1.notifyDependencyStale);
    observable.staleObservers = observable.staleObservers.concat(os);
}
exports.propagateStaleness = propagateStaleness;
function propagateReadiness(observable, valueDidActuallyChange) {
    observable.staleObservers.splice(0).forEach(function (o) { return derivation_1.notifyDependencyReady(o, valueDidActuallyChange); });
}
exports.propagateReadiness = propagateReadiness;
/**
 * TODO: just delete this, and introduce peek() on observables (and computed) instead? This is unelegant and unecessarily weird.
 */
function untracked(action) {
    utils_1.deprecated("This feature is experimental and might be removed in a future minor release. Please report if you use this feature in production: https://github.com/mobxjs/mobx/issues/49");
    globalstate_1.globalState.inUntracked++;
    var res = action();
    globalstate_1.globalState.inUntracked--;
    return res;
}
exports.untracked = untracked;
