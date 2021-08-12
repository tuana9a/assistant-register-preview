import fs from 'fs';
import { Request, Response } from 'express';

import { utils } from '../utils/Utils';
import { ResponseEntity } from '../models/ResponseEntity';
import { lopDangKyService } from '../services/LopDangKyService';

class Validate {
    is_term_ok(term: any) {
        let temp = String(term);
        return temp.match(/^\d+\w*$/);
    }
}
const validate = new Validate();

class LopDangKyView {
    async findMany(req: Request, resp: Response) {
        try {
            let filter = req.body;
            let term = utils.reformatString(String(req.query.term));

            if (validate.is_term_ok(term)) {
                let result = await lopDangKyService.findMany(term, filter);
                resp.setHeader('Content-Type', 'application/json; charset=utf-8');
                resp.send(ResponseEntity.builder().code(1).message('success').data(result).build());
            } else {
                resp.setHeader('Content-Type', 'application/json; charset=utf-8');
                resp.send(ResponseEntity.builder().code(0).message('term ?').build());
            }
        } catch (e) {
            console.error(e);
            resp.setHeader('Content-Type', 'application/json; charset=utf-8');
            resp.send(ResponseEntity.builder().code(0).message('failed').data(e).build());
        }
    }
    async insertMany(req: Request, resp: Response) {
        try {
            let term = utils.reformatString(String(req.query.term));
            let file = req.file;

            if (file && validate.is_term_ok(term)) {
                let filename = file.originalname;
                let filepath = './resource/' + filename;
                fs.writeFileSync(filepath, file.buffer, { flag: 'w' });

                await lopDangKyService.insertMany(term, filepath);

                resp.setHeader('Content-Type', 'application/json; charset=utf-8');
                resp.send(ResponseEntity.builder().code(1).message('executing').build());
            } else {
                resp.setHeader('Content-Type', 'application/json; charset=utf-8');
                resp.send(ResponseEntity.builder().code(0).message('missing something').data({ file: file.originalname, term }).build());
            }
        } catch (e) {
            console.error(e);
            resp.setHeader('Content-Type', 'application/json; charset=utf-8');
            resp.send(ResponseEntity.builder().code(0).message('failed').data(e).build());
        }
    }
    async deleteMany(req: Request, resp: Response) {
        try {
            let term = utils.reformatString(String(req.query.term));
            if (validate.is_term_ok(term)) {
                lopDangKyService.deleteMany(term);
                resp.setHeader('Content-Type', 'application/json; charset=utf-8');
                resp.send(ResponseEntity.builder().code(1).message('executing').build());
            } else {
                resp.setHeader('Content-Type', 'application/json; charset=utf-8');
                resp.send(ResponseEntity.builder().code(0).message('term ?').build());
            }
        } catch (e) {
            console.error(e);
            resp.setHeader('Content-Type', 'application/json; charset=utf-8');
            resp.send(ResponseEntity.builder().code(0).message('failed').data(e).build());
        }
    }
}

export const lopDangKyView = new LopDangKyView();
