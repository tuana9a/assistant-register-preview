
const fs = require("fs");
const multer = require("multer");
const axios = require("axios").default;
const express = require("express");
const { MongoClient } = require("mongodb");
const upload = multer({ limits: { fileSize: 10 * 1024 * 1024 } });

const log_helper = require("./common/log-helper");
const csv_helper = require("./common/csv-helper");
const date_helper = require("./common/date-helper");

var CONFIG = {
    isLocal: false,
    server: {
        port: -1
    },
    database: {
        address: "",
        username: "",
        password: "",
        authSource: "",
    },
    masterService: {
        address: ""
    },
}
var SECURITY = {
    ROOT_KEY: "",
    CURRENT_KEY: "",
}

let mongoClient;
let databaseClient;
let databaseIntense = false;


function lockDatabase() {
    databaseIntense = true;
}
function releaseDatabase() {
    databaseIntense = false;
}


function validateStringParam(paramName = "", input = "", regex, result) {
    if (input == undefined || input == "" || input.search(regex) == -1) {
        result.success = false;
        result.body = `Error: Param: ${paramName}="${input}"`;
        return false;
    }
    result.success = true;
    return true;
}
function validateTermParam(term = "", result) {
    return validateStringParam("term", term, /^\d+.+$/, result);
}
function validateCurrentkey(auth = "", result) {
    if (auth != SECURITY.CURRENT_KEY) {
        result.success = false;
        result.body = "unauthorized";
        return false;
    }
    return true;
}
function validateDatabaseIntense(result) {
    if (databaseIntense) {
        result.success = false;
        result.body = "database intense";
        return true;
    }
    return false;
}


//SECTION: helper
function processQueryClassIds(classIds = "") {
    return classIds.trim()
        .split(/\s*,\s*|\s+/)
        .map(e => e.replace(/[\D]+/g, ""))
        .filter(e => e != "");
}
function reformatClassProperty(studyClass) {
    reformatStringPropety(studyClass);
    for (let buoiHoc of studyClass.cacBuoiHoc) {
        reformatStringPropety(buoiHoc);
    }
    for (let nhomThi of studyClass.thiGiuaKi) {
        reformatStringPropety(nhomThi);
    }
    for (let nhomThi of studyClass.thiCuoiKi) {
        reformatStringPropety(nhomThi);
    }
    return studyClass;
}
function reformatStringPropety(object) {
    for (let propName in object) {
        let propValue = object[`${propName}`];
        if (typeof propValue == 'string') {
            if (propValue.search(/\s*NULL\s*/i) != -1) {
                object[`${propName}`] = "";
            } else {
                object[`${propName}`] = reformatString(propValue);
            }
        }
    }
    return object;
}
function reformatString(input = "") {
    return input.trim().replace(/\s{2,}/g, " ");
}


