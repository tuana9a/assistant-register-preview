import { Request, Response } from 'express';
import { ResponseEntity } from '../models/ResponseEntity';
import { responseUtils } from '../utils/ResponseUtils';

import { sinhVienDangKyService } from '../services/SinhVienDangKyService';
import { utils } from '../utils/Utils';

class SinhVienDangKyView {
    async findStudentByTermAndMssv(req: Request, resp: Response) {
        try {
            let mssv = utils.fromAnyToNumber(utils.reformatString(String(req.query.mssv)));
            let term = utils.reformatString(String(req.query.term));

            let result = await sinhVienDangKyService.findStudentByTermAndMssv(term, mssv);
            responseUtils.send(resp, ResponseEntity.builder().code(1).message('success').data(result).build());
        } catch (e) {
            responseUtils.send(resp, ResponseEntity.builder().code(-1).message('failed').data(e).build());
        }
    }
    async crawlStudents(req: Request, resp: Response) {
        try {
            let term = utils.reformatString(String(req.query.term));
            let start = utils.fromAnyToNumber(utils.reformatString(String(req.query.start)));
            let end = utils.fromAnyToNumber(utils.reformatString(String(req.query.end)));
            let cookie = utils.reformatString(String(req.body.cookie));

            if (!sinhVienDangKyService.busy) {
                sinhVienDangKyService.crawlStudents(term, start, end, cookie);
                responseUtils.send(resp, ResponseEntity.builder().code(1).message('executing').build());
            } else {
                responseUtils.send(resp, ResponseEntity.builder().code(-1).message('busy').build());
            }
        } catch (e) {
            responseUtils.send(resp, ResponseEntity.builder().code(-1).message('failed').data(e).build());
        }
    }
}

export const sinhVienDangKyView = new SinhVienDangKyView();
