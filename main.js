const fs = require("fs");
const express = require("express");
const { MongoClient } = require("mongodb");

const log_helper = require("./common/log-helper");
const csv_helper = require("./common/csv-helper");
const date_helper = require("./common/date-helper");

const PATH_INFO = {
    uploadFolder: ""
}
const SERVER_INFO = {
    port: -1,
}
const DATABASE_INFO = {
    address: "",
    port: "",
    username: "",
    password: "",
    authSource: "",
}
let mongoClient;
let databaseClient;
let databaseIntense = false;


//SECTION: I/O
async function loadConfig() {
    return new Promise((resolve, reject) => {
        fs.readFile("config.json", "utf-8", (error, data) => {
            if (error) {
                reject(error);
                return;
            }
            try {
                let config = JSON.parse(data);

                PATH_INFO.uploadFolder = config.path.uploadFolder;

                SERVER_INFO.port = config.server.port;

                DATABASE_INFO.address = config.database.address;
                DATABASE_INFO.port = config.database.port;
                DATABASE_INFO.username = config.database.username;
                DATABASE_INFO.password = config.database.password;
                DATABASE_INFO.authSource = config.database.authSource;

                resolve();
            } catch (e) {
                reject(e);
            }
        });
    });
}
async function initServer() {
    const app = express();
    app.use(express.json());

    app.get('/', function (req, resp) {
        resp.setHeader("Content-Type", "text/html;charset=utf-8");
        resp.write('<h1 style="font-family:cursive; text-align:center">Register Preview</h1>');
        resp.write('<h1 style="font-family:cursive; text-align:center">Hello World! 🙄</h1>');
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

        let result = await dbCountAll(term);

        resp.setHeader("Content-Type", "application/json; charset=utf-8");
        resp.write(JSON.stringify(result));
        resp.end();
    });


    app.put('/api/admin/reformat/Class', async function (req, resp) {
        let term = req.query.term;

        let result = await dbReformatAll(term);

        resp.setHeader("Content-Type", "application/json; charset=utf-8");
        resp.write(JSON.stringify(result));
        resp.end();
    });
    app.get('/api/admin/duplicate/Class', async function (req, resp) {
        let term = req.query.term;

        let result = await dbFindDuplicate(term);

        resp.setHeader("Content-Type", "application/json; charset=utf-8");
        resp.write(JSON.stringify(result));
        resp.end();
    });
    app.delete('/api/admin/clear/Class', async function (req, resp) {
        let term = req.query.term;

        let result = await dbClearAll(term);

        resp.setHeader("Content-Type", "application/json; charset=utf-8");
        resp.write(JSON.stringify(result));
        resp.end();
    });


    app.post('/api/admin/upsert/RegisterClass', async function (req, resp) {
        // console.log(req.body);
        let term = req.body.term;
        let csvName = req.body.csvName;

        let result = await dbUpsertRegisterClass(term, csvName);

        resp.setHeader("Content-Type", "application/json; charset=utf-8");
        resp.write(JSON.stringify(result));
        resp.end();
    });
    app.put('/api/admin/upsert/ExamSchedule', async function (req, resp) {
        // console.log(req.body);
        let term = req.body.term;
        let startDayYear = req.body.startDayYear;
        let csvName = req.body.csvName;
        let whichExam = req.body.whichExam;
        let result = {};
        switch (whichExam) {
            case "mid":
                result = await dbUpsertExamSchedule(term, startDayYear, false, csvName);
                break;
            case "end":
                result = await dbUpsertExamSchedule(term, startDayYear, true, csvName);
                break;
            default:
                result.body = "unknow param whichExam";
                break;
        }
        resp.setHeader("Content-Type", "application/json; charset=utf-8");
        resp.write(JSON.stringify(result));
        resp.end();
    });

    return new Promise((resolve, reject) => {
        try {
            const server = app.listen(SERVER_INFO.port, function () {
                let port = server.address().port;
                console.log("server start at http://%s:%s", "127.0.0.1", port);
                resolve();
            });
            server.on("error", reject);
        } catch (e) {
            reject(e);
        }
    });
}
async function connectDatabase() {
    return new Promise(async (resolve, reject) => {

        let username = encodeURIComponent(DATABASE_INFO.username);
        let password = encodeURIComponent(DATABASE_INFO.password);
        let address = DATABASE_INFO.address;
        let port = DATABASE_INFO.port;
        let authSource = DATABASE_INFO.authSource;
        let conectionString = `mongodb://${username}:${password}@${address}:${port}/?authSource=${authSource}&poolSize=8`;

        mongoClient = new MongoClient(conectionString, { useUnifiedTopology: true });
        try {
            // Connect the client to the server
            await mongoClient.connect();
            // Establish and verify connection
            await mongoClient.db("admin").command({ ping: 1 });
            databaseClient = mongoClient.db("register-preview");
            // let result = await databaseClient.collection("").deleteMany({}); result.deletedCount;
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
    if (databaseIntense) {
        result.success = false;
        result.body = -1;
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
    if (databaseIntense) {
        result.success = false;
        result.body = "NOPE: database intense";
        return result;
    }
    try {
        let collection = databaseClient.collection(`${term}-register-class`);
        let cursor = collection.find();
        let reformatCount = 0;
        let promises = [];
        databaseIntense = true;
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
    databaseIntense = false;
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
    if (databaseIntense) {
        result.success = false;
        result.body = "NOPE: database intense";
        return result;
    }
    try {
        let collection = databaseClient.collection(`${term}-register-class`);
        let cursor = collection.find();
        let duplicateCount = 0;
        let duplicateCases = [];
        let promises = [];
        databaseIntense = true;
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
    databaseIntense = false;
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
    if (databaseIntense) {
        result.success = false;
        result.body = "NOPE: database intense";
        return result;
    }
    try {
        let collection = databaseClient.collection(`${term}-register-class`);
        databaseIntense = true;
        let deleteResult = await collection.deleteMany({});

        result.body.count = deleteResult.deletedCount;

    } catch (e) {
        log_helper.error(e);
        result.success = false;
        result.body = e;
    }
    databaseIntense = false;
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
        delete studyClass._id;

        let collection = databaseClient.collection(`${term}-register-class`);
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
    if (databaseIntense) {
        result.success = false;
        result.body = "NOPE: database intense";
        return result;
    }
    try {
        let promises = [];
        let maLopSet = new Set();

        await new Promise((resolve, reject) => {
            try {
                csv_helper.readAsync(PATH_INFO.uploadFolder + "/" + csvName, (row) => {
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

                            let insertResult = await dbInsertOne(term, {
                                ...lopHocNew,
                                cacBuoiHoc: [buoiHocNew],
                                thiGiuaKi: [],
                                thiCuoiKi: [],
                            });
                            if (!insertResult.success) {
                                result.body.push(insertResult);
                            }
                            resolve();

                        } catch (e) {
                            reject("MaLop: " + maLop + ", " + e);
                        }
                    }).catch(log_helper.error));
                }, resolve);
            } catch (e) {
                reject(e);
            }
        }).catch(log_helper.error);

        await Promise.all(promises);
        promises = [];

        let count = 0;
        maLopSet.forEach((maLop) => {
            promises.push(new Promise(async (resolve, reject) => {
                let findResult = await dbFindMany(term, [maLop]);
                let existClasses = findResult.body;
                // console.log(maLop + " " + existClasses.length + " " + JSON.stringify(existClasses[0]));

                switch (existClasses.length) {
                    case 0://EXPLAIN: not exist, so insert failed
                        result.body.push("Error: maLop: " + maLop + " insert failed");
                        break;
                    case 1://EXPLAIN: insert success but only 1 buoiHoc
                        count++;
                        break;
                    default://EXPLAIN: insert success has >= 2 buoiHoc
                        count++;
                        let deletedResult = await dbDeleteMany(term, maLop);
                        if (!deletedResult.success) {
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
                        let reinsertResult = await dbInsertOne(term, lopHocMain);
                        if (!reinsertResult.success) {
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
    if (databaseIntense) {
        result.success = false;
        result.body = "NOPE: database intense";
        return result;
    }
    try {
        let promises = [];
        let maLopSet = new Set();

        await new Promise((resolve, reject) => {
            try {
                csv_helper.readAsync(PATH_INFO.uploadFolder + "/" + csvName, (row) => {
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

                            let findResult = await dbFindMany(term, [maLop]);
                            let existClasses = findResult.body;

                            switch (existClasses.length) {
                                case 0://EXPLAIN: not exist, so update failed
                                    result.body.push("Error: maLop: " + maLop + " not exist");
                                    break;
                                case 1://EXPLAIN: success only 1 found
                                    maLopSet.add(maLop);
                                    let studyClass = existClasses[0];
                                    let insertEntry =
                                        end ? { ...studyClass, thiCuoiKi: [nhomThiNew] } : { ...studyClass, thiGiuaKi: [nhomThiNew] };

                                    let insertResult = await dbInsertOne(term, insertEntry);
                                    if (!insertResult.success) {
                                        result.body.push(insertResult);
                                    }
                                    break;
                                default://EXPLAIN: insert success has >= 2 buoiHoc
                                    result.body.push("Error: maLop: " + maLop + " duplicate");
                                    break;
                            }
                            resolve();

                        } catch (e) {
                            reject("MaLop: " + maLop + ", " + e);
                        }
                    }).catch(log_helper.error));
                }, resolve);

            } catch (e) {
                reject(e);
            }
        }).catch(log_helper.error);

        await Promise.all(promises);
        promises = [];

        let count = 0;
        maLopSet.forEach((maLop) => {
            promises.push(new Promise(async (resolve, reject) => {
                let findResult = await dbFindMany(term, [maLop]);
                let existClasses = findResult.body;
                // console.log(maLop + " " + existClasses.length + " " + JSON.stringify(existClasses[0]));

                switch (existClasses.length) {
                    case 0://EXPLAIN: not exist, so insert failed
                        result.body.push("Error: maLop: " + maLop + " insert failed");
                        break;
                    case 1://EXPLAIN: insert success but only 1 buoiHoc
                        count++;
                        break;
                    default://EXPLAIN: insert success has >= 2 buoiHoc
                        count++;
                        let deletedResult = await dbDeleteMany(term, maLop);
                        if (!deletedResult.success) {
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
                        let reinsertResult = await dbInsertOne(term, lopHocMain);
                        if (!reinsertResult.success) {
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
    return result;
}

async function main() {
    loadConfig().then(() => {
        connectDatabase().then(() => {
            initServer().catch(log_helper.error);
        }).catch(log_helper.error);
    }).catch(log_helper.error);
}

main();
