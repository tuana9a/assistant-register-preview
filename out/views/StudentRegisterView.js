"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudentRegisterView = void 0;
const convert_1 = require("../utils/convert");
const reformat_1 = require("../utils/reformat");
var service;
class StudentRegisterView {
    constructor(studentRegisterService) {
        service = studentRegisterService;
    }
    async findStudentByTermAndMssv(req, resp) {
        let mssv = convert_1.fromAnyToNumber(reformat_1.reformatString(String(req.query.mssv)));
        let term = reformat_1.reformatString(String(req.query.term));
        resp.setHeader('Content-Type', 'application/json; charset=utf-8');
        let result = await service.findStudentByTermAndMssv(term, mssv);
        resp.send(result);
    }
    async crawlManyStudents(req, resp) {
        let term = reformat_1.reformatString(String(req.query.term));
        let start = convert_1.fromAnyToNumber(reformat_1.reformatString(String(req.query.start)));
        let end = convert_1.fromAnyToNumber(reformat_1.reformatString(String(req.query.end)));
        let cookie = reformat_1.reformatString(String(req.body.cookie));
        service.crawlManyStudents(term, start, end, cookie);
        resp.send({ success: true, body: 'executing' });
    }
}
exports.StudentRegisterView = StudentRegisterView;
//# sourceMappingURL=StudentRegisterView.js.map