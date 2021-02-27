"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reformatString = void 0;
function reformatString(input) {
    try {
        let result = input.trim().replace(/\s{2,}/g, ' ');
        return result;
    }
    catch (err) {
        return '';
    }
}
exports.reformatString = reformatString;
//# sourceMappingURL=reformat.js.map