//SECTION: I/O
async function loadConfig() {
    console.log(String(fs.readFileSync("favicon.txt")));

    return Promise.all([
        new Promise((resolve, reject) => {
            fs.readFile("./config/config-local.json", "utf-8", (e, data) => {
                if (e) {
                    fs.readFile("./config/config.json", "utf-8", (e, data) => {
                        console.log("load config.json");
                        CONFIG = JSON.parse(data);
                        CONFIG.isLocal = false;
                        resolve();
                    });
                    return;
                }
                console.log("load config-local.json");
                CONFIG = JSON.parse(data);
                CONFIG.isLocal = true;
                resolve();
            });
        }),
        new Promise((resolve, reject) => {
            fs.readFile("./config/security.json", "utf-8", (e, data) => {
                SECURITY = JSON.parse(data);
                resolve();
            });
        }),
    ]);
}
async function initServer() {
    const app = express();
    app.use(express.json());

    app.get('/', function (req, resp) {
        resp.setHeader("Content-Type", "text/plain");
        resp.write("online");
        resp.end();
    });


    app.get('/api/public/classes', async function (req, resp) {
        let ids = processQueryClassIds(String(req.query.ids));
        let term = req.query.term;

        let result = { success: true, body: [] };
        resp.setHeader("Content-Type", "application/json; charset=utf-8");

        if (databaseIntense) {
            result.success = false;
            resp.write(JSON.stringify(result));
            resp.end();
            return;
        }

        result = await dbFindMany(term, ids);
        resp.write(JSON.stringify(result));
        resp.end();
    });
    app.get('/api/public/guess-classes', async function (req, resp) {
        let ids = processQueryClassIds(String(req.query.ids));
        let term = req.query.term;

        let result = { success: true, body: [] };
        resp.setHeader("Content-Type", "application/json; charset=utf-8");

        if (databaseIntense) {
            result.success = false;
            resp.write(JSON.stringify(result));
            resp.end();
            return;
        }

        result = await dbGuessClasses(term, ids);
        resp.write(JSON.stringify(result));
        resp.end();
    });


    app.post('/api/admin/classes', upload.single('file'), async function (req, resp) {
        let term = req.query.term;
        let auth = req.headers["auth"];

        let result = { success: true, body: {} };
        resp.setHeader("Content-Type", "application/json; charset=utf-8");

        if (validateDatabaseIntense(result) || !validateCurrentkey(auth, result)) {
            resp.write(JSON.stringify(result));
            resp.end();
            return;
        }

        let file = req.file;
        if (file) {
            let filename = file.originalname;
            result.body = "executing...";
            fs.writeFileSync("./resource/" + filename, file.buffer, { flag: "w" });
            dbUpsertRegisterClass(term, filename);
        } else {
            result.body = "no file !";
        }
        resp.write(JSON.stringify(result));
        resp.end();
    });
    app.post('/api/admin/classes/mid-exam', upload.single('file'), async function (req, resp) {
        let term = req.query.term;
        let firstWeekDay = req.query.firstWeekDay;
        let auth = req.headers["auth"];

        let result = { success: true, body: {} };
        resp.setHeader("Content-Type", "application/json; charset=utf-8");

        if (validateDatabaseIntense(result) || !validateCurrentkey(auth, result)) {
            resp.write(JSON.stringify(result));
            resp.end();
            return;
        }

        let file = req.file;
        if (file) {
            let filename = file.originalname;
            result.body = "executing...";
            fs.writeFileSync("./resource/" + filename, file.buffer, { flag: "w" });
            dbUpsertMidExam(term, firstWeekDay, filename);
        } else {
            result.body = "no file !";
        }
        resp.write(JSON.stringify(result));
        resp.end();
    });
    app.post('/api/admin/classes/end-exam', upload.single('file'), async function (req, resp) {
        let term = req.query.term;
        let firstWeekDay = req.query.firstWeekDay;
        let auth = req.headers["auth"];

        let result = { success: true, body: {} };
        resp.setHeader("Content-Type", "application/json; charset=utf-8");

        if (validateDatabaseIntense(result) || !validateCurrentkey(auth, result)) {
            resp.write(JSON.stringify(result));
            resp.end();
            return;
        }

        let file = req.file;
        if (file) {
            let filename = file.originalname;
            result.body = "executing...";
            fs.writeFileSync("./resource/" + filename, file.buffer, { flag: "w" });
            dbUpsertEndExam(term, firstWeekDay, filename);
        } else {
            result.body = "no file !";
        }
        resp.write(JSON.stringify(result));
        resp.end();
    });


    app.delete('/api/admin/classes', async function (req, resp) {
        let term = req.query.term;
        let auth = req.headers["auth"];

        let result = { success: true, body: {} };
        resp.setHeader("Content-Type", "application/json; charset=utf-8");

        if (validateDatabaseIntense(result) || !validateCurrentkey(auth, result)) {
            resp.write(JSON.stringify(result));
            resp.end();
            return;
        }

        dbClearRegisterClass(term);
        result.body = "executing...";
        resp.write(JSON.stringify(result));
        resp.end();
    });
    app.delete('/api/admin/classes/mid-exam', async function (req, resp) {
        let term = req.query.term;
        let auth = req.headers["auth"];

        let result = { success: true, body: {} };
        resp.setHeader("Content-Type", "application/json; charset=utf-8");

        if (validateDatabaseIntense(result) || !validateCurrentkey(auth, result)) {
            resp.write(JSON.stringify(result));
            resp.end();
            return;
        }

        dbClearExamSchedule(term, false);
        result.body = "executing...";
        resp.write(JSON.stringify(result));
        resp.end();
    });
    app.delete('/api/admin/classes/end-exam', async function (req, resp) {
        let term = req.query.term;
        let auth = req.headers["auth"];

        let result = { success: true, body: {} };
        resp.setHeader("Content-Type", "application/json; charset=utf-8");

        if (validateDatabaseIntense(result) || !validateCurrentkey(auth, result)) {
            resp.write(JSON.stringify(result));
            resp.end();
            return;
        }

        dbClearExamSchedule(term, true);
        result.body = "executing...";
        resp.write(JSON.stringify(result));
        resp.end();
    });


    app.put('/api/micro/current-key', function (req, resp) {
        let auth = req.headers["auth"];
        let key = req.body.key;

        let result = { success: true, body: {} };
        resp.setHeader("Content-Type", "application/json; charset=utf-8");

        if (auth == SECURITY.ROOT_KEY) {
            SECURITY.CURRENT_KEY = key;
            result.body = "update success";
        } else {
            result.success = false;
        }
        resp.write(JSON.stringify(result));
        resp.end();
    });


    app.get('/api/admin/utils/duplicate-classes', async function (req, resp) {
        let term = req.query.term;
        let auth = req.headers["auth"];

        let result = { success: true, body: {} };
        resp.setHeader("Content-Type", "application/json; charset=utf-8");

        if (validateDatabaseIntense(result) || !validateCurrentkey(auth, result)) {
            resp.write(JSON.stringify(result));
            resp.end();
            return;
        }

        dbFindDuplicate(term);
        result.body = "executing...";
        resp.write(JSON.stringify(result));
        resp.end();
    });
    app.get('/api/admin/utils/reformat-classes', async function (req, resp) {
        let term = req.query.term;
        let auth = req.headers["auth"];

        let result = { success: true, body: {} };
        resp.setHeader("Content-Type", "application/json; charset=utf-8");

        if (validateDatabaseIntense(result) || !validateCurrentkey(auth, result)) {
            resp.write(JSON.stringify(result));
            resp.end();
            return;
        }

        dbReformatAll(term);
        result.body = "executing...";
        resp.write(JSON.stringify(result));
        resp.end();
    });


    return new Promise((resolve, reject) => {
        const server = app.listen(process.env.PORT || CONFIG.server.port, function () {
            let port = server.address().port;
            console.log("server start at http://%s:%s", "127.0.0.1", port);
            resolve();
        });
        server.on("error", reject);
    });
}
async function connectDatabase() {
    return new Promise(async (resolve, reject) => {

        let username = encodeURIComponent(CONFIG.database.username);
        let password = encodeURIComponent(CONFIG.database.password);
        let address = CONFIG.database.address;
        let authSource = CONFIG.database.authSource;

        let url = "";
        if (CONFIG.isLocal) {
            url = `mongodb://${username}:${password}@${address}/?authSource=${authSource}&poolSize=8`;
        } else {
            url = `mongodb+srv://${username}:${password}@${address}?retryWrites=true&w=majority`;
        }
        mongoClient = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });

        try {
            await mongoClient.connect();// Connect the client to the server
            await mongoClient.db("admin").command({ ping: 1 });// Establish and verify connection
            databaseClient = mongoClient.db("register-preview");
            // let result = await databaseClient.collection("").find({}); result.deletedCount;
            resolve();

        } catch (e) {
            reject(e);
        }
    });
}
async function disconnectDatabase() {
    if (mongoClient != undefined && mongoClient != null) {
        await client.close();
    }
}


