import fs from 'fs';
import multer from 'multer';
import express from 'express';

import { lopDangKyView } from './views/LopDangKyView';
import { sinhVienDangKyView } from './views/SinhVIenDangKyView';
import { requestFilter } from './security/RequestFilter';
import { DbConfig, dbFactory } from './services/DbFactory';
import { askMasterService } from './services/AskMasterService';

class App {
    CONFIG: any = {};
    loadConfig(name: string, path: string) {
        try {
            let data = fs.readFileSync(path, { flag: 'r', encoding: 'utf-8' });
            this.CONFIG[`${name}`] = JSON.parse(data);
            console.log(` * config: ${path}: SUCCESS`);
        } catch (e) {
            console.log(` * config: ${path}: FAILED`);
        }
    }
    getConfig(path: string) {
        let paths = path.split('.');
        return paths.reduce(function (pointer: any, cur: string) {
            let check = pointer[cur];
            if (!check) pointer[cur] = {};
            return pointer[cur];
        }, this.CONFIG);
    }
    setConfig(path: string, value: string) {
        let paths = path.split('.');
        let length = paths.length;
        let p = paths.reduce(function (pointer: any, cur: string, i: number) {
            if (i == length - 1) return pointer;
            let check = pointer[cur];
            if (!check) pointer[cur] = {};
            return pointer[cur];
        }, this.CONFIG);
        p[paths[length - 1]] = value;
    }
    autoConfig(configFolder: string) {
        let filenames = fs.readdirSync(configFolder);
        for (let filename of filenames) {
            if (filename.match(/.json$/)) {
                let name = filename.slice(0, -5);
                this.loadConfig(name, configFolder + '/' + filename);
            }
        }
    }
    getWorkerAddress(name: string) {
        return this.getConfig('workers.address.' + name);
    }
    setWorkerAddress(name: string, address: string) {
        this.setConfig('workers.address.' + name, address);
    }
    async askMaster() {
        let url = `${app.getConfig('server.master-address')}/api/worker/ask/worker-address`;
        let from = {
            name: 'assistant-school-register-preview',
            address: app.getConfig('server.address')
        };
        let asks = ['assistant-school-register-preview'];
        return askMasterService.askWorkerAddress(url, from, asks);
    }
}

//SECTION: init application
export const app = new App();
app.autoConfig('./config');

const server = express();
const upload = multer({ limits: { fileSize: 10 * 1024 * 1024 } });
server.use(express.json());
server.all('/api/admin/*', requestFilter.authFilter);
server.get('/api/public/classes', lopDangKyView.findClassesByTermAndIds);
server.post('/api/admin/classes', upload.single('file'), lopDangKyView.updateClasses);
server.post('/api/admin/classes/mid-exam', upload.single('file'), lopDangKyView.updateClasses_MidExam);
server.post('/api/admin/classes/end-exam', upload.single('file'), lopDangKyView.updateClasses_EndExam);
server.delete('/api/admin/classes', lopDangKyView.deleteClasses);
server.delete('/api/admin/classes/mid-exam', lopDangKyView.deleteClasses_MidExam);
server.delete('/api/admin/classes/end-exam', lopDangKyView.deleteClasses_EndExam);
server.get('/api/public/student', sinhVienDangKyView.findStudentByTermAndMssv);
server.post('/api/admin/students/crawl-register', sinhVienDangKyView.crawlManyStudents);

let port = process.env.PORT || app.getConfig('server.port');
server.listen(port).on('error', console.error);
console.log(` * listen: ${app.getConfig('server.address')}`);

//EXPLAIN: CONNECT DB
const dbconfig: DbConfig = {
    address: app.getConfig('database.address'),
    username: app.getConfig('database.username'),
    password: app.getConfig('database.password')
};
dbFactory.init(dbconfig);

async function intervalAskMaster() {
    await app.askMaster();
    setTimeout(intervalAskMaster, 10_000);
}
intervalAskMaster();
