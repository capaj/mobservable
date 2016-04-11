"use strict";
var observablearray_1 = require("../types/observablearray");
var observablemap_1 = require("../types/observablemap");
var observablevalue_1 = require("../types/observablevalue");
var isobservable_1 = require("../api/isobservable");
var utils_1 = require("../utils/utils");
/**
    * Basically, a deep clone, so that no reactive property will exist anymore.
    */
function toJSON(source, detectCycles, __alreadySeen) {
    if (detectCycles === void 0) { detectCycles = true; }
    if (__alreadySeen === void 0) { __alreadySeen = null; }
    // optimization: using ES6 map would be more efficient!
    function cache(value) {
        if (detectCycles)
            __alreadySeen.push([source, value]);
        return value;
    }
    if (detectCycles && __alreadySeen === null)
        __alreadySeen = [];
    if (detectCycles && source !== null && typeof source === "object") {
        for (var i = 0, l = __alreadySeen.length; i < l; i++)
            if (__alreadySeen[i][0] === source)
                return __alreadySeen[i][1];
    }
    if (!source)
        return source;
    if (Array.isArray(source) || source instanceof observablearray_1.ObservableArray) {
        var res = cache([]);
        res.push.apply(res, source.map(function (value) { return toJSON(value, detectCycles, __alreadySeen); }));
        return res;
    }
    if (source instanceof observablemap_1.ObservableMap) {
        var res_1 = cache({});
        source.forEach(function (value, key) { return res_1[key] = toJSON(value, detectCycles, __alreadySeen); });
        return res_1;
    }
    if (typeof source === "object" && utils_1.isPlainObject(source)) {
        var res = cache({});
        for (var key in source)
            if (source.hasOwnProperty(key))
                res[key] = toJSON(source[key], detectCycles, __alreadySeen);
        return res;
    }
    if (isobservable_1.isObservable(source) && source.$mobx instanceof observablevalue_1.ObservableValue)
        return toJSON(source(), detectCycles, __alreadySeen);
    return source;
}
exports.toJSON = toJSON;
