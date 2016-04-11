"use strict";
var observable_1 = require("./observable");
var derivation_1 = require("./derivation");
var globalstate_1 = require("./globalstate");
var extras_1 = require("../api/extras");
var utils_1 = require("../utils/utils");
/**
 * Reactions are a special kind of derivations. Several things distinguishes them from normal reactive computations
 *
 * 1) They will always run, whether they are used by other computations or not.
 * This means that they are very suitable for triggering side effects like logging, updating the DOM and making network requests.
 * 2) They are not observable themselves
 * 3) They will always run after any 'normal' derivations
 * 4) They are allowed to change the state and thereby triggering themselvs again, as long as they make sure the state propagates to a stable state in a reasonable amount of iterations.
 *
 * The state machine of a Reaction is as follows:
 *
 * 1) after creating, the reaction should be started by calling `runReaction` or by scheduling it (see also `autorun`)
 * 2) the `onInvalidate` handler should somehow result in a call to `this.track(someFunction)`
 * 3) all observables accessed in `someFunction` will be observed by this reaction.
 * 4) as soon as some of the dependencies has changed the Reaction will be rescheduled for another run (after the current mutation or transaction). `isScheduled` will yield true once a dependency is stale and during this period
 * 5) `onInvalidate` will be called, and we are back at step 1.
 *
 */
var Reaction = (function () {
    function Reaction(name, onInvalidate) {
        if (name === void 0) { name = "Reaction"; }
        this.name = name;
        this.onInvalidate = onInvalidate;
        this.id = globalstate_1.getNextId();
        this.staleObservers = utils_1.EMPTY_ARRAY; // Won't change
        this.observers = utils_1.EMPTY_ARRAY; // Won't change
        this.observing = []; // nodes we are looking at. Our value depends on these nodes
        this.dependencyChangeCount = 0; // nr of nodes being observed that have received a new value. If > 0, we should recompute
        this.dependencyStaleCount = 0; // nr of nodes being observed that are currently not ready
        this.isDisposed = false;
        this._isScheduled = false;
    }
    Reaction.prototype.onBecomeObserved = function () {
        // noop, reaction is always unobserved
    };
    Reaction.prototype.onBecomeUnobserved = function () {
        // noop, reaction is always unobserved
    };
    Reaction.prototype.onDependenciesReady = function () {
        this.schedule();
        return false; // reactions never propagate changes
    };
    Reaction.prototype.schedule = function () {
        if (!this._isScheduled) {
            this._isScheduled = true;
            globalstate_1.globalState.pendingReactions.push(this);
            runReactions();
        }
    };
    Reaction.prototype.isScheduled = function () {
        return this.dependencyStaleCount > 0 || this._isScheduled;
    };
    /**
     * internal, use schedule() if you intend to kick off a reaction
     */
    Reaction.prototype.runReaction = function () {
        if (!this.isDisposed) {
            this._isScheduled = false;
            this.onInvalidate();
            extras_1.reportTransition(this, "READY", true); // a reaction has always 'changed'.
        }
    };
    Reaction.prototype.track = function (fn) {
        derivation_1.trackDerivedFunction(this, fn);
    };
    Reaction.prototype.dispose = function () {
        if (!this.isDisposed) {
            this.isDisposed = true;
            var deps = this.observing.splice(0);
            for (var i = 0, l = deps.length; i < l; i++)
                observable_1.removeObserver(deps[i], this);
        }
    };
    Reaction.prototype.getDisposer = function () {
        var r = this.dispose.bind(this);
        r.$mobx = this;
        return r;
    };
    Reaction.prototype.toString = function () {
        return "Reaction[" + this.name + "]";
    };
    return Reaction;
}());
exports.Reaction = Reaction;
/**
 * Magic number alert!
 * Defines within how many times a reaction is allowed to re-trigger itself
 * until it is assumed that this is gonna be a never ending loop...
 */
var MAX_REACTION_ITERATIONS = 100;
function runReactions() {
    if (globalstate_1.globalState.isRunningReactions === true || globalstate_1.globalState.inTransaction > 0)
        return;
    globalstate_1.globalState.isRunningReactions = true;
    var allReactions = globalstate_1.globalState.pendingReactions;
    var iterations = 0;
    // While running reactions, new reactions might be triggered.
    // Hence we work with two variables and check whether
    // we converge to no remaining reactions after a while.
    while (allReactions.length > 0) {
        if (++iterations === MAX_REACTION_ITERATIONS)
            throw new Error("Reaction doesn't converge to a stable state. Probably there is a cycle in the reactive function: " + allReactions[0].toString());
        var remainingReactions = allReactions.splice(0);
        for (var i = 0, l = remainingReactions.length; i < l; i++)
            remainingReactions[i].runReaction();
    }
    globalstate_1.globalState.isRunningReactions = false;
}
exports.runReactions = runReactions;
