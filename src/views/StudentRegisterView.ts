import { Request, Response } from 'express';

import { StudentRegisterService } from '../services/StudentRegisterService';
import { fromAnyToNumber } from '../utils/convert';
import { reformatString } from '../utils/reformat';

var service: StudentRegisterService;

export class StudentRegisterView {
    constructor(studentRegisterService: StudentRegisterService) {
        service = studentRegisterService;
    }

    async findStudentRegister(req: Request, resp: Response) {
        let mssv = fromAnyToNumber(reformatString(String(req.query.mssv)));
        let term = reformatString(String(req.query.term));

        resp.setHeader('Content-Type', 'application/json; charset=utf-8');
        let result = await service.findByTermAndMssv(term, mssv);

        resp.send(result);
    }
    async crawlStudentRegister(req: Request, resp: Response) {
        let term = reformatString(String(req.query.term));
        let start = fromAnyToNumber(reformatString(String(req.query.start)));
        let end = fromAnyToNumber(reformatString(String(req.query.end)));
        let cookie = reformatString(String(req.body.cookie));

        service.crawlManyStudents(term, start, end, cookie);

        resp.send({ success: true, body: 'executing' });
    }
}
