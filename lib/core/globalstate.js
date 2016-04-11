"use strict";
var MobXGlobals = (function () {
    function MobXGlobals() {
        /**
         * MobXGlobals version.
         * MobX compatiblity with other versions loaded in memory as long as this version matches.
         * It indicates that the global state still stores similar information
         */
        this.version = 1;
        /**
         * Stack of currently running derivations
         */
        this.derivationStack = [];
        /**
         * 'guid' for general purpose. Mostly debugging.
         */
        this.mobxGuid = 0;
        /**
         * Are we in a transaction block? (and how many of them)
         */
        this.inTransaction = 0;
        /**
         * Are we in an untracked block? (and how many of them)
         */
        this.inUntracked = 0;
        /**
         * Are we currently running reactions?
         * Reactions are run after derivations using a trampoline.
         */
        this.isRunningReactions = false;
        /**
         * List of observables that have changed in a transaction.
         * After completing the transaction(s) these atoms will notify their observers.
         */
        this.changedAtoms = [];
        /**
         * List of scheduled, not yet executed, reactions.
         */
        this.pendingReactions = [];
        /**
         * Is it allowed to change observables at this point?
         * In general, MobX doesn't allow that when running computations and React.render.
         * To ensure that those functions stay pure.
         */
        this.allowStateChanges = true;
        /**
         * Used by createTransformer to detect that the global state has been reset.
         */
        this.resetId = 0;
    }
    return MobXGlobals;
}());
exports.MobXGlobals = MobXGlobals;
exports.globalState = (function () {
    var res = new MobXGlobals();
    /**
     * Backward compatibility check
     */
    if (global.__mobservableTrackingStack || global.__mobservableViewStack)
        throw new Error("[mobx] An incompatible version of mobservable is already loaded.");
    if (global.__mobxGlobal && global.__mobxGlobal.version !== res.version)
        throw new Error("[mobx] An incompatible version of mobx is already loaded.");
    if (global.__mobxGlobal)
        return global.__mobxGlobal;
    return global.__mobxGlobal = res;
})();
function getNextId() {
    return ++exports.globalState.mobxGuid;
}
exports.getNextId = getNextId;
function registerGlobals() {
    // no-op to make explicit why this file is loaded
}
exports.registerGlobals = registerGlobals;
/**
 * For testing purposes only; this will break the internal state of existing observables,
 * but can be used to get back at a stable state after throwing errors
 */
function resetGlobalState() {
    exports.globalState.resetId++;
    var defaultGlobals = new MobXGlobals();
    for (var key in defaultGlobals)
        if (key !== "mobxGuid" && key !== "resetId")
            exports.globalState[key] = defaultGlobals[key];
}
exports.resetGlobalState = resetGlobalState;
