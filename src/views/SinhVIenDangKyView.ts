import { Request, Response } from 'express';
import { ResponseEntity } from '../models/ResponseEntity';
import { SinhVienDangKy } from '../models/SinhVienDangKy';

import { sinhVienDangKyService } from '../services/SinhVienDangKyService';
import { utils } from '../utils/Utils';

class SinhVienDangKyView {
    async findStudentByTermAndMssv(req: Request, resp: Response) {
        let mssv = utils.fromAnyToNumber(utils.reformatString(String(req.query.mssv)));
        let term = utils.reformatString(String(req.query.term));

        resp.setHeader('Content-Type', 'application/json; charset=utf-8');
        try {
            let result = await sinhVienDangKyService.findStudentByTermAndMssv(term, mssv);
            resp.send(result);
        } catch (e) {
            resp.send(ResponseEntity.builder().code(-1).message('failed').data(e).build());
        }
    }
    async crawlManyStudents(req: Request, resp: Response) {
        let term = utils.reformatString(String(req.query.term));
        let start = utils.fromAnyToNumber(utils.reformatString(String(req.query.start)));
        let end = utils.fromAnyToNumber(utils.reformatString(String(req.query.end)));
        let cookie = utils.reformatString(String(req.body.cookie));

        if (!sinhVienDangKyService.busy) {
            sinhVienDangKyService.crawlManyStudents(term, start, end, cookie);
            resp.send(ResponseEntity.builder().code(1).message('executing').build());
        } else {
            resp.send(ResponseEntity.builder().code(-1).message('busy').build());
        }
    }
}

export const sinhVienDangKyView = new SinhVienDangKyView();
