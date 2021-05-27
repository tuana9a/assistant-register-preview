import fs from 'fs';
import { Request, Response } from 'express';

import { utils } from '../utils/Utils';
import { ResponseEntity } from '../models/ResponseEntity';
import { lopDangKyService } from '../services/LopDangKyService';
import { lopDangKyCsvService } from '../services/LopDangKyCsvService';

class LopDangKyView {
    async findClassesByTermAndIds(req: Request, resp: Response) {
        let ids = utils
            .reformatString(String(req.query.ids))
            .split(/\s*,\s*|\s+/)
            .map((e) => e.replace(/\D+/g, ''))
            .filter((e) => e.match(/^\d+$/))
            .map((e) => utils.fromAnyToNumber(e));
        let term = utils.reformatString(String(req.query.term));
        let type = utils.reformatString(String(req.query.type));
        resp.setHeader('Content-Type', 'application/json; charset=utf-8');

        try {
            let result = lopDangKyService.findClassesByTermAndIds(term, ids, type);
            resp.send(result);
        } catch (e) {
            resp.send(ResponseEntity.builder().code(-1).message('failed').data({}).build());
        }
    }
    async updateClasses(req: Request, resp: Response) {
        let term = utils.reformatString(String(req.query.term));
        let file = req.file;
        resp.setHeader('Content-Type', 'application/json; charset=utf-8');

        if (file && !lopDangKyService.busy) {
            let filename = file.originalname;
            let filepath = './resource/' + filename;
            fs.writeFileSync(filepath, file.buffer, { flag: 'w' });
            let classes = await lopDangKyCsvService.getClassesFromCsv_BuoiHoc(filepath);
            lopDangKyService.updateClasses(term, utils.fromMapToArray_Value(classes));
            resp.send(ResponseEntity.builder().code(1).message('executing').build());
        } else {
            resp.send(ResponseEntity.builder().code(-1).message('no file or busy').build());
        }
    }
    async updateClasses_MidExam(req: Request, resp: Response) {
        let term = utils.reformatString(String(req.query.term));
        let file = req.file;
        resp.setHeader('Content-Type', 'application/json; charset=utf-8');

        if (file && !lopDangKyService.busy) {
            let filename = file.originalname;
            let filepath = './resource/' + filename;
            fs.writeFileSync(filepath, file.buffer, { flag: 'w' });
            let classes = await lopDangKyCsvService.getClassesFromCsv_ThiGiuaKi(filepath);
            lopDangKyService.updateClasses_MidExam(term, utils.fromMapToArray_Value(classes));
            resp.send(ResponseEntity.builder().code(1).message('executing').build());
        } else {
            resp.send(ResponseEntity.builder().code(-1).message('busy or no file').build());
        }
    }
    async updateClasses_EndExam(req: Request, resp: Response) {
        let term = utils.reformatString(String(req.query.term));
        let file = req.file;
        resp.setHeader('Content-Type', 'application/json; charset=utf-8');

        if (file && !lopDangKyService.busy) {
            let filename = file.originalname;
            let filepath = './resource/' + filename;
            fs.writeFileSync(filepath, file.buffer, { flag: 'w' });
            let classes = await lopDangKyCsvService.getClassesFromCsv_ThiCuoiKi(filepath);
            lopDangKyService.updateClasses_EndExam(term, utils.fromMapToArray_Value(classes));
            resp.send(ResponseEntity.builder().code(1).message('executing').build());
        } else {
            resp.send(ResponseEntity.builder().code(-1).message('busy or no file').build());
        }
    }
    async deleteClasses(req: Request, resp: Response) {
        let term = utils.reformatString(String(req.query.term));
        resp.setHeader('Content-Type', 'application/json; charset=utf-8');
        lopDangKyService.deleteClasses(term);
        resp.send(ResponseEntity.builder().code(1).message('executing').build());
    }
    async deleteClasses_MidExam(req: Request, resp: Response) {
        let term = utils.reformatString(String(req.query.term));
        resp.setHeader('Content-Type', 'application/json; charset=utf-8');
        lopDangKyService.deleteClasses_MidExam(term);
        resp.send(ResponseEntity.builder().code(1).message('executing').build());
    }
    async deleteClasses_EndExam(req: Request, resp: Response) {
        let term = utils.reformatString(String(req.query.term));
        resp.setHeader('Content-Type', 'application/json; charset=utf-8');
        lopDangKyService.deleteClasses_EndExam(term);
        resp.send(ResponseEntity.builder().code(1).message('executing').build());
    }
}

export const lopDangKyView = new LopDangKyView();
