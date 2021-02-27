import fs from 'fs';
import multer from 'multer';
import { MongoClient } from 'mongodb';
import express, { Request, Response, NextFunction } from 'express';

import { RegisterClassView } from './views/RegisterClassView';
import { RegisterClassService } from './services/RegisterClassService';
import { StudentRegisterView } from './views/StudentRegisterView';
import { StudentRegisterService } from './services/StudentRegisterService';

const CONFIG: any = {};
const app = express();
var mongoClient: MongoClient;
var registerClassView: RegisterClassView;
var registerClassService: RegisterClassService;
var studentRegisterView: StudentRegisterView;
var studentRegisterService: StudentRegisterService;

async function loadConfig(CONFIG: any, configfolder: string, name: string) {
    return new Promise((resolve) => {
        let path = `${configfolder}/${name}-local.json`;
        fs.readFile(path, 'utf-8', (err, data) => {
            if (err) {
                path = `${configfolder}/${name}.json`;
                fs.readFile(path, 'utf-8', (_err, data) => {
                    console.log(` * ${name}.json`);
                    CONFIG[`${name}`] = JSON.parse(data);
                    resolve(undefined);
                });
                return;
            }
            console.log(` * ${name}-local.json`);
            CONFIG[`${name}`] = JSON.parse(data);
            resolve(undefined);
        });
    });
}
async function loadAllConfig(CONFIG: any, configfolder: string) {
    return Promise.all([
        loadConfig(CONFIG, configfolder, 'server'),
        loadConfig(CONFIG, configfolder, 'database'),
        loadConfig(CONFIG, configfolder, 'security')
    ]);
}

async function currentKeyFilter(req: Request, resp: Response, next: NextFunction) {
    let auth = req.headers['auth'];
    if (auth == CONFIG.security.CURRENT_KEY) {
        next();
    } else {
        resp.setHeader('Content-Type', 'application/json; charset=utf-8');
        resp.status(403).send({ succes: false, body: 'Chuc ban may man lan sau' }).end();
    }
}

export class App {
    constructor() {
        console.log(' * REGISTER PREVIEW WEBSERVICE');
    }

    async init() {
        await loadAllConfig(CONFIG, './config');
        let username = encodeURIComponent(CONFIG.database.username);
        let password = encodeURIComponent(CONFIG.database.password);
        let address = CONFIG.database.address;

        let url = CONFIG.database.isLocal
            ? `mongodb://${address}`
            : `mongodb+srv://${username}:${password}@${address}?retryWrites=true&w=majority`;

        try {
            mongoClient = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });
            await mongoClient.connect(); // Connect the client to the server
            await mongoClient.db('test').command({ ping: 1 }); // Establish and verify connection
            console.log(' * database connected'); //CAUTION: update các service, view sau connect database;

            registerClassService = new RegisterClassService(mongoClient.db('register-class'));
            registerClassView = new RegisterClassView(registerClassService);

            studentRegisterService = new StudentRegisterService(mongoClient.db('student-register'));
            studentRegisterView = new StudentRegisterView(studentRegisterService);
        } catch (err) {
            console.log(' * database connect FAILED: ' + err);
        }

        app.use(express.json());
        const upload = multer({ limits: { fileSize: 10 * 1024 * 1024 } });
        app.all('/api/admin/*', currentKeyFilter);

        app.get('/api/public/classes', registerClassView.findClassesByTermAndIds);

        app.post('/api/admin/classes', upload.single('file'), registerClassView.updateClasses);
        app.post('/api/admin/classes/mid-exam', upload.single('file'), registerClassView.updateClasses_MidExam);
        app.post('/api/admin/classes/end-exam', upload.single('file'), registerClassView.updateClasses_EndExam);

        app.delete('/api/admin/classes', registerClassView.deleteClasses);
        app.delete('/api/admin/classes/mid-exam', registerClassView.deleteClasses_MidExam);
        app.delete('/api/admin/classes/end-exam', registerClassView.deleteClasses_EndExam);

        app.get('/api/public/student', studentRegisterView.findStudentByTermAndMssv);
        app.post('/api/admin/students/crawl-register', studentRegisterView.crawlManyStudents);
    }
    async run() {
        let port = process.env.PORT || CONFIG.server.port;
        app.listen(port).on('error', console.error);
        console.log(` * http://localhost:${port}`);
    }
}
