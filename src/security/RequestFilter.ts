import { Request, Response, NextFunction } from 'express';

class RequestFilter {
    authFilter(req: Request, resp: Response, next: NextFunction) {
        let auth = req.headers['auth'];
        if (auth) {
            next();
        } else {
            resp.setHeader('Content-Type', 'application/json; charset=utf-8');
            resp.status(403).send({ succes: false, body: 'Chuc ban may man lan sau' });
        }
    }
}

export const requestFilter = new RequestFilter();
