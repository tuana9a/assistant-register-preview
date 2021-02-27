import fs from 'fs';
import { Request, Response } from 'express';

import { RegisterClassService } from '../services/RegisterClassService';
import { LopHoc } from '../models/RegisterClass';

import { readCsvAsync } from '../utils/csv-parser';
import { reformatString } from '../utils/reformat';
import { fromAnyToNumber, fromMapToArray_Value } from '../utils/convert';
import { ResponseEntity } from '../models/ResponseEntity';

var service: RegisterClassService;

export class RegisterClassView {
    constructor(registerClassService: RegisterClassService) {
        service = registerClassService;
    }

    async findClassesByTermAndIds(req: Request, resp: Response) {
        let ids = reformatString(String(req.query.ids))
            .split(/\s*,\s*|\s+/)
            .map((e) => e.replace(/\D+/g, ''))
            .filter((e) => e.match(/^\d+$/))
            .map((e) => fromAnyToNumber(e));
        let term = reformatString(String(req.query.term));
        let type = reformatString(String(req.query.type));

        resp.setHeader('Content-Type', 'application/json; charset=utf-8');
        let result = new ResponseEntity();
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

    async updateClasses(req: Request, resp: Response) {
        let term = reformatString(String(req.query.term));
        let file = req.file;
        resp.setHeader('Content-Type', 'application/json; charset=utf-8');

        let result = { success: true, body: 'working on it' };
        if (file) {
            let filename = file.originalname;
            let filepath = './resource/' + filename;
            fs.writeFileSync(filepath, file.buffer, { flag: 'w' });

            let classes = new Map<number, LopHoc>();
            await readCsvAsync(filepath, (row) => {
                try {
                    let maLop = fromAnyToNumber(reformatString(row['#maLop']));

                    let buoiHoc = new LopHoc.BuoiHoc();
                    buoiHoc.name = reformatString(row['#buoiHocSo']);
                    buoiHoc.thuHoc = reformatString(row['#thuHoc']);
                    buoiHoc.phongHoc = reformatString(row['#phongHoc']);
                    buoiHoc.thoiGianHoc = reformatString(row['#thoiGianHoc']);
                    buoiHoc.tuanHoc = reformatString(row['#tuanHoc']);
                    buoiHoc._timestamp = Date.now();

                    let lopHoc = new LopHoc();
                    lopHoc.maLop = maLop;
                    lopHoc.maLopKem = fromAnyToNumber(reformatString(row['#maLopKem']));
                    lopHoc.loaiLop = reformatString(row['#loaiLop']);
                    lopHoc.maHocPhan = reformatString(row['#maHocPhan']);
                    lopHoc.tenHocPhan = reformatString(row['#tenHocPhan']);
                    lopHoc.ghiChu = reformatString(row['#ghiChu']);
                    lopHoc.addBuoiHoc(buoiHoc);

                    if (classes.has(maLop)) {
                        classes.get(maLop).addBuoiHoc(buoiHoc);
                    } else {
                        classes.set(maLop, lopHoc);
                    }
                } catch (ignored) {}
            });

            service.updateClasses(term, fromMapToArray_Value(classes));
        } else {
            result.body = 'no file';
        }

        resp.send(result);
    }
    async updateClasses_MidExam(req: Request, resp: Response) {
        let term = reformatString(String(req.query.term));
        let file = req.file;
        resp.setHeader('Content-Type', 'application/json; charset=utf-8');

        let result = { success: true, body: 'working on it' };
        if (file) {
            let filename = file.originalname;
            let filepath = './resource/' + filename;
            fs.writeFileSync(filepath, file.buffer, { flag: 'w' });

            let classes = new Map<number, LopHoc>();
            await readCsvAsync(filepath, (row) => {
                try {
                    let maLop = fromAnyToNumber(reformatString(row['#maLop']));

                    let nhomThi = new LopHoc.NhomThi();
                    nhomThi.name = reformatString(row['#tenNhom']);
                    nhomThi.thuThi = reformatString(row['#thuThi']);
                    nhomThi.kipThi = reformatString(row['#kipThi']);
                    nhomThi.ngayThi = reformatString(row['#ngayThi']);
                    nhomThi.tuanThi = reformatString(row['#tuanThi']);
                    nhomThi.phongThi = reformatString(row['#phongThi']);
                    nhomThi._timestamp = Date.now();

                    let lopHoc = new LopHoc();
                    lopHoc.maLop = maLop;
                    lopHoc.addThiGiuaKi(nhomThi);

                    if (classes.has(maLop)) {
                        classes.get(maLop).addThiGiuaKi(nhomThi);
                    } else {
                        classes.set(maLop, lopHoc);
                    }
                } catch (ignored) {}
            });
            service.updateClasses_MidExam(term, fromMapToArray_Value(classes));
        } else {
            result.body = 'no file';
        }

        resp.send(result);
    }
    async updateClasses_EndExam(req: Request, resp: Response) {
        let term = reformatString(String(req.query.term));
        let file = req.file;
        resp.setHeader('Content-Type', 'application/json; charset=utf-8');

        let result = { success: true, body: 'working on it' };
        if (file) {
            let filename = file.originalname;
            let filepath = './resource/' + filename;
            fs.writeFileSync(filepath, file.buffer, { flag: 'w' });

            let classes = new Map<number, LopHoc>();
            await readCsvAsync(filepath, (row) => {
                try {
                    let maLop = fromAnyToNumber(reformatString(row['#maLop']));

                    let nhomThi = new LopHoc.NhomThi();
                    nhomThi.name = reformatString(row['#tenNhom']);
                    nhomThi.thuThi = reformatString(row['#thuThi']);
                    nhomThi.kipThi = reformatString(row['#kipThi']);
                    nhomThi.ngayThi = reformatString(row['#ngayThi']);
                    nhomThi.tuanThi = reformatString(row['#tuanThi']);
                    nhomThi.phongThi = reformatString(row['#phongThi']);
                    nhomThi._timestamp = Date.now();

                    let lopHoc = new LopHoc();
                    lopHoc.maLop = maLop;
                    lopHoc.addThiCuoiKi(nhomThi);

                    if (classes.has(maLop)) {
                        classes.get(maLop).addThiCuoiKi(nhomThi);
                    } else {
                        classes.set(maLop, lopHoc);
                    }
                } catch (ignored) {}
            });

            service.updateClasses_EndExam(term, fromMapToArray_Value(classes));
        } else {
            result.body = 'no file';
        }

        resp.send(result);
    }

    async deleteClasses(req: Request, resp: Response) {
        let term = reformatString(String(req.query.term));
        resp.setHeader('Content-Type', 'application/json; charset=utf-8');

        let result = { success: true, body: 'working on it' };
        service.deleteClasses(term);

        resp.send(result);
    }
    async deleteClasses_MidExam(req: Request, resp: Response) {
        let term = reformatString(String(req.query.term));
        resp.setHeader('Content-Type', 'application/json; charset=utf-8');

        let result = { success: true, body: 'working on it' };
        service.deleteClasses_MidExam(term);

        resp.send(result);
    }
    async deleteClasses_EndExam(req: Request, resp: Response) {
        let term = reformatString(String(req.query.term));
        resp.setHeader('Content-Type', 'application/json; charset=utf-8');

        let result = { success: true, body: 'working on it' };
        service.deleteClasses_EndExam(term);

        resp.send(result);
    }
}
