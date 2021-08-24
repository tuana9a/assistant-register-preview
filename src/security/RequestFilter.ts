import { Request, Response, NextFunction } from 'express';
import { AppConfig } from '../config/AppConfig';
import { ResponseEntity } from '../models/ResponseEntity';

class RequestFilter {
    adminFilter(req: Request, resp: Response, next: NextFunction) {
        let secret = req.headers.authorization;
        if (secret) {
            if (secret == AppConfig.security.secret) {
                next();
                return;
            }
        }
        resp.setHeader('Content-Type', 'application/json; charset=utf-8');
        resp.send(ResponseEntity.builder().code(0).message('Unauthorized').build());
    }
}

export const requestFilter = new RequestFilter();
