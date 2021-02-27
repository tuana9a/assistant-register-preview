"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterClassView = void 0;
const fs_1 = __importDefault(require("fs"));
const RegisterClass_1 = require("../models/RegisterClass");
const csv_parser_1 = require("../utils/csv-parser");
const reformat_1 = require("../utils/reformat");
const convert_1 = require("../utils/convert");
const ResponseEntity_1 = require("../models/ResponseEntity");
var service;
class RegisterClassView {
    constructor(registerClassService) {
        service = registerClassService;
    }
    async findClassesByTermAndIds(req, resp) {
        let ids = reformat_1.reformatString(String(req.query.ids))
            .split(/\s*,\s*|\s+/)
            .map((e) => e.replace(/\D+/g, ''))
            .filter((e) => e.match(/^\d+$/))
            .map((e) => convert_1.fromAnyToNumber(e));
        let term = reformat_1.reformatString(String(req.query.term));
        let type = reformat_1.reformatString(String(req.query.type));
        resp.setHeader('Content-Type', 'application/json; charset=utf-8');
        let result = new ResponseEntity_1.ResponseEntity();
        switch (type) {
            case 'match':
                result = await service.findClassesByTermAndIds_In(term, ids);
                break;
            case 'near':
                result = await service.findClassesByTermAndIds_Near(term, ids);
                break;
        }
        resp.send(result);
    }
    async updateClasses(req, resp) {
        let term = reformat_1.reformatString(String(req.query.term));
        let file = req.file;
        resp.setHeader('Content-Type', 'application/json; charset=utf-8');
        let result = { success: true, body: 'working on it' };
        if (file) {
            let filename = file.originalname;
            let filepath = './resource/' + filename;
            fs_1.default.writeFileSync(filepath, file.buffer, { flag: 'w' });
            let classes = new Map();
            await csv_parser_1.readCsvAsync(filepath, (row) => {
                try {
                    let maLop = convert_1.fromAnyToNumber(reformat_1.reformatString(row['#maLop']));
                    let buoiHoc = new RegisterClass_1.LopHoc.BuoiHoc();
                    buoiHoc.name = reformat_1.reformatString(row['#buoiHocSo']);
                    buoiHoc.thuHoc = reformat_1.reformatString(row['#thuHoc']);
                    buoiHoc.phongHoc = reformat_1.reformatString(row['#phongHoc']);
                    buoiHoc.thoiGianHoc = reformat_1.reformatString(row['#thoiGianHoc']);
                    buoiHoc.tuanHoc = reformat_1.reformatString(row['#tuanHoc']);
                    buoiHoc._timestamp = Date.now();
                    let lopHoc = new RegisterClass_1.LopHoc();
                    lopHoc.maLop = maLop;
                    lopHoc.maLopKem = convert_1.fromAnyToNumber(reformat_1.reformatString(row['#maLopKem']));
                    lopHoc.loaiLop = reformat_1.reformatString(row['#loaiLop']);
                    lopHoc.maHocPhan = reformat_1.reformatString(row['#maHocPhan']);
                    lopHoc.tenHocPhan = reformat_1.reformatString(row['#tenHocPhan']);
                    lopHoc.ghiChu = reformat_1.reformatString(row['#ghiChu']);
                    lopHoc.addBuoiHoc(buoiHoc);
                    if (classes.has(maLop)) {
                        classes.get(maLop).addBuoiHoc(buoiHoc);
                    }
                    else {
                        classes.set(maLop, lopHoc);
                    }
                }
                catch (ignored) { }
            });
            service.updateClasses(term, convert_1.fromMapToArray_Value(classes));
        }
        else {
            result.body = 'no file';
        }
        resp.send(result);
    }
    async updateClasses_MidExam(req, resp) {
        let term = reformat_1.reformatString(String(req.query.term));
        let file = req.file;
        resp.setHeader('Content-Type', 'application/json; charset=utf-8');
        let result = { success: true, body: 'working on it' };
        if (file) {
            let filename = file.originalname;
            let filepath = './resource/' + filename;
            fs_1.default.writeFileSync(filepath, file.buffer, { flag: 'w' });
            let classes = new Map();
            await csv_parser_1.readCsvAsync(filepath, (row) => {
                try {
                    let maLop = convert_1.fromAnyToNumber(reformat_1.reformatString(row['#maLop']));
                    let nhomThi = new RegisterClass_1.LopHoc.NhomThi();
                    nhomThi.name = reformat_1.reformatString(row['#tenNhom']);
                    nhomThi.thuThi = reformat_1.reformatString(row['#thuThi']);
                    nhomThi.kipThi = reformat_1.reformatString(row['#kipThi']);
                    nhomThi.ngayThi = reformat_1.reformatString(row['#ngayThi']);
                    nhomThi.tuanThi = reformat_1.reformatString(row['#tuanThi']);
                    nhomThi.phongThi = reformat_1.reformatString(row['#phongThi']);
                    nhomThi._timestamp = Date.now();
                    let lopHoc = new RegisterClass_1.LopHoc();
                    lopHoc.maLop = maLop;
                    lopHoc.addThiGiuaKi(nhomThi);
                    if (classes.has(maLop)) {
                        classes.get(maLop).addThiGiuaKi(nhomThi);
                    }
                    else {
                        classes.set(maLop, lopHoc);
                    }
                }
                catch (ignored) { }
            });
            service.updateClasses_MidExam(term, convert_1.fromMapToArray_Value(classes));
        }
        else {
            result.body = 'no file';
        }
        resp.send(result);
    }
    async updateClasses_EndExam(req, resp) {
        let term = reformat_1.reformatString(String(req.query.term));
        let file = req.file;
        resp.setHeader('Content-Type', 'application/json; charset=utf-8');
        let result = { success: true, body: 'working on it' };
        if (file) {
            let filename = file.originalname;
            let filepath = './resource/' + filename;
            fs_1.default.writeFileSync(filepath, file.buffer, { flag: 'w' });
            let classes = new Map();
            await csv_parser_1.readCsvAsync(filepath, (row) => {
                try {
                    let maLop = convert_1.fromAnyToNumber(reformat_1.reformatString(row['#maLop']));
                    let nhomThi = new RegisterClass_1.LopHoc.NhomThi();
                    nhomThi.name = reformat_1.reformatString(row['#tenNhom']);
                    nhomThi.thuThi = reformat_1.reformatString(row['#thuThi']);
                    nhomThi.kipThi = reformat_1.reformatString(row['#kipThi']);
                    nhomThi.ngayThi = reformat_1.reformatString(row['#ngayThi']);
                    nhomThi.tuanThi = reformat_1.reformatString(row['#tuanThi']);
                    nhomThi.phongThi = reformat_1.reformatString(row['#phongThi']);
                    nhomThi._timestamp = Date.now();
                    let lopHoc = new RegisterClass_1.LopHoc();
                    lopHoc.maLop = maLop;
                    lopHoc.addThiCuoiKi(nhomThi);
                    if (classes.has(maLop)) {
                        classes.get(maLop).addThiCuoiKi(nhomThi);
                    }
                    else {
                        classes.set(maLop, lopHoc);
                    }
                }
                catch (ignored) { }
            });
            service.updateClasses_EndExam(term, convert_1.fromMapToArray_Value(classes));
        }
        else {
            result.body = 'no file';
        }
        resp.send(result);
    }
    async deleteClasses(req, resp) {
        let term = reformat_1.reformatString(String(req.query.term));
        resp.setHeader('Content-Type', 'application/json; charset=utf-8');
        let result = { success: true, body: 'working on it' };
        service.deleteClasses(term);
        resp.send(result);
    }
    async deleteClasses_MidExam(req, resp) {
        let term = reformat_1.reformatString(String(req.query.term));
        resp.setHeader('Content-Type', 'application/json; charset=utf-8');
        let result = { success: true, body: 'working on it' };
        service.deleteClasses_MidExam(term);
        resp.send(result);
    }
    async deleteClasses_EndExam(req, resp) {
        let term = reformat_1.reformatString(String(req.query.term));
        resp.setHeader('Content-Type', 'application/json; charset=utf-8');
        let result = { success: true, body: 'working on it' };
        service.deleteClasses_EndExam(term);
        resp.send(result);
    }
}
exports.RegisterClassView = RegisterClassView;
//# sourceMappingURL=RegisterClassView.js.map