//SECTION: main app service
async function dbFindMany(term = "", classIds = []) {
    let result = { success: true, body: [], };
    if (!validateTermParam(term, result)) return result;

    try {
        let query = { maLop: { $in: classIds } };
        let cursor = databaseClient.collection(`${term}-register-class`).find(query);
        await cursor.forEach(e => {
            result.body.push(e);
        });

    } catch (e) {
        log_helper.error(e);
        result.success = false;
        result.body = e;
    }

    return result;
}
async function dbGuessClasses(term = "", classIds = []) {
    let result = { success: true, body: [], };
    if (!validateTermParam(term, result)) return result;

    try {
        let or = classIds.map(id => {
            return { maLop: { $regex: new RegExp(`${id}.*`) } };
        });
        let query = { $or: or };
        let cursor = databaseClient.collection(`${term}-register-class`).find(query);
        await cursor.forEach(e => result.body.push(e));

    } catch (e) {
        log_helper.error(e);
        result.success = false;
        result.body = e;
    }

    return result;
}


//SECTION: database instense
async function dbReformatAll(term = "") {
    let result = { success: true, body: -1 };
    if (!validateTermParam(term, result)) return result;

    lockDatabase();
    try {
        let collection = databaseClient.collection(`${term}-register-class`);
        let cursor = collection.find();
        let reformatCount = 0;
        let promises = [];
        await cursor.forEach(async (studyClass) => {
            let maLop = studyClass.maLop;
            let promise = new Promise((resolve, reject) => {
                try {
                    let filter = { maLop: maLop };
                    delete studyClass._id;
                    reformatClassProperty(studyClass);
                    let update = { $set: { ...studyClass } };

                    collection.updateMany(filter, update, (err, result) => {
                        if (err) {
                            reject("MaLop: " + maLop + ", " + err);
                            return;
                        }
                        reformatCount += result.matchedCount;
                        resolve();
                    });
                } catch (e) {
                    reject("MaLop: " + maLop + ", " + e);
                }
            }).catch(log_helper.error);
            promises.push(promise);
        });
        await Promise.all(promises);
        result.body = reformatCount;

    } catch (e) {
        log_helper.error(e);
        result.success = false;
        result.body = e;
    }
    releaseDatabase();

    let bodyReport = { micro: "register-preview", ...result };
    let urlReport = `${CONFIG.masterService.address}/api/micro/report`;

    axios.post(urlReport, bodyReport, { headers: { "auth": SECURITY.CURRENT_KEY } })
        .catch(log_helper.error);
}
async function dbFindDuplicate(term = "") {
    let result = { success: true, body: {} };
    if (!validateTermParam(term, result)) return result;

    lockDatabase();
    try {
        let collection = databaseClient.collection(`${term}-register-class`);
        let cursor = collection.find();
        let duplicateCount = 0;
        let duplicateCases = [];
        let promises = [];
        await cursor.forEach(async (studyClass) => {
            let promise = new Promise(async (resolve, reject) => {
                let maLop = studyClass.maLop;
                let filter = { maLop: maLop };
                let check = collection.find(filter);
                if (await check.count() != 1) {
                    if (!duplicateCases.includes(maLop)) {
                        duplicateCount++;
                        duplicateCases.push(maLop);
                    }
                }
                resolve();
            });
            promises.push(promise);
        });
        await Promise.all(promises);

        result.body.count = duplicateCount;
        result.body.cases = duplicateCases;

    } catch (e) {
        log_helper.error(e);
        result.success = false;
        result.body = e;
    }
    releaseDatabase();

    let bodyReport = { micro: "register-preview", ...result };
    let urlReport = `${CONFIG.masterService.address}/api/micro/report`;

    axios.post(urlReport, bodyReport, { headers: { "auth": SECURITY.CURRENT_KEY } })
        .catch(log_helper.error);
}
async function dbClearExamSchedule(term = "", end = true) {
    let result = { success: true, body: [] };
    if (!validateTermParam(term, result)) return result;

    lockDatabase();
    try {
        let collection = databaseClient.collection(`${term}-register-class`);
        let cursor = collection.find();
        let count = 0;
        let promises = [];
        await cursor.forEach((studyClass) => {
            promises.push(new Promise((resolve, reject) => {
                let maLop = studyClass.maLop;
                let updateQuery = end ? { $set: { thiCuoiKi: [] } } : { $set: { thiGiuaKi: [] } };
                collection.updateMany({ maLop: maLop }, updateQuery, (e, updateResult) => {
                    if (e) {
                        result.body.push("MaLop: " + maLop + " " + e);
                        resolve();
                        return;
                    }
                    count += updateResult.matchedCount;
                    resolve();
                });
            }));
        });
        await Promise.all(promises);
        result.body.push("Done: count=" + count);

    } catch (e) {
        log_helper.error(e);
        result.success = false;
        result.body.push(String(e));
    }
    releaseDatabase();

    let bodyReport = { micro: "register-preview", ...result };
    let urlReport = `${CONFIG.masterService.address}/api/micro/report`;

    axios.post(urlReport, bodyReport, { headers: { "auth": SECURITY.CURRENT_KEY } })
        .catch(log_helper.error);
}
async function dbClearRegisterClass(term = "") {
    let result = { success: true, body: {} };
    if (!validateTermParam(term, result)) return result;

    lockDatabase();
    try {
        let collection = databaseClient.collection(`${term}-register-class`);
        let deleteResult = await collection.deleteMany({});
        result.body.count = deleteResult.deletedCount;

    } catch (e) {
        log_helper.error(e);
        result.success = false;
        result.body = e;
    }
    releaseDatabase();

    let bodyReport = { micro: "register-preview", ...result };
    let urlReport = `${CONFIG.masterService.address}/api/micro/report`;

    axios.post(urlReport, bodyReport, { headers: { "auth": SECURITY.CURRENT_KEY } })
        .catch(log_helper.error);
}


