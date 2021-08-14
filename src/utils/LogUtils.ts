import fs from 'fs';
import { AppConfig } from '../config/AppConfig';

class LogUtils {
    info(data: any) {
        let now = new Date();
        let content = this.getFull(now) + ' [INFO] ' + data + '\n';
        let filepath = this.getFilePath(now);
        fs.appendFileSync(filepath, content);
    }
    warn(data: any) {
        let now = new Date();
        let content = this.getFull(now) + ' [WARN] ' + data + '\n';
        let filepath = this.getFilePath(now);
        fs.appendFileSync(filepath, content);
    }
    error(data: Error) {
        let now = new Date();
        let content = this.getFull(now) + ' [ERROR] ' + data.stack + '\n';
        let filepath = this.getFilePath(now);
        fs.appendFileSync(filepath, content);
    }
    private getDate(date: Date = new Date()) {
        let y = date.getFullYear();
        let m = date.getMonth() + 1; //0 -> 11
        let d = date.getDate();
        return `${y}-${m > 9 ? m : '0' + m}-${d > 9 ? d : '0' + d}`;
    }
    private getTime(date: Date = new Date()) {
        let h = date.getHours();
        let m = date.getMinutes();
        let s = date.getSeconds();
        return `${h > 9 ? h : '0' + h}:${m > 9 ? m : '0' + m}:${s > 9 ? s : '0' + s}`;
    }
    private getFull(date: Date = new Date()) {
        return this.getDate(date) + ' ' + this.getTime(date);
    }
    private getFilePath(date: Date = new Date()) {
        return AppConfig.path.logs_dir + this.getDate(date) + '.log';
    }
}

export const logUtils = new LogUtils();
