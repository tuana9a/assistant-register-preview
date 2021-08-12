import { Request, Response, NextFunction } from 'express';

class RequestFilter {
    adminFilter(req: Request, resp: Response, next: NextFunction) {
        let token = req.headers['Token'];
        next();
    }
}

export const requestFilter = new RequestFilter();
