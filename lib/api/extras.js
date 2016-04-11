"use strict";
var simpleeventemitter_1 = require("../utils/simpleeventemitter");
var utils_1 = require("../utils/utils");
var globalstate_1 = require("../core/globalstate");
/**
    * If strict is enabled, views are not allowed to modify the state.
    * This is a recommended practice, as it makes reasoning about your application simpler.
    */
function allowStateChanges(allowStateChanges, func) {
    var prev = globalstate_1.globalState.allowStateChanges;
    globalstate_1.globalState.allowStateChanges = allowStateChanges;
    var res = func();
    globalstate_1.globalState.allowStateChanges = prev;
    return res;
}
exports.allowStateChanges = allowStateChanges;
var transitionTracker = null;
function reportTransition(node, state, changed) {
    if (changed === void 0) { changed = false; }
    if (transitionTracker)
        transitionTracker.emit({
            id: node.id,
            name: node.name + "@" + node.id,
            node: node, state: state, changed: changed
        });
}
exports.reportTransition = reportTransition;
function getDependencyTree(thing) {
    return nodeToDependencyTree(thing);
}
exports.getDependencyTree = getDependencyTree;
function nodeToDependencyTree(node) {
    var result = {
        id: node.id,
        name: node.name + "@" + node.id
    };
    if (node.observing && node.observing.length)
        result.dependencies = utils_1.unique(node.observing).map(nodeToDependencyTree);
    return result;
}
function getObserverTree(thing) {
    return nodeToObserverTree(thing);
}
exports.getObserverTree = getObserverTree;
function nodeToObserverTree(node) {
    var result = {
        id: node.id,
        name: node.name + "@" + node.id
    };
    if (node.observers && node.observers.length)
        result.observers = utils_1.unique(node.observers).map(nodeToObserverTree);
    return result;
}
function createConsoleReporter(extensive) {
    var lines = [];
    var scheduled = false;
    return function (line) {
        if (extensive || line.changed)
            lines.push(line);
        if (!scheduled) {
            scheduled = true;
            setTimeout(function () {
                console[console["table"] ? "table" : "dir"](lines);
                lines = [];
                scheduled = false;
            }, 1);
        }
    };
}
function trackTransitions(extensive, onReport) {
    if (extensive === void 0) { extensive = false; }
    if (!transitionTracker)
        transitionTracker = new simpleeventemitter_1.SimpleEventEmitter();
    var reporter = onReport
        ? function (line) {
            if (extensive || line.changed)
                onReport(line);
        }
        : createConsoleReporter(extensive);
    var disposer = transitionTracker.on(reporter);
    return utils_1.once(function () {
        disposer();
        if (transitionTracker.listeners.length === 0)
            transitionTracker = null;
    });
}
exports.trackTransitions = trackTransitions;
