import fs from 'fs';
import multer from 'multer';
import express, { Request, Response, NextFunction } from 'express';

import { MongoDB } from './repo/MongoDB';
import { RegisterClassView } from './views/RegisterClassView';
import { RegisterClassService } from './services/RegisterClassService';
import { StudentRegisterView } from './views/StudentRegisterView';
import { StudentRegisterService } from './services/StudentRegisterService';

const CONFIG: any = {
    server: {
        isLocal: false,
        port: -1
    },
    security: {
        isLocal: false,
        ROOT_KEY: '',
        CURRENT_KEY: ''
    },
    database: {
        isLocal: false,
        address: '',
        username: '',
        password: ''
    }
};

var mongodb: MongoDB;
var registerClassView: RegisterClassView;
var studentRegisterView: StudentRegisterView;

async function loadConfig(CONFIG: any, configfolder: string, name: string) {
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
async function loadAllConfig(CONFIG: any, configfolder: string) {
    return Promise.all([
        loadConfig(CONFIG, configfolder, 'server'),
        loadConfig(CONFIG, configfolder, 'database'),
        loadConfig(CONFIG, configfolder, 'security')
    ]);
}
async function connectDatabase() {
    let username = encodeURIComponent(CONFIG.database.username);
    let password = encodeURIComponent(CONFIG.database.password);
    let address = CONFIG.database.address;

    let connectionString = '';
    if (CONFIG.database.isLocal) {
        connectionString = `mongodb://${address}`;
    } else {
        connectionString = `mongodb+srv://${username}:${password}@${address}?retryWrites=true&w=majority`;
    }
    mongodb = new MongoDB();
    try {
        await mongodb.connect(connectionString);
        console.log(' * database connected');
    } catch (err) {
        console.log(' * database connect FAILED: ' + err);
    }
}

//SECTION: filter
function currentKeyFilter(req: Request, resp: Response, next: NextFunction) {
    let auth = req.headers['auth'];
    if (auth == CONFIG.security.CURRENT_KEY) {
        next();
    } else {
        resp.setHeader('Content-Type', 'application/json; charset=utf-8');
        resp.status(403).send({ succes: false, body: 'Chuc ban may man lan sau' }).end();
    }
}
function rootKeyFilter(req: Request, resp: Response, next: NextFunction) {
    let auth = req.headers['auth'];
    if (auth == CONFIG.security.ROOT_KEY) {
        next();
    } else {
        resp.setHeader('Content-Type', 'application/json; charset=utf-8');
        resp.status(403).send({ succes: false, body: 'Chuc ban may man lan sau' }).end();
    }
}

//SECTION: REGISTER PREVIEW
async function findClasses(req: Request, resp: Response) {
    return registerClassView.findClasses(req, resp);
}
async function findClasses_Regex(req: Request, resp: Response) {
    return registerClassView.findClasses_Regex(req, resp);
}
async function findClassesDuplicate(req: Request, resp: Response) {
    return registerClassView.findDuplicate(req, resp);
}

async function upsertClasses(req: Request, resp: Response) {
    return registerClassView.updateClasses(req, resp);
}
async function upsertClasses_MidExam(req: Request, resp: Response) {
    return registerClassView.updateClasses_MidExam(req, resp);
}
async function upsertClasses_EndExam(req: Request, resp: Response) {
    return registerClassView.updateClasses_EndExam(req, resp);
}

async function clearClasses(req: Request, resp: Response) {
    return registerClassView.deleteClasses(req, resp);
}
async function clearClasses_MidExam(req: Request, resp: Response) {
    return registerClassView.deleteClasses_MidExam(req, resp);
}
async function clearClasses_EndExam(req: Request, resp: Response) {
    return registerClassView.deleteClasses_EndExam(req, resp);
}
//SECTION: STUDENT REGISTER
async function findStudentRegister(req: Request, resp: Response) {
    return studentRegisterView.findSudentRegister(req, resp);
}
async function crawlStudentRegister(req: Request, resp: Response) {
    return studentRegisterView.crawlSudentRegister(req, resp);
}
//SECTION: OTHER
async function updateCurrentKey(req: Request, resp: Response) {
    let key = req.body.key;
    resp.setHeader('Content-Type', 'application/json; charset=utf-8');

    let result = { success: true, body: 'success' };
    CONFIG.security.CURRENT_KEY = key;

    resp.send(result);
}

const app = express();
const upload = multer({ limits: { fileSize: 10 * 1024 * 1024 } });

app.use(express.json());
app.all('/api/admin/*', currentKeyFilter);

app.get('/api/public/classes', findClasses);
app.get('/api/public/classes/regex', findClasses_Regex);
app.get('/api/admin/classes/duplicate', findClassesDuplicate);

app.post('/api/admin/classes', upload.single('file'), upsertClasses);
app.post('/api/admin/classes/mid-exam', upload.single('file'), upsertClasses_MidExam);
app.post('/api/admin/classes/end-exam', upload.single('file'), upsertClasses_EndExam);

app.delete('/api/admin/classes', clearClasses);
app.delete('/api/admin/classes/mid-exam', clearClasses_MidExam);
app.delete('/api/admin/classes/end-exam', clearClasses_EndExam);

app.get('/api/public/student', findStudentRegister);
app.post('/api/admin/students/crawl-register', crawlStudentRegister);

app.put('/api/micro/current-key', updateCurrentKey);

export class App {
    configpath: string;
    constructor(configpath: string) {
        this.configpath = configpath;
    }
    async run() {
        console.log(' * REGISTER PREVIEW WEBSERVICE');

        await loadAllConfig(CONFIG, this.configpath);

        let port = process.env.PORT || CONFIG.server.port;
        const server = app.listen(port);
        console.log(` * http://localhost:${port}`);
        server.on('error', console.error);

        //CAUTION: update các service, view sau connect database;
        await connectDatabase();

        var registerClassService = new RegisterClassService(mongodb.db('register-class'));
        registerClassView = new RegisterClassView(registerClassService);

        var studentRegisterService = new StudentRegisterService(mongodb.db('student-register'));
        studentRegisterView = new StudentRegisterView(studentRegisterService);
    }
}
