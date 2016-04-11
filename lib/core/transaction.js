"use strict";
var globalstate_1 = require("./globalstate");
var atom_1 = require("./atom");
var reaction_1 = require("./reaction");
/**
 * During a transaction no views are updated until the end of the transaction.
 * The transaction will be run synchronously nonetheless.
 * @param action a function that updates some reactive state
 * @returns any value that was returned by the 'action' parameter.
 */
function transaction(action, thisArg) {
    globalstate_1.globalState.inTransaction += 1;
    var res = action.call(thisArg);
    if (--globalstate_1.globalState.inTransaction === 0) {
        var values = globalstate_1.globalState.changedAtoms.splice(0);
        for (var i = 0, l = values.length; i < l; i++)
            atom_1.propagateAtomReady(values[i]);
        reaction_1.runReactions();
    }
    return res;
}
exports.transaction = transaction;
