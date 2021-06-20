import multer from 'multer';
import express from 'express';

import { lopDangKyView } from './views/LopDangKyView';
import { sinhVienDangKyView } from './views/SinhVIenDangKyView';
import { requestFilter } from './security/RequestFilter';
import { dbFactory } from './services/DbFactory';
import { askMasterService } from './services/AskMasterService';
import { CONFIG } from './config/AppConfig';

class App {
    private RUNTIME: any = {};
    getRuntime(path: string) {
        let paths = path.split('.');
        try {
            return paths.reduce(function (pointer: any, cur: string) {
                return pointer[cur];
            }, this.RUNTIME);
        } catch (e) {
            return '';
        }
    }
    setRuntime(path: string, value: string) {
        let paths = path.split('.');
        let length = paths.length;
        let p = paths.reduce(function (pointer: any, cur: string, i: number) {
            if (i == length - 1) return pointer;
            let check = pointer[cur];
            if (!check) pointer[cur] = {};
            return pointer[cur];
        }, this.RUNTIME);
        p[paths[length - 1]] = value;
    }
    getWorkerAddress(name: string) {
        return this.getRuntime('workers.address.' + name);
    }
    setWorkerAddress(name: string, address: string) {
        this.setRuntime('workers.address.' + name, address);
    }
}

//SECTION: init application
export const app = new App();

dbFactory.init(); // connect db
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

let port = process.env.PORT || CONFIG.SERVER.PORT;
server.listen(port).on('error', console.error);
console.log(` * listen: ${CONFIG.SERVER.ADDRESS}`);

async function askMaster() {
    let url = `${CONFIG.SERVER.MASTER_ADDRESS}/api/worker/ask/worker-address`;
    let from = {
        name: CONFIG.SERVER.NAME,
        address: CONFIG.SERVER.ADDRESS
    };
    let asks = [CONFIG.SERVER.NAME];
    return askMasterService.askWorkerAddress(url, from, asks);
}
async function intervalAskMaster() {
    await askMaster();
    setTimeout(intervalAskMaster, 10_000);
}

intervalAskMaster();
