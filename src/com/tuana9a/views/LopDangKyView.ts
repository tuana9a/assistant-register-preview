import fs from 'fs';
import { Request, Response } from 'express';

import { utils } from '../utils/Utils';
import { ResponseEntity } from '../models/ResponseEntity';
import { lopDangKyService } from '../services/LopDangKyService';
import { csvService } from '../services/CsvService';
import { responseUtils } from '../utils/ResponseUtils';

class LopDangKyView {
    async findClassesByTermAndIds(req: Request, resp: Response) {
        try {
            let ids = utils
                .reformatString(String(req.query.ids))
                .split(/\s*,\s*|\s+/)
                .map((e) => e.replace(/\D+/g, ''))
                .filter((e) => e.match(/^\d+$/))
                .map((e) => utils.fromAnyToNumber(e));
            let term = utils.reformatString(String(req.query.term));
            let type = utils.reformatString(String(req.query.type));
            let result = await lopDangKyService.findClassesByTermAndIds(term, ids, type);
            responseUtils.send(resp, ResponseEntity.builder().code(1).message('success').data(result).build());
        } catch (e) {
            responseUtils.send(resp, ResponseEntity.builder().code(-1).message('failed').data(e).build());
        }
    }
    async updateClasses(req: Request, resp: Response) {
        try {
            let term = utils.reformatString(String(req.query.term));
            let file = req.file;

            if (file && !lopDangKyService.busy) {
                let filename = file.originalname;
                let filepath = './resource/' + filename;
                fs.writeFileSync(filepath, file.buffer, { flag: 'w' });
                let classes = await csvService.getClasses_BuoiHoc(filepath);
                lopDangKyService.updateClasses(term, utils.fromMapToArray_Value(classes));
                responseUtils.send(resp, ResponseEntity.builder().code(1).message('executing').build());
            } else {
                responseUtils.send(resp, ResponseEntity.builder().code(-1).message('no file or busy').build());
            }
        } catch (e) {
            responseUtils.send(resp, ResponseEntity.builder().code(-1).message('failed').data(e).build());
        }
    }
    async updateClasses_MidExam(req: Request, resp: Response) {
        try {
            let term = utils.reformatString(String(req.query.term));
            let file = req.file;

            if (file && !lopDangKyService.busy) {
                let filename = file.originalname;
                let filepath = './resource/' + filename;
                fs.writeFileSync(filepath, file.buffer, { flag: 'w' });
                let classes = await csvService.getClasses_ThiGiuaKi(filepath);
                lopDangKyService.updateClasses_MidExam(term, utils.fromMapToArray_Value(classes));
                responseUtils.send(resp, ResponseEntity.builder().code(1).message('executing').build());
            } else {
                responseUtils.send(resp, ResponseEntity.builder().code(-1).message('busy or no file').build());
            }
        } catch (e) {
            responseUtils.send(resp, ResponseEntity.builder().code(-1).message('failed').data(e).build());
        }
    }
    async updateClasses_EndExam(req: Request, resp: Response) {
        try {
            let term = utils.reformatString(String(req.query.term));
            let file = req.file;

            if (file && !lopDangKyService.busy) {
                let filename = file.originalname;
                let filepath = './resource/' + filename;
                fs.writeFileSync(filepath, file.buffer, { flag: 'w' });
                let classes = await csvService.getClasses_ThiCuoiKi(filepath);
                lopDangKyService.updateClasses_EndExam(term, utils.fromMapToArray_Value(classes));
                responseUtils.send(resp, ResponseEntity.builder().code(1).message('executing').build());
            } else {
                responseUtils.send(resp, ResponseEntity.builder().code(-1).message('busy or no file').build());
            }
        } catch (e) {
            responseUtils.send(resp, ResponseEntity.builder().code(-1).message('failed').data(e).build());
        }
    }
    async deleteClasses(req: Request, resp: Response) {
        try {
            let term = utils.reformatString(String(req.query.term));
            lopDangKyService.deleteClasses(term);
            responseUtils.send(resp, ResponseEntity.builder().code(1).message('executing').build());
        } catch (e) {
            responseUtils.send(resp, ResponseEntity.builder().code(-1).message('failed').data(e).build());
        }
    }
    async deleteClasses_MidExam(req: Request, resp: Response) {
        try {
            let term = utils.reformatString(String(req.query.term));
            lopDangKyService.deleteClasses_MidExam(term);
            responseUtils.send(resp, ResponseEntity.builder().code(1).message('executing').build());
        } catch (e) {
            responseUtils.send(resp, ResponseEntity.builder().code(-1).message('failed').data(e).build());
        }
    }
    async deleteClasses_EndExam(req: Request, resp: Response) {
        try {
            let term = utils.reformatString(String(req.query.term));
            lopDangKyService.deleteClasses_EndExam(term);
            responseUtils.send(resp, ResponseEntity.builder().code(1).message('executing').build());
        } catch (e) {
            responseUtils.send(resp, ResponseEntity.builder().code(-1).message('failed').data(e).build());
        }
    }
}

export const lopDangKyView = new LopDangKyView();
