import { Response } from 'express';

class ResponseUtils {
    send(resp: Response, data: any) {
        resp.setHeader('Content-Type', 'application/json; charset=utf-8');
        resp.send(data);
    }
}
export const responseUtils = new ResponseUtils();
