"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fromAnyToNumber = exports.fromSetToArray = exports.fromMapToArray_Value = void 0;
function fromMapToArray_Value(map) {
    return Array.from(map, ([_key, value]) => value);
}
exports.fromMapToArray_Value = fromMapToArray_Value;
function fromSetToArray(set) {
    return Array.from(set);
}
exports.fromSetToArray = fromSetToArray;
function fromAnyToNumber(input) {
    try {
        let value = parseInt(input);
        return value ? value : 0;
    }
    catch (err) {
        return 0;
    }
}
exports.fromAnyToNumber = fromAnyToNumber;
//# sourceMappingURL=convert.js.map