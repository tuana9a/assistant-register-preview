
const fs = require("fs");
const express = require("express");
const axios = require("axios").default;
const { MongoClient } = require("mongodb");

const log_helper = require("./common/log-helper");
const csv_helper = require("./common/csv-helper");
const date_helper = require("./common/date-helper");

const INFO = {
    server: {
        port: -1
    },
    database: {
        address: "",
        port: "",
        username: "",
        password: "",
        authSource: "",
    },
    coreService: {
        address: "",
        resource: "",
    },
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


//SECTION: I/O
async function loadConfig() {
    return Promise.all([
        new Promise((resolve, reject) => {
            let whichConfig = process.argv[2] == "--local" ? "config-local.json" : "config.json";
            console.log("load config: " + whichConfig);
            fs.readFile(whichConfig, "utf-8", (error, data) => {
                let config = JSON.parse(data);
                INFO.coreService = config.coreService;
                INFO.server = config.server;
                INFO.database = config.database;
                INFO.ROOT_KEY = config.ROOT_KEY;
                resolve();
            });
        }),
    ]);
}
async function initServer() {
    const app = express();
    app.use(express.json());

    app.get('/', function (req, resp) {
        resp.end();
    });

    app.get('/api/public/find/Class', async function (req, resp) {
        let classIds = req.query.ids.trim().replace(/",\s*,/, ",").split(/\s*,\s*|\s+/);
        let term = req.query.term;

        let result = await dbFindMany(term, classIds);

        resp.setHeader("Content-Type", "application/json; charset=utf-8");
        resp.write(JSON.stringify(result));
        resp.end();
    });
    app.get('/api/public/count/Class', async function (req, resp) {
        let term = req.query.term;

        let response = { success: true, body: {} };
        resp.setHeader("Content-Type", "application/json; charset=utf-8");

        if (databaseIntense) {
            response.success = false;
            response.body = "database intense";
            resp.write(JSON.stringify(response));
            resp.end();
            return;
        }

        dbCountAll(term);
        response.body = "executing...";
        resp.write(JSON.stringify(response));
        resp.end();
    });

    app.post('/api/admin/duplicate/Class', async function (req, resp) {
        let body = req.body;
        let term = body.term;
        let auth = body.auth;

        let response = { success: true, body: {} };
        resp.setHeader("Content-Type", "application/json; charset=utf-8");

        if (databaseIntense) {
            response.success = false;
            response.body = "database intense";
            resp.write(JSON.stringify(response));
            resp.end();
            return;
        }

        if (auth != INFO.CURRENT_KEY) {
            response.success = false;
            response.body = "For Biden";
            resp.write(JSON.stringify(response));
            resp.end();
            return;
        }

        dbFindDuplicate(term);
        response.body = "executing...";
        resp.write(JSON.stringify(response));
        resp.end();
    });
    app.post('/api/admin/upsert/Class', async function (req, resp) {
        let body = req.body;
        let term = body.term;
        let csvName = body.csvName;
        let auth = body.auth;

        let response = { success: true, body: {} };
        resp.setHeader("Content-Type", "application/json; charset=utf-8");

        if (databaseIntense) {
            response.success = false;
            response.body = "database intense";
            resp.write(JSON.stringify(response));
            resp.end();
            return;
        }

        if (auth != INFO.CURRENT_KEY) {
            response.success = false;
            response.body = "For Biden";
            resp.write(JSON.stringify(response));
            resp.end();
            return;
        }

        dbUpsertRegisterClass(term, csvName);
        response.body = "executing...";
        resp.write(JSON.stringify(response));
        resp.end();
    });
    app.put('/api/microservice/CurrentKey', function (req, resp) {
        let body = req.body;
        let auth = body.auth;
        let newKey = body.newKey;
        if (auth == INFO.ROOT_KEY) {
            INFO.CURRENT_KEY = newKey;
        }
        resp.end();
    });

    app.put('/api/admin/reformat/Class', async function (req, resp) {
        let body = req.body;
        let term = body.term;
        let auth = body.auth;

        let response = { success: true, body: {} };
        resp.setHeader("Content-Type", "application/json; charset=utf-8");

        if (databaseIntense) {
            response.success = false;
            response.body = "database intense";
            resp.write(JSON.stringify(response));
            resp.end();
            return;
        }

        if (auth != INFO.CURRENT_KEY) {
            response.success = false;
            response.body = "For Biden";
            resp.write(JSON.stringify(response));
            resp.end();
            return;
        }

        dbReformatAll(term);
        response.body = "executing...";
        resp.write(JSON.stringify(response));
        resp.end();
    });
    app.put('/api/admin/upsert/MidExam', async function (req, resp) {
        let body = req.body;
        let term = body.term;
        let startDayYear = body.startDayYear;
        let csvName = body.csvName;
        let auth = body.auth;

        let response = { success: true, body: {} };
        resp.setHeader("Content-Type", "application/json; charset=utf-8");

        if (databaseIntense) {
            response.success = false;
            response.body = "database intense";
            resp.write(JSON.stringify(response));
            resp.end();
            return;
        }

        if (auth != INFO.CURRENT_KEY) {
            response.success = false;
            response.body = "For Biden";
            resp.write(JSON.stringify(response));
            resp.end();
            return;
        }

        dbUpsertExamSchedule(term, startDayYear, false, csvName);
        response.body = "executing...";
        resp.write(JSON.stringify(response));
        resp.end();
    });
    app.put('/api/admin/upsert/EndExam', async function (req, resp) {
        let body = req.body;
        let term = body.term;
        let startDayYear = body.startDayYear;
        let csvName = body.csvName;
        let auth = body.auth;

        let response = { success: true, body: {} };
        resp.setHeader("Content-Type", "application/json; charset=utf-8");

        if (databaseIntense) {
            response.success = false;
            response.body = "database intense";
            resp.write(JSON.stringify(response));
            resp.end();
            return;
        }

        if (auth != INFO.CURRENT_KEY) {
            response.success = false;
            response.body = "For Biden";
            resp.write(JSON.stringify(response));
            resp.end();
            return;
        }

        dbUpsertExamSchedule(term, startDayYear, true, csvName);
        response.body = "executing...";
        resp.write(JSON.stringify(response));
        resp.end();
    });

    app.put('/api/admin/clear/Class', async function (req, resp) {
        let body = req.body;
        let term = body.term;
        let auth = body.auth;

        let response = { success: true, body: {} };
        resp.setHeader("Content-Type", "application/json; charset=utf-8");

        if (databaseIntense) {
            response.success = false;
            response.body = "database intense";
            resp.write(JSON.stringify(response));
            resp.end();
            return;
        }

        if (auth != INFO.CURRENT_KEY) {
            response.success = false;
            response.body = "For Biden";
            resp.write(JSON.stringify(response));
            resp.end();
            return;
        }

        dbClearAll(term);
        response.body = "executing...";
        resp.write(JSON.stringify(response));
        resp.end();
    });
    app.put('/api/admin/clear/MidExam', async function (req, resp) {
        let body = req.body;
        let term = body.term;
        let auth = body.auth;

        let response = { success: true, body: {} };
        resp.setHeader("Content-Type", "application/json; charset=utf-8");

        if (databaseIntense) {
            response.success = false;
            response.body = "database intense";
            resp.write(JSON.stringify(response));
            resp.end();
            return;
        }

        if (auth != INFO.CURRENT_KEY) {
            response.success = false;
            response.body = "For Biden";
            resp.write(JSON.stringify(response));
            resp.end();
            return;
        }

        dbClearExamSchedule(term, false);
        response.body = "executing...";
        resp.write(JSON.stringify(response));
        resp.end();
    });
    app.put('/api/admin/clear/EndExam', async function (req, resp) {
        let body = req.body;
        let term = body.term;
        let auth = body.auth;

        let response = { success: true, body: {} };
        resp.setHeader("Content-Type", "application/json; charset=utf-8");

        if (databaseIntense) {
            response.success = false;
            response.body = "database intense";
            resp.write(JSON.stringify(response));
            resp.end();
            return;
        }

        if (auth != INFO.CURRENT_KEY) {
            response.success = false;
            response.body = "For Biden";
            resp.write(JSON.stringify(response));
            resp.end();
            return;
        }

        dbClearExamSchedule(term, true);
        response.body = "executing...";
        resp.write(JSON.stringify(response));
        resp.end();
    });


    return new Promise((resolve, reject) => {
        const server = app.listen(process.env.PORT || INFO.server.port, function () {
            let port = server.address().port;
            console.log("server start at http://%s:%s", "127.0.0.1", port);
            resolve();
        });
        server.on("error", reject);
    });
}
async function connectDatabase() {
    return new Promise(async (resolve, reject) => {

        let username = encodeURIComponent(INFO.database.username);
        let password = encodeURIComponent(INFO.database.password);
        let address = INFO.database.address;
        let port = INFO.database.port;
        let authSource = INFO.database.authSource;

        let url = "";
        if (process.argv[2] == "--local") {
            url = `mongodb://${username}:${password}@${address}:${port}/?authSource=${authSource}&poolSize=8`;
        } else {
            url = `mongodb+srv://${username}:${password}@${address}/register-preview?retryWrites=true&w=majority`;
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
async function downloadFile(url = "", outputPath = "") {
    const writer = fs.createWriteStream(outputPath);

    return axios({
        method: 'get',
        url: url,
        responseType: 'stream',
    }).then(response => {

        //ensure that the user can call `then()` only when the file has
        //been downloaded entirely.

        return new Promise((resolve, reject) => {
            response.data.pipe(writer);
            let error = null;
            writer.on('error', err => {
                error = err;
                writer.close();
                reject(err);
            });
            writer.on('close', () => {
                if (!error) {
                    resolve(true);
                }
                //no need to call the reject here, as it will have been called in the
                //'error' stream;
            });
        });
    });
}


//SECTION: main app service
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

async function dbFindMany(term = "", classIds = []) {
    let result = {
        success: true,
        body: [],
    };
    if (term == undefined || term == "" || term.search(/^\d+.+$/) == -1) {
        result.success = false;
        result.body = "Error: Parameter: term: " + term;
        return result;
    }
    if (databaseIntense) {
        result.success = false;
        result.body = [];
        return result;
    }
    try {
        let query = {
            $or: classIds.map(e => {
                return {
                    maLop: e,
                }
            }),
        };
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
async function dbCountAll(term = "") {
    let result = {
        success: true,
        body: -1
    }
    if (term == undefined || term == "" || term.search(/^\d+.+$/) == -1) {
        result.success = false;
        result.body = "Error: Parameter: term: " + term;
        return result;
    }
    try {
        let count = await databaseClient.collection(`${term}-register-class`).countDocuments();
        result.body = count;

    } catch (e) {
        log_helper.error(e);
        result.success = false;
        result.body = e;
    }
    return result;
}


//SECTION: lock, release database
async function dbReformatAll(term = "") {
    let result = {
        success: true,
        body: -1
    }
    if (term == undefined || term == "" || term.search(/^\d+.+$/) == -1) {
        result.success = false;
        result.body = "Error: Parameter: term: " + term;
        return result;
    }
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
    return result;
}
async function dbFindDuplicate(term = "") {
    let result = {
        success: true,
        body: {}
    }
    if (term == undefined || term == "" || term.search(/^\d+.+$/) == -1) {
        result.success = false;
        result.body = "Error: Parameter: term: " + term;
        return result;
    }
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
    return result;
}
async function dbClearExamSchedule(term = "", end = true) {
    let result = {
        success: true,
        body: -1
    }
    if (term == undefined || term == "" || term.search(/^\d+.+$/) == -1) {
        result.success = false;
        result.body = "Error: Parameter: term: " + term;
        return result;
    }
    lockDatabase();
    try {
        let collection = databaseClient.collection(`${term}-register-class`);
        let cursor = collection.find();
        let count = 0;
        let promises = [];
        await cursor.forEach(async (studyClass) => {
            let maLop = studyClass.maLop;
            let promise = new Promise((resolve, reject) => {
                try {
                    let filter = { maLop: maLop };
                    let update = { $set: end ? { thiCuoiKi: [] } : { thiGiuaKi: [] } };
                    collection.updateMany(filter, update, (err, result) => {
                        if (err) {
                            reject("MaLop: " + maLop + ", " + err);
                            return;
                        }
                        count += result.matchedCount;
                        resolve();
                    });
                } catch (e) {
                    reject("MaLop: " + maLop + ", " + e);
                }
            }).catch(log_helper.error);
            promises.push(promise);
        });
        await Promise.all(promises);
        result.body = count;

    } catch (e) {
        log_helper.error(e);
        result.success = false;
        result.body = e;
    }
    releaseDatabase();
    return result;
}
async function dbClearAll(term = "") {
    let result = {
        success: true,
        body: {}
    }
    if (term == undefined || term == "" || term.search(/^\d+.+$/) == -1) {
        result.success = false;
        result.body = "Error: Parameter: term: " + term;
        return result;
    }
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
    return result;
}

async function dbInsertOne(term = "", studyClass = {}) {
    let result = {
        success: true,
        body: {}
    }
    if (term == undefined || term == "" || term.search(/^\d+.+$/) == -1) {
        result.success = false;
        result.body = "Error: Parameter: term: " + term;
        return result;
    }
    if (databaseIntense) {
        result.success = false;
        result.body = "NOPE: database intense";
        return result;
    }
    try {
        let collection = databaseClient.collection(`${term}-register-class`);

        delete studyClass._id;
        let insertResult = await collection.insertOne(studyClass);

        result.body.insertedId = insertResult.insertedId;
        result.body.count = insertResult.insertedCount;

    } catch (e) {
        log_helper.error(e);
        result.success = false;
        result.body = e;
    }
    return result;
}
async function dbUpdateMany(term = "", maLop = "", studyClass = {}) {
    let result = {
        success: true,
        body: {}
    }
    if (term == undefined || term == "" || term.search(/^\d+.+$/) == -1) {
        result.success = false;
        result.body = "Error: Parameter: term: " + term;
        return result;
    }
    if (maLop == undefined || maLop == "" || maLop.search(/^\d+$/) == -1) {
        result.success = false;
        result.body = "Error: Parameter: maLop: " + maLop;
        return result;
    }
    if (databaseIntense) {
        result.success = false;
        result.body = "NOPE: database intense";
        return result;
    }
    try {
        delete studyClass._id;

        let collection = databaseClient.collection(`${term}-register-class`);
        let updateResult = await collection.updateMany({ maLop: maLop }, { $set: { ...studyClass } });

        result.body.count = updateResult.matchedCount;

    } catch (e) {
        log_helper.error(e);
        result.success = false;
        result.body = e;
    }
    return result;
}
async function dbDeleteMany(term = "", maLop = "") {
    let result = {
        success: true,
        body: {}
    }
    if (term == undefined || term == "" || term.search(/^\d+.+$/) == -1) {
        result.success = false;
        result.body = "Error: Parameter: term: " + term;
        return result;
    }
    if (maLop == undefined || maLop == "" || maLop.search(/^\d+$/) == -1) {
        result.success = false;
        result.body = "Error: Parameter: maLop: " + maLop;
        return result;
    }
    if (databaseIntense) {
        result.success = false;
        result.body = "NOPE: database intense";
        return result;
    }
    try {
        let collection = databaseClient.collection(`${term}-register-class`);
        let deleteResult = await collection.deleteMany({ maLop: maLop });

        result.body.count = deleteResult.deletedCount;

    } catch (e) {
        log_helper.error(e);
        result.success = false;
        result.body = e;
    }
    return result;
}


//SECTION: lock, release database
async function dbUpsertRegisterClass(term, csvName) {
    let result = {
        success: true,
        body: []
    }
    if (term == undefined || term == "" || term.search(/^\d+.+$/) == -1) {
        result.success = false;
        result.body = "Error: Parameter: term: " + term;
        return result;
    }
    if (csvName == undefined || csvName == "" || csvName.search(/^\d+.+-register-class.csv$/) == -1) {
        result.success = false;
        result.body = "Error: Parameter: csvName: " + csvName;
        return result;
    }
    lockDatabase();
    try {
        let promises = [];
        let maLopSet = new Set();
        let collection = databaseClient.collection(`${term}-register-class`);

        let coreService = INFO.coreService;
        let url = `${coreService.address}${coreService.resource}?path=/register-preview/${csvName}`;
        await downloadFile(url, "./resource/" + csvName);

        await new Promise(async (resolve, reject) => {
            csv_helper.readAsync("./resource/" + csvName, (row) => {
                promises.push(new Promise(async (resolve, reject) => {
                    try {
                        let maLop = reformatString(row["#maLop"]);
                        let buoiHocSo = reformatString(row["#buoiHocSo"]);

                        maLopSet.add(maLop);

                        let lopHocNew = {
                            maLop: maLop,
                            loaiLop: row["#loaiLop"],
                            maHocPhan: row["#maHocPhan"],
                            tenHocPhan: row["#tenHocPhan"],
                            ghiChu: row["#ghiChu"]
                        };
                        let buoiHocNew = {
                            name: buoiHocSo,
                            thuHoc: row["#thuHoc"],
                            phongHoc: row["#phongHoc"],
                            thoiGianHoc: row["#thoiGianHoc"],
                            tuanHoc: row["#tuanHoc"],
                            _timestamp: Date.now()
                        };

                        delete lopHocNew._id;
                        let insertResult = await collection.insertOne({
                            ...lopHocNew,
                            cacBuoiHoc: [buoiHocNew],
                            thiGiuaKi: [],
                            thiCuoiKi: [],
                        });
                        if (insertResult.insertedCount == 0) {
                            result.body.push(insertResult);
                        }
                        resolve();

                    } catch (e) {
                        reject("MaLop: " + maLop + ", " + e);
                    }
                }).catch(log_helper.error));
            }, resolve);
        }).catch(log_helper.error);

        await Promise.all(promises);
        promises = [];

        let count = 0;
        maLopSet.forEach((maLop) => {
            promises.push(new Promise(async (resolve, reject) => {
                let existClasses = [];
                await collection.find({ maLop: maLop }).forEach(e => {
                    existClasses.push(e);
                });

                switch (existClasses.length) {
                    case 0://EXPLAIN: not exist, so insert failed
                        result.body.push("Error: maLop: " + maLop + " insert failed");
                        break;
                    case 1://EXPLAIN: insert success but only 1 buoiHoc
                        count++;
                        break;
                    default://EXPLAIN: insert success has >= 2 buoiHoc
                        count++;
                        let deletedResult = await collection.deleteMany({ maLop: maLop });
                        if (deletedResult.deletedCount == 0) {
                            result.body.push("Error: maLop: " + maLop + " delete to combine failed");
                            break;
                        }
                        let lopHocMain = existClasses.reduce((total, lopHoc, index) => {
                            if (index == 0) return total;
                            for (let buoiHoc of lopHoc.cacBuoiHoc) {
                                let buoiHocExist = false;
                                total.cacBuoiHoc.forEach((buoiHocMain, index) => {
                                    if (buoiHocMain.name == buoiHoc.name) {
                                        buoiHocExist = true;
                                        if (buoiHoc._timestamp >= buoiHocMain._timestamp) {
                                            total.cacBuoiHoc[index] = buoiHoc;
                                        }
                                    }
                                });
                                if (!buoiHocExist) total.cacBuoiHoc.push(buoiHoc);
                            }
                            return total;
                        }, existClasses[0]);

                        delete lopHocMain._id;
                        let reinsertResult = await collection.insertOne(lopHocMain);
                        if (reinsertResult.insertedCount == 0) {
                            result.body.push("Error: maLop: " + maLop + " insert after combine failed");
                            break;
                        }
                        break;
                }

                resolve();
            }));
        });

        await Promise.all(promises);
        result.body.push("Done: count=" + count);

    } catch (e) {
        log_helper.error(e);
        result.success = false;
        result.body = e;
    }
    releaseDatabase();
    return result;
}
async function dbUpsertExamSchedule(term, startDayYear, end = false, csvName) {
    let result = {
        success: true,
        body: []
    }
    if (term == undefined || term == "" || term.search(/^\d+.+$/) == -1) {
        result.success = false;
        result.body = "Error: Parameter: term: " + term;
        return result;
    }
    if (csvName == undefined || csvName == "" || csvName.search(/^\d+.+-(mid|end)-exam.csv$/) == -1) {
        result.success = false;
        result.body = "Error: Parameter: csvName: " + csvName;
        return result;
    }
    lockDatabase();
    try {
        let promises = [];
        let maLopSet = new Set();
        let collection = databaseClient.collection(`${term}-register-class`);

        let coreService = INFO.coreService;
        let url = `${coreService.address}${coreService.resource}?path=/register-preview/${csvName}`;
        await downloadFile(url, "./resource/" + csvName);

        await new Promise(async (resolve, reject) => {
            csv_helper.readAsync("./resource/" + csvName, (row) => {
                promises.push(new Promise(async (resolve, reject) => {
                    try {
                        let maLop = reformatString(row["#maLop"]);
                        let tenNhom = reformatString(row["#tenNhom"]);
                        let tuanThiEnd = row["#tuanThi"];
                        let tuanThiMid = "T" + date_helper.weeksFromTo(date_helper.dashToDate(startDayYear), date_helper.dotToDate(row["#ngayThi"]));

                        let lopHocNew = {
                            maLop: maLop,
                            maHocPhan: row["#maHocPhan"],
                            tenHocPhan: row["#tenHocPhan"],
                            ghiChu: row["#ghiChu"]
                        };
                        let nhomThiNew = {
                            name: tenNhom,
                            thuThi: row["#thuThi"],
                            ngayThi: row["#ngayThi"],
                            kipThi: row["#kipThi"],
                            phongThi: row["#phongThi"],
                            tuanThi: end ? tuanThiEnd : tuanThiMid,
                            _timestamp: Date.now()
                        };

                        let existClasses = [];
                        await collection.find({ maLop: maLop }).forEach(e => {
                            existClasses.push(e);
                        });

                        switch (existClasses.length) {
                            case 0://EXPLAIN: not exist, so update failed
                                result.body.push("Error: maLop: " + maLop + " not exist");
                                break;
                            case 1://EXPLAIN: success only 1 found
                                maLopSet.add(maLop);
                                let studyClass = existClasses[0];
                                let insertEntry = end ? { ...studyClass, thiCuoiKi: [nhomThiNew] } : { ...studyClass, thiGiuaKi: [nhomThiNew] };

                                delete insertEntry._id;
                                let insertResult = await collection.insertOne(insertEntry);
                                if (insertResult.insertedCount == 0) {
                                    result.body.push(insertResult);
                                }
                                break;
                            default://EXPLAIN: insert success has >= 2 buoiHoc
                                result.body.push("Error: maLop: " + maLop + " duplicate");
                                break;
                        }
                        resolve();

                    } catch (e) {
                        reject("MaLop: " + row["#maLop"] + ", " + e);
                    }
                }).catch(log_helper.error));
            }, resolve);
        }).catch(log_helper.error);

        await Promise.all(promises);
        promises = [];

        let count = 0;
        maLopSet.forEach((maLop) => {
            promises.push(new Promise(async (resolve, reject) => {
                let existClasses = [];
                await collection.find({ maLop: maLop }).forEach(e => {
                    existClasses.push(e);
                });

                switch (existClasses.length) {
                    case 0://EXPLAIN: not exist, so insert failed
                        result.body.push("Error: maLop: " + maLop + " insert failed");
                        break;
                    case 1://EXPLAIN: insert success but only 1 buoiHoc
                        count++;
                        break;
                    default://EXPLAIN: insert success has >= 2 buoiHoc
                        count++;
                        let deletedResult = await collection.deleteMany({ maLop: maLop });
                        if (deletedResult.deletedCount == 0) {
                            result.body.push("Error: maLop: " + maLop + " delete to combine failed");
                            break;
                        }
                        let lopHocMain = existClasses.reduce((total, lopHoc, index) => {
                            if (index == 0) return total;
                            let totalCacNhomThi = end ? total.thiCuoiKi : total.thiGiuaKi;
                            let cacNhomThi = end ? lopHoc.thiCuoiKi : lopHoc.thiGiuaKi;
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
                            return total;
                        }, existClasses[0]);

                        delete lopHocMain._id;
                        let reinsertResult = await collection.insertOne(lopHocMain);
                        if (reinsertResult.insertedCount == 0) {
                            result.body.push("Error: maLop: " + maLop + " insert after combine failed");
                            break;
                        }
                        break;
                }

                resolve();
            }));
        });

        await Promise.all(promises);
        result.body.push("Done: count=" + count);

    } catch (e) {
        log_helper.error(e);
        result.success = false;
        result.body = e;
    }
    releaseDatabase();
    return result;
}


async function main() {
    loadConfig().then(() => {
        connectDatabase().then(() => {
            initServer().catch(log_helper.error);
            process.on("exit", disconnectDatabase);
        }).catch(log_helper.error);
    }).catch(log_helper.error);
}

main();
