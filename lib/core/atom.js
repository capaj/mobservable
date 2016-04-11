"use strict";
var observable_1 = require("./observable");
var utils_1 = require("../utils/utils");
var globalstate_1 = require("./globalstate");
var extras_1 = require("../api/extras");
var reaction_1 = require("./reaction");
/**
 * Used by the transaction manager to signal observers that an atom is ready as soon as the transaction has ended.
 */
function propagateAtomReady(atom) {
    utils_1.invariant(atom.isDirty, "atom not dirty");
    atom.isDirty = false;
    extras_1.reportTransition(atom, "READY", true);
    observable_1.propagateReadiness(atom, true);
}
exports.propagateAtomReady = propagateAtomReady;
/**
 * Anything that can be used to _store_ state is an Atom in mobx. Atom's have two important jobs
 *
 * 1) detect when they are being _used_ and report this (using reportObserved). This allows mobx to make the connection between running functions and the data they used
 * 2) they should notify mobx whenever they have _changed_. This way mobx can re-run any functions (derivations) that are using this atom.
 */
var Atom = (function () {
    /**
     * Create a new atom. For debugging purposes it is recommended to give it a name.
     * The onBecomeObserved and onBecomeUnobserved callbacks can be used for resource management.
     */
    function Atom(name, onBecomeObserved, onBecomeUnobserved) {
        if (name === void 0) { name = "Atom"; }
        if (onBecomeObserved === void 0) { onBecomeObserved = utils_1.noop; }
        if (onBecomeUnobserved === void 0) { onBecomeUnobserved = utils_1.noop; }
        this.name = name;
        this.onBecomeObserved = onBecomeObserved;
        this.onBecomeUnobserved = onBecomeUnobserved;
        this.id = globalstate_1.getNextId();
        this.isDirty = false;
        this.staleObservers = [];
        this.observers = [];
    }
    /**
     * Invoke this method to notify mobx that your atom has been used somehow.
     */
    Atom.prototype.reportObserved = function () {
        observable_1.reportObserved(this);
    };
    /**
     * Invoke this method _after_ this method has changed to signal mobx that all its observers should invalidate.
     */
    Atom.prototype.reportChanged = function () {
        if (!this.isDirty) {
            this.reportStale();
            this.reportReady();
        }
    };
    Atom.prototype.reportStale = function () {
        if (!this.isDirty) {
            this.isDirty = true;
            extras_1.reportTransition(this, "STALE");
            observable_1.propagateStaleness(this);
        }
    };
    Atom.prototype.reportReady = function () {
        utils_1.invariant(this.isDirty, "atom not dirty");
        if (globalstate_1.globalState.inTransaction > 0)
            globalstate_1.globalState.changedAtoms.push(this);
        else {
            propagateAtomReady(this);
            reaction_1.runReactions();
        }
    };
    Atom.prototype.toString = function () {
        return this.name + "@" + this.id;
    };
    return Atom;
}());
exports.Atom = Atom;
