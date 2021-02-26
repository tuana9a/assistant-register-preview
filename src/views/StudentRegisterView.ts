import { Request, Response } from 'express';

import { StudentRegisterService } from '../services/StudentRegisterService';
import { fromAnyToNumber } from '../utils/convert';
import { reformatString } from '../utils/reformat';

export class StudentRegisterView {
    service: StudentRegisterService;

    constructor(service: StudentRegisterService) {
        this.service = service;
    }

    async findSudentRegister(req: Request, resp: Response) {
        let mssv = fromAnyToNumber(reformatString(String(req.query.mssv)));
        let term = reformatString(String(req.query.term));

        resp.setHeader('Content-Type', 'application/json; charset=utf-8');
        let result = await this.service.findByTermAndMssv(term, mssv);

        resp.send(result);
    }
    async crawlSudentRegister(req: Request, resp: Response) {
        let term = reformatString(String(req.query.term));
        let start = fromAnyToNumber(reformatString(String(req.query.start)));
        let end = fromAnyToNumber(reformatString(String(req.query.end)));
        let cookie = reformatString(String(req.body.cookie));

        this.service.crawlManyStudents(term, start, end, cookie);

        resp.send({ success: true, body: 'executing' });
    }
}
