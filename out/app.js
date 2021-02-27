"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.App = void 0;
const fs_1 = __importDefault(require("fs"));
const multer_1 = __importDefault(require("multer"));
const mongodb_1 = require("mongodb");
const express_1 = __importDefault(require("express"));
const RegisterClassView_1 = require("./views/RegisterClassView");
const RegisterClassService_1 = require("./services/RegisterClassService");
const StudentRegisterView_1 = require("./views/StudentRegisterView");
const StudentRegisterService_1 = require("./services/StudentRegisterService");
const CONFIG = {};
const app = express_1.default();
var mongoClient;
var registerClassView;
var registerClassService;
var studentRegisterView;
var studentRegisterService;
async function loadConfig(CONFIG, configfolder, name) {
    return new Promise((resolve) => {
        let path = `${configfolder}/${name}-local.json`;
        fs_1.default.readFile(path, 'utf-8', (err, data) => {
            if (err) {
                path = `${configfolder}/${name}.json`;
                fs_1.default.readFile(path, 'utf-8', (_err, data) => {
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
async function loadAllConfig(CONFIG, configfolder) {
    return Promise.all([
        loadConfig(CONFIG, configfolder, 'server'),
        loadConfig(CONFIG, configfolder, 'database'),
        loadConfig(CONFIG, configfolder, 'security')
    ]);
}
async function currentKeyFilter(req, resp, next) {
    let auth = req.headers['auth'];
    if (auth == CONFIG.security.CURRENT_KEY) {
        next();
    }
    else {
        resp.setHeader('Content-Type', 'application/json; charset=utf-8');
        resp.status(403).send({ succes: false, body: 'Chuc ban may man lan sau' }).end();
    }
}
class App {
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
            mongoClient = new mongodb_1.MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });
            await mongoClient.connect(); // Connect the client to the server
            await mongoClient.db('test').command({ ping: 1 }); // Establish and verify connection
            console.log(' * database connected'); //CAUTION: update các service, view sau connect database;
            registerClassService = new RegisterClassService_1.RegisterClassService(mongoClient.db('register-class'));
            registerClassView = new RegisterClassView_1.RegisterClassView(registerClassService);
            studentRegisterService = new StudentRegisterService_1.StudentRegisterService(mongoClient.db('student-register'));
            studentRegisterView = new StudentRegisterView_1.StudentRegisterView(studentRegisterService);
        }
        catch (err) {
            console.log(' * database connect FAILED: ' + err);
        }
        app.use(express_1.default.json());
        const upload = multer_1.default({ limits: { fileSize: 10 * 1024 * 1024 } });
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
exports.App = App;
//# sourceMappingURL=app.js.map