"use strict";
var observable_1 = require("./observable");
var utils_1 = require("../utils/utils");
var extras_1 = require("../api/extras");
var globalstate_1 = require("./globalstate");
function isComputingDerivation() {
    return globalstate_1.globalState.derivationStack.length > 0;
}
exports.isComputingDerivation = isComputingDerivation;
function checkIfStateModificationsAreAllowed() {
    utils_1.invariant(globalstate_1.globalState.allowStateChanges, "It is not allowed to change the state when a computed value is being evaluated. Use 'autorun' to create reactive functions with side-effects. Or use 'extras.allowStateChanges(true, block)' to supress this message.");
}
exports.checkIfStateModificationsAreAllowed = checkIfStateModificationsAreAllowed;
/**
 * Notify a derivation that one of the values it is observing has become stale
 */
function notifyDependencyStale(derivation) {
    if (++derivation.dependencyStaleCount === 1) {
        extras_1.reportTransition(derivation, "STALE");
        observable_1.propagateStaleness(derivation);
    }
}
exports.notifyDependencyStale = notifyDependencyStale;
/**
 * Notify a derivation that one of the values it is observing has become stable again.
 * If all observed values are stable and at least one of them has changed, the derivation
 * will be scheduled for re-evaluation.
 */
function notifyDependencyReady(derivation, dependencyDidChange) {
    utils_1.invariant(derivation.dependencyStaleCount > 0, "unexpected ready notification");
    if (dependencyDidChange)
        derivation.dependencyChangeCount += 1;
    if (--derivation.dependencyStaleCount === 0) {
        // all dependencies are ready
        if (derivation.dependencyChangeCount > 0) {
            // did any of the observables really change?
            derivation.dependencyChangeCount = 0;
            extras_1.reportTransition(derivation, "PENDING");
            var changed = derivation.onDependenciesReady();
            observable_1.propagateReadiness(derivation, changed);
        }
        else {
            // we're done, but didn't change, lets make sure verybody knows..
            extras_1.reportTransition(derivation, "READY", false);
            observable_1.propagateReadiness(derivation, false);
        }
    }
}
exports.notifyDependencyReady = notifyDependencyReady;
/**
 * Executes the provided function `f` and tracks which observables are being accessed.
 * The tracking information is stored on the `derivation` object and the derivation is registered
 * as observer of any of the accessed observables.
 */
function trackDerivedFunction(derivation, f) {
    var hasException = true;
    var prevObserving = derivation.observing;
    derivation.observing = [];
    globalstate_1.globalState.derivationStack.push(derivation);
    try {
        var result = f();
        hasException = false;
        bindDependencies(derivation, prevObserving);
        return result;
    }
    finally {
        if (hasException) {
            console.error("[mobx] An uncaught exception occurred while calculating your computed value, autorun or transformer. Or inside the render method of a React component. " +
                "These methods should never throw exceptions as MobX will usually not be able to recover from them. " +
                ("Please enable 'Pause on (caught) exceptions' in your debugger to find the root cause. In: '" + derivation.name + "#" + derivation.id + "'"));
            // Poor mans recovery attempt
            // Assumption here is that this is the only exception handler in MobX.
            // So functions higher up in the stack (like transanction) won't be modifying the globalState anymore after this call.
            // (Except for other trackDerivedFunction calls of course, but that is just)
            globalstate_1.resetGlobalState();
        }
    }
}
exports.trackDerivedFunction = trackDerivedFunction;
function bindDependencies(derivation, prevObserving) {
    globalstate_1.globalState.derivationStack.length -= 1;
    var _a = utils_1.quickDiff(derivation.observing, prevObserving), added = _a[0], removed = _a[1];
    for (var i = 0, l = added.length; i < l; i++) {
        var dependency = added[i];
        // only check for cycles on new dependencies, existing dependencies cannot cause a cycle..
        utils_1.invariant(!findCycle(derivation, dependency), "Cycle detected", derivation);
        observable_1.addObserver(added[i], derivation);
    }
    // remove observers after adding them, so that they don't go in lazy mode to early
    for (var i = 0, l = removed.length; i < l; i++)
        observable_1.removeObserver(removed[i], derivation);
}
/**
 * Find out whether the dependency tree of this derivation contains a cycle, as would be the case in a
 * computation like `a = a * 2`
 */
function findCycle(needle, node) {
    var obs = node.observing;
    if (obs === undefined)
        return false;
    if (obs.indexOf(node) !== -1)
        return true;
    for (var l = obs.length, i = 0; i < l; i++)
        if (findCycle(needle, obs[i]))
            return true;
    return false;
}
