import multer from 'multer';
import express from 'express';

import { lopDangKyView } from './views/LopDangKyView';
import { sinhVienDangKyView } from './views/SinhVIenDangKyView';
import { requestFilter } from './security/RequestFilter';
import { dbFactory } from './services/DbFactory';
import { AppConfig } from './config/AppConfig';

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
server.post('/api/admin/students/crawl-register', sinhVienDangKyView.crawlStudents);

let port = process.env.PORT || AppConfig.server.port;
server.listen(port).on('error', console.error);
console.log(` * listen: ${AppConfig.server.address}`);
