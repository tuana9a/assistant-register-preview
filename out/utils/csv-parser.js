"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.readCsvAsync = void 0;
const fs_1 = __importDefault(require("fs"));
const csv_parser_1 = __importDefault(require("csv-parser"));
async function readCsvAsync(path, handler = (row) => { }) {
    return new Promise((resolve, reject) => {
        fs_1.default.createReadStream(path).pipe(csv_parser_1.default()).on('data', handler).on('end', resolve).on('error', reject);
    });
}
exports.readCsvAsync = readCsvAsync;
//# sourceMappingURL=csv-parser.js.map