"use strict";
var utils_1 = require("../utils/utils");
var modifiers_1 = require("../types/modifiers");
var reaction_1 = require("../core/reaction");
/**
 * Creates a reactive view and keeps it alive, so that the view is always
 * updated if one of the dependencies changes, even when the view is not further used by something else.
 * @param view The reactive view
 * @param scope (optional)
 * @returns disposer function, which can be used to stop the view from being updated in the future.
 */
function autorun(view, scope) {
    modifiers_1.assertUnwrapped(view, "autorun methods cannot have modifiers");
    utils_1.invariant(typeof view === "function", "autorun expects a function");
    utils_1.invariant(view.length === 0, "autorun expects a function without arguments");
    if (scope)
        view = view.bind(scope);
    var reaction = new reaction_1.Reaction(view.name || "Autorun", function () {
        this.track(view);
    });
    reaction.schedule();
    return reaction.getDisposer();
}
exports.autorun = autorun;
/**
 * Similar to 'observer', observes the given predicate until it returns true.
 * Once it returns true, the 'effect' function is invoked an the observation is cancelled.
 * @param predicate
 * @param effect
 * @param scope (optional)
 * @returns disposer function to prematurely end the observer.
 */
function when(predicate, effect, scope) {
    var disposeImmediately = false;
    var disposer = autorun(function () {
        if (predicate.call(scope)) {
            if (disposer)
                disposer();
            else
                disposeImmediately = true;
            effect.call(scope);
        }
    });
    if (disposeImmediately)
        disposer();
    return disposer;
}
exports.when = when;
function autorunUntil(predicate, effect, scope) {
    utils_1.deprecated("`autorunUntil` is deprecated, please use `when`.");
    return when.apply(null, arguments);
}
exports.autorunUntil = autorunUntil;
function autorunAsync(func, delay, scope) {
    if (delay === void 0) { delay = 1; }
    if (scope)
        func = func.bind(scope);
    var isScheduled = false;
    var r = new reaction_1.Reaction(func.name || "AutorunAsync", function () {
        if (!isScheduled) {
            isScheduled = true;
            setTimeout(function () {
                isScheduled = false;
                if (!r.isDisposed)
                    r.track(func);
            }, delay);
        }
    });
    r.schedule();
    return r.getDisposer();
}
exports.autorunAsync = autorunAsync;
