import fs from 'fs';
import multer from 'multer';
import { MongoClient } from 'mongodb';
import express, { Request, Response, NextFunction, Express } from 'express';

import { RegisterClassView } from './views/RegisterClassView';
import { RegisterClassService } from './services/RegisterClassService';
import { StudentRegisterView } from './views/StudentRegisterView';
import { StudentRegisterService } from './services/StudentRegisterService';

const CONFIG: any = {};
var mongoClient: MongoClient;
var registerClassView: RegisterClassView;
var registerClassService: RegisterClassService;
var studentRegisterView: StudentRegisterView;
var studentRegisterService: StudentRegisterService;

export class App {
    private app: Express;
    constructor() {
        console.log(' * REGISTER PREVIEW WEBSERVICE');
    }

    private async loadConfig(CONFIG: any, configfolder: string, name: string) {
        return new Promise((resolve, reject) => {
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
    private async loadAllConfig(CONFIG: any, configfolder: string) {
        return Promise.all([
            this.loadConfig(CONFIG, configfolder, 'server'),
            this.loadConfig(CONFIG, configfolder, 'database'),
            this.loadConfig(CONFIG, configfolder, 'security')
        ]);
    }

    private async currentKeyFilter(req: Request, resp: Response, next: NextFunction) {
        let auth = req.headers['auth'];
        if (auth == CONFIG.security.CURRENT_KEY) {
            next();
        } else {
            resp.setHeader('Content-Type', 'application/json; charset=utf-8');
            resp.status(403).send({ succes: false, body: 'Chuc ban may man lan sau' }).end();
        }
    }
    private async rootKeyFilter(req: Request, resp: Response, next: NextFunction) {
        let auth = req.headers['auth'];
        if (auth == CONFIG.security.ROOT_KEY) {
            next();
        } else {
            resp.setHeader('Content-Type', 'application/json; charset=utf-8');
            resp.status(403).send({ succes: false, body: 'Chuc ban may man lan sau' }).end();
        }
    }

    async setup() {
        await this.loadAllConfig(CONFIG, './config');
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

        this.app = express();
        const upload = multer({ limits: { fileSize: 10 * 1024 * 1024 } });

        this.app.use(express.json());
        this.app.all('/api/admin/*', this.currentKeyFilter);

        this.app.get('/api/public/classes', registerClassView.findClassesByTermAndIds);

        this.app.post('/api/admin/classes', upload.single('file'), registerClassView.updateClasses);
        this.app.post('/api/admin/classes/mid-exam', upload.single('file'), registerClassView.updateClasses_MidExam);
        this.app.post('/api/admin/classes/end-exam', upload.single('file'), registerClassView.updateClasses_EndExam);

        this.app.delete('/api/admin/classes', registerClassView.deleteClasses);
        this.app.delete('/api/admin/classes/mid-exam', registerClassView.deleteClasses_MidExam);
        this.app.delete('/api/admin/classes/end-exam', registerClassView.deleteClasses_EndExam);

        this.app.get('/api/public/student', studentRegisterView.findStudentRegister);
        this.app.post('/api/admin/students/crawl-register', studentRegisterView.crawlStudentRegister);
    }
    async run() {
        let port = process.env.PORT || CONFIG.server.port;
        this.app.listen(port).on('error', console.error);
        console.log(` * http://localhost:${port}`);
    }
}