//SECTION: database instense
async function dbUpsertRegisterClass(term, csvName) {
    let result = { success: true, body: [] };
    if (!validateTermParam(term, result)) return result;
    if (!validateStringParam("csvName", csvName, /^\d+.+-register-class.csv$/, result)) return result;

    lockDatabase();
    try {
        let count = 0;
        let promises = [];
        let maLopSet = new Set();
        let collection = databaseClient.collection(`${term}-register-class`);
        async function insertClassFromRow(row) {
            return new Promise(async (resolve, reject) => {
                let maLop = reformatString(row["#maLop"]);
                let buoiHocSo = reformatString(row["#buoiHocSo"]);
                maLopSet.add(maLop);

                let lopHocNew = {
                    maLop: maLop,
                    loaiLop: row["#loaiLop"],
                    maHocPhan: row["#maHocPhan"],
                    tenHocPhan: row["#tenHocPhan"],
                    ghiChu: row["#ghiChu"],
                    cacBuoiHoc: [{
                        name: buoiHocSo,
                        thuHoc: row["#thuHoc"],
                        phongHoc: row["#phongHoc"],
                        thoiGianHoc: row["#thoiGianHoc"],
                        tuanHoc: row["#tuanHoc"],
                        _timestamp: Date.now()
                    }],
                    thiGiuaKi: [],
                    thiCuoiKi: [],
                };
                delete lopHocNew._id;

                let insertResult = await collection.insertOne(lopHocNew);
                if (insertResult.insertedCount == 0) result.body.push(insertResult);

                resolve();
            });
        }
        async function recombinedClass(maLop) {
            return new Promise(async (resolve, reject) => {
                let existClasses = [];
                await collection.find({ maLop: maLop }).forEach(e => existClasses.push(e));
                let length = existClasses.length;
                if (length == 0) {
                    //EXPLAIN: not exist, so insert failed
                    result.body.push(maLop + " insert failed");
                    resolve();

                } else if (length == 1) {
                    //EXPLAIN: insert success but only 1 buoiHoc
                    count++;
                    resolve();

                } else {
                    //EXPLAIN: insert success has >= 2 buoiHoc
                    count++;
                    let deletedResult = await collection.deleteMany({ maLop: maLop });
                    if (deletedResult.deletedCount == 0) {
                        result.body.push(maLop + " delete failed");
                        resolve();
                        return;
                    }
                    let combinedClass = existClasses.reduce((combined, eachClass, index) => {
                        if (index == 0) return combined;
                        for (let buoiHoc of eachClass.cacBuoiHoc) {
                            let buoiHocExist = false;
                            combined.cacBuoiHoc.forEach((buoiHocMain, index) => {
                                if (buoiHocMain.name == buoiHoc.name) {
                                    buoiHocExist = true;
                                    if (buoiHoc._timestamp >= buoiHocMain._timestamp) {
                                        combined.cacBuoiHoc[index] = buoiHoc;
                                    }
                                }
                            });
                            if (!buoiHocExist) combined.cacBuoiHoc.push(buoiHoc);
                        }
                        return combined;
                    }, existClasses[0]);

                    delete combinedClass._id;
                    let reinsertResult = await collection.insertOne(combinedClass);
                    if (reinsertResult.insertedCount == 0) result.body.push(maLop + " reinsert failed");
                    resolve();
                }
            });
        }

        //SECTION: insert every thing
        await new Promise((resolve, reject) => {
            csv_helper.readAsync("./resource/" + csvName, (row) => {
                promises.push(insertClassFromRow(row));
            }, resolve);
        });
        await Promise.all(promises);

        //SECTION: combined duplicate
        promises = [];
        maLopSet.forEach((maLop) => {
            promises.push(recombinedClass(maLop));
        });
        await Promise.all(promises);

        result.body.push("Done: count=" + count);

    } catch (e) {
        log_helper.error(e);
        result.success = false;
        result.body = e;
    }
    releaseDatabase();

    log_helper.info("UpsertRegisterClass: " + JSON.stringify(result));
    let bodyReport = { micro: "register-preview", ...result };
    let urlReport = `${CONFIG.masterService.address}/api/micro/report`;

    axios.post(urlReport, bodyReport, { headers: { "auth": SECURITY.CURRENT_KEY } })
        .catch(log_helper.error);
}
async function dbUpsertMidExam(term, firstWeekDay, csvName) {
    let result = { success: true, body: [] };
    if (!validateTermParam(term, result)) return result;
    if (!validateStringParam("csvName", csvName, /^\d+.+-mid-exam.csv$/, result)) return result;

    lockDatabase();
    try {
        let count = 0;
        let promises = [];
        let maLopSet = new Set();
        let collection = databaseClient.collection(`${term}-register-class`);
        async function insertClassFromRow(row) {
            return new Promise(async (resolve, reject) => {
                let maLop = reformatString(row["#maLop"]);
                let tuanThi = "T" + date_helper.weeksFromTo(date_helper.dashToDate(firstWeekDay), date_helper.dotToDate(row["#ngayThi"]));

                let nhomThiNew = {
                    name: reformatString(row["#tenNhom"]),
                    thuThi: row["#thuThi"],
                    ngayThi: row["#ngayThi"],
                    kipThi: row["#kipThi"],
                    phongThi: row["#phongThi"],
                    tuanThi: tuanThi,
                    _timestamp: Date.now()
                };

                let existClasses = [];
                await collection.find({ maLop: maLop }).forEach(e => existClasses.push(e));
                let length = existClasses.length;

                if (length == 0) {
                    //EXPLAIN: not exist, so update failed
                    result.body.push(maLop + " not exist");
                    resolve();

                } else if (length == 1) {
                    //EXPLAIN: success only 1 found
                    maLopSet.add(maLop);
                    let existClass = existClasses[0];
                    existClass.thiGiuaKi = [nhomThiNew];

                    delete existClass._id;
                    let insertResult = await collection.insertOne(existClass);
                    if (insertResult.insertedCount == 0) result.body.push(insertResult);
                    resolve();

                } else {
                    //EXPLAIN: insert success has >= 2 buoiHoc
                    result.body.push(maLop + " duplicate");
                    resolve();
                }
            });
        }
        async function recombinedClass(maLop) {
            return new Promise(async (resolve, reject) => {
                let existClasses = [];
                await collection.find({ maLop: maLop }).forEach(e => existClasses.push(e));
                let length = existClasses.length;

                if (length == 0) {
                    //EXPLAIN: not exist, so insert failed
                    result.body.push(maLop + " insert failed");
                    resolve();

                } else if (length == 1) {
                    //EXPLAIN: insert success but only 1 buoiHoc
                    count++;
                    resolve();

                } else {
                    //EXPLAIN: insert success has >= 2 buoiHoc
                    count++;
                    let deletedResult = await collection.deleteMany({ maLop: maLop });
                    if (deletedResult.deletedCount == 0) {
                        result.body.push(maLop + " delete failed");
                        resolve();
                        return;
                    }
                    let combinedClass = existClasses.reduce((combined, eachClass, index) => {
                        if (index == 0) return combined;
                        let totalCacNhomThi = combined.thiGiuaKi;
                        let cacNhomThi = eachClass.thiGiuaKi;
                        for (let nhomThi of cacNhomThi) {
                            let nhomThiExist = false;
                            totalCacNhomThi.forEach((nhomThiMain, index) => {
                                if (nhomThiMain.name == nhomThi.name) {
                                    nhomThiExist = true;
                                    if (nhomThi._timestamp >= nhomThiMain._timestamp) {
                                        totalCacNhomThi[index] = nhomThi;
                                    }
                                }
                            });
                            if (!nhomThiExist) totalCacNhomThi.push(nhomThi);
                        }
                        return combined;
                    }, existClasses[0]);

                    delete combinedClass._id;
                    let insertResult = await collection.insertOne(combinedClass);
                    if (insertResult.insertedCount == 0) result.body.push(maLop + " reinsert failed");
                    resolve();
                }

            });
        }

        //SECTION: insert every
        await new Promise(async (resolve, reject) => {
            csv_helper.readAsync("./resource/" + csvName, (row) => {
                promises.push(insertClassFromRow(row));
            }, resolve);
        });
        await Promise.all(promises);

        //SECTION: combined duplicate
        promises = [];
        maLopSet.forEach((maLop) => {
            promises.push(recombinedClass(maLop));
        });
        await Promise.all(promises);

        result.body.push("Done: count=" + count);

    } catch (e) {
        log_helper.error(e);
        result.success = false;
        result.body = e;
    }
    releaseDatabase();

    log_helper.info("UpsertRegisterClass: " + JSON.stringify(result));
    let bodyReport = { micro: "register-preview", ...result };
    let urlReport = `${CONFIG.masterService.address}/api/micro/report`;

    axios.post(urlReport, bodyReport, { headers: { "auth": SECURITY.CURRENT_KEY } })
        .catch(log_helper.error);
}
async function dbUpsertEndExam(term, firstWeekDay, csvName) {
    let result = { success: true, body: [] };
    if (!validateTermParam(term, result)) return result;
    if (!validateStringParam("csvName", csvName, /^\d+.+-end-exam.csv$/, result)) return result;

    lockDatabase();
    try {
        let count = 0;
        let promises = [];
        let maLopSet = new Set();
        let collection = databaseClient.collection(`${term}-register-class`);
        async function insertClassFromRow(row) {
            return new Promise(async (resolve, reject) => {
                let maLop = reformatString(row["#maLop"]);
                let tuanThi = row["#tuanThi"];

                let nhomThiNew = {
                    name: reformatString(row["#tenNhom"]),
                    thuThi: row["#thuThi"],
                    ngayThi: row["#ngayThi"],
                    kipThi: row["#kipThi"],
                    phongThi: row["#phongThi"],
                    tuanThi: tuanThi,
                    _timestamp: Date.now()
                };

                let existClasses = [];
                await collection.find({ maLop: maLop }).forEach(e => existClasses.push(e));
                let length = existClasses.length;

                if (length == 0) {
                    //EXPLAIN: not exist, so update failed
                    result.body.push(maLop + " not exist");
                    resolve();

                } else if (length == 1) {
                    //EXPLAIN: success only 1 found
                    maLopSet.add(maLop);
                    let existClass = existClasses[0];
                    existClass.thiCuoiKi = [nhomThiNew];

                    delete existClass._id;
                    let insertResult = await collection.insertOne(existClass);
                    if (insertResult.insertedCount == 0) result.body.push(insertResult);
                    resolve();

                } else {
                    //EXPLAIN: insert success has >= 2 buoiHoc
                    result.body.push(maLop + " duplicate");
                    resolve();
                }
            });
        }
        async function recombinedClass(maLop) {
            return new Promise(async (resolve, reject) => {
                let existClasses = [];
                await collection.find({ maLop: maLop }).forEach(e => existClasses.push(e));
                let length = existClasses.length;

                if (length == 0) {
                    //EXPLAIN: not exist, so insert failed
                    result.body.push(maLop + " insert failed");
                    resolve();

                } else if (length == 1) {
                    //EXPLAIN: insert success but only 1 buoiHoc
                    count++;
                    resolve();

                } else {
                    //EXPLAIN: insert success has >= 2 buoiHoc
                    count++;
                    let deletedResult = await collection.deleteMany({ maLop: maLop });
                    if (deletedResult.deletedCount == 0) {
                        result.body.push(maLop + " delete failed");
                        resolve();
                        return;
                    }
                    let combinedClass = existClasses.reduce((combined, eachClass, index) => {
                        if (index == 0) return combined;
                        let totalCacNhomThi = combined.thiCuoiKi;
                        let cacNhomThi = eachClass.thiCuoiKi;
                        for (let nhomThi of cacNhomThi) {
                            let nhomThiExist = false;
                            totalCacNhomThi.forEach((nhomThiMain, index) => {
                                if (nhomThiMain.name == nhomThi.name) {
                                    nhomThiExist = true;
                                    if (nhomThi._timestamp >= nhomThiMain._timestamp) {
                                        totalCacNhomThi[index] = nhomThi;
                                    }
                                }
                            });
                            if (!nhomThiExist) totalCacNhomThi.push(nhomThi);
                        }
                        return combined;
                    }, existClasses[0]);

                    delete combinedClass._id;
                    let insertResult = await collection.insertOne(combinedClass);
                    if (insertResult.insertedCount == 0) result.body.push(maLop + " reinsert failed");
                    resolve();
                }

            });
        }

        //SECTION: insert every
        await new Promise(async (resolve, reject) => {
            csv_helper.readAsync("./resource/" + csvName, (row) => {
                promises.push(insertClassFromRow(row));
            }, resolve);
        });
        await Promise.all(promises);

        //SECTION: combined duplicate
        promises = [];
        maLopSet.forEach((maLop) => {
            promises.push(recombinedClass(maLop));
        });
        await Promise.all(promises);

        result.body.push("Done: count=" + count);

    } catch (e) {
        log_helper.error(e);
        result.success = false;
        result.body = e;
    }
    releaseDatabase();

    log_helper.info("UpsertRegisterClass: " + JSON.stringify(result));
    let bodyReport = { micro: "register-preview", ...result };
    let urlReport = `${CONFIG.masterService.address}/api/micro/report`;

    axios.post(urlReport, bodyReport, { headers: { "auth": SECURITY.CURRENT_KEY } })
        .catch(log_helper.error);
}


process.on("exit", disconnectDatabase);
async function main() {
    loadConfig().then(() => {
        connectDatabase().then(() => {
            initServer().catch(log_helper.error);
        }).catch(log_helper.error);
    }).catch(log_helper.error);
}

main();
