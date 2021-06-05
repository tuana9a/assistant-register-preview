import { Request, Response, NextFunction } from 'express';

class RequestFilter {
    authFilter(req: Request, resp: Response, next: NextFunction) {
        let auth = req.headers['auth'];
        //TODO: filter with auth header
        next();
    }
}

export const requestFilter = new RequestFilter();
