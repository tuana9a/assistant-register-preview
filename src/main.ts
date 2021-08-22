import cors from 'cors';
import multer from 'multer';
import express from 'express';

import { lopDangKyView } from './views/LopDangKyView';
import { requestFilter } from './security/RequestFilter';
import { dbFactory } from './services/DbFactory';
import { AppConfig } from './config/AppConfig';

dbFactory.init(); // connect db
const server = express();
const upload = multer({ limits: { fileSize: 10 * 1024 * 1024 } });

server.use(cors());
server.use(express.json());

server.post('/api/find/many/lop-dang-ky', lopDangKyView.findMany);

server.post('/api/insert/many/lop-dang-ky', requestFilter.adminFilter); 
server.post('/api/insert/many/lop-dang-ky', upload.single('file'), lopDangKyView.insertMany);

server.post('/api/delete/many/lop-dang-ky', requestFilter.adminFilter);
server.post('/api/delete/many/lop-dang-ky', lopDangKyView.deleteMany);

let port = process.env.PORT || AppConfig.server.port;
server.listen(port).on('error', console.error);
console.log(` * listen: ${AppConfig.server.address}`);
