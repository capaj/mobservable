/**
 * (c) Michel Weststrate 2015 - 2016
 * MIT Licensed
 *
 * Welcome to the mobx sources! To get an global overview of how MobX internally works,
 * this is a good place to start:
 * https://medium.com/@mweststrate/becoming-fully-reactive-an-in-depth-explanation-of-mobservable-55995262a254#.xvbh6qd74
 *
 * Source folders:
 * ===============
 *
 * - api/     Most of the public static methods exposed by the module can be found here.
 * - core/    Implementation of the MobX algorithm; atoms, derivations, reactions, dependency trees, optimizations. Cool stuff can be found here.
 * - types/   All the magic that is need to have observable objects, arrays and values is in this folder. Including the modifiers like `asFlat`.
 * - utils/   Utility stuff.
 *
 */
"use strict";
var globalstate_1 = require("./core/globalstate");
globalstate_1.registerGlobals();
var simpleeventemitter_1 = require("./utils/simpleeventemitter");
exports.SimpleEventEmitter = simpleeventemitter_1.SimpleEventEmitter;
var observable_1 = require("./core/observable");
exports.untracked = observable_1.untracked;
var modifiers_1 = require("./types/modifiers");
exports.asReference = modifiers_1.asReference;
exports.asFlat = modifiers_1.asFlat;
exports.asStructure = modifiers_1.asStructure;
var observableobject_1 = require("./types/observableobject");
exports.isObservableObject = observableobject_1.isObservableObject;
var observablearray_1 = require("./types/observablearray");
exports.isObservableArray = observablearray_1.isObservableArray;
exports.fastArray = observablearray_1.fastArray;
var observablemap_1 = require("./types/observablemap");
exports.ObservableMap = observablemap_1.ObservableMap;
exports.isObservableMap = observablemap_1.isObservableMap;
exports.map = observablemap_1.map;
var observable_2 = require("./api/observable");
exports.observable = observable_2.observable;
var computeddecorator_1 = require("./api/computeddecorator");
exports.computed = computeddecorator_1.computed;
var isobservable_1 = require("./api/isobservable");
exports.isObservable = isobservable_1.isObservable;
var extendobservable_1 = require("./api/extendobservable");
exports.extendObservable = extendobservable_1.extendObservable;
var observe_1 = require("./api/observe");
exports.observe = observe_1.observe;
var autorun_1 = require("./api/autorun");
exports.autorun = autorun_1.autorun;
exports.autorunAsync = autorun_1.autorunAsync;
exports.autorunUntil = autorun_1.autorunUntil;
exports.when = autorun_1.when;
var expr_1 = require("./api/expr");
exports.expr = expr_1.expr;
var tojson_1 = require("./api/tojson");
exports.toJSON = tojson_1.toJSON;
var createtransformer_1 = require("./api/createtransformer");
exports.createTransformer = createtransformer_1.createTransformer;
var transaction_1 = require("./core/transaction");
exports.transaction = transaction_1.transaction;
var reaction_1 = require("./core/reaction");
exports.Reaction = reaction_1.Reaction;
var atom_1 = require("./core/atom");
exports.Atom = atom_1.Atom;
var globalstate_2 = require("./core/globalstate");
var utils_1 = require("./utils/utils");
exports._ = {
    quickDiff: utils_1.quickDiff,
    resetGlobalState: globalstate_2.resetGlobalState
};
var extras_1 = require("./api/extras");
var derivation_1 = require("./core/derivation");
exports.extras = {
    allowStateChanges: extras_1.allowStateChanges,
    getDependencyTree: extras_1.getDependencyTree,
    getObserverTree: extras_1.getObserverTree,
    isComputingDerivation: derivation_1.isComputingDerivation,
    resetGlobalState: globalstate_2.resetGlobalState,
    trackTransitions: extras_1.trackTransitions
};
