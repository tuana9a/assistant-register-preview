const fs = require("fs");

const express = require("express");
const { MongoClient, Db } = require("mongodb");

const log_helper = require("./common/log-helper");


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
let databaseIntense = false;

async function connectDatabase() {
    return new Promise(async (resolve, reject) => {

        let username = encodeURIComponent(DATABASE_INFO.username);
        let password = encodeURIComponent(DATABASE_INFO.password);
        let address = DATABASE_INFO.address;
        let port = DATABASE_INFO.port;
        let authSource = DATABASE_INFO.authSource;
        let conectionString = `mongodb://${username}:${password}@${address}:${port}/?authSource=${authSource}`;

        mongoClient = new MongoClient(conectionString, { useUnifiedTopology: true });
        try {
            // Connect the client to the server
            await mongoClient.connect();
            // Establish and verify connection
            await mongoClient.db("admin").command({ ping: 1 });
            let databaseClient = mongoClient.db("register-preview");
            initQueryFunction(databaseClient);
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

/**
 * create query funciton after connect to db
 * @param {Db} databaseClient database
 */
function initQueryFunction(databaseClient) {
    dbFindClasses = async function (classIds = [], term = "") {
        let result = {
            success: true,
            body: [],
        };
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
    };
    dbCountClasses = async function (term = "") {
        let result = {
            success: true,
            body: -1
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
    };
    dbReformatClasses = async function (term = "") {
        let result = {
            success: true,
            body: -1
        }
        if (databaseIntense) {
            result.success = false;
            result.body = "database intense operating...";
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
                });
                promise.catch(log_helper.error);
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
    };
    dbFindDuplicate = async function (term = "") {
        let result = {
            success: true,
            body: {}
        }
        if (databaseIntense) {
            result.success = false;
            result.body = "database intense operating...";
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
            if (propValue == "null") {
                object[`${propName}`] = "";
            } else {
                object[`${propName}`] = propValue.trim().replace(/\s{2,}/g, " ");
            }
        }
    }
    return object;
}

async function dbFindClasses(classIds = [], term = "") {
}
async function dbCountClasses(term = "") {
}
async function dbReformatClasses(term = "") {
}
async function dbFindDuplicate(term = "") {
}

async function loadConfig() {
    return new Promise((resolve, reject) => {
        fs.readFile("config.json", "utf-8", (error, data) => {
            if (error) {
                reject(error);
                return;
            }
            try {
                let config = JSON.parse(data);
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
    app.get('/', function (req, resp) {
        resp.setHeader("Content-Type", "text/html;charset=utf-8");
        resp.write('<h1 style="font-family:cursive; text-align:center">Register Preview</h1>');
        resp.write('<h1 style="font-family:cursive; text-align:center">Hello World! 🙄</h1>');
        resp.end();
    });
    app.get('/api/public/find/Class', async function (req, resp) {
        let classIds = req.query.ids.trim().replace(/",\s*,/, ",").split(/\s*,\s*|\s+/);
        let term = req.query.term;

        let result = await dbFindClasses(classIds, term);
        if (!result.success) resp.status(500);

        resp.setHeader("Content-Type", "application/json; charset=utf-8");
        resp.write(JSON.stringify(result));
        resp.end();
    });
    app.get('/api/public/count/Class', async function (req, resp) {
        let term = req.query.term;

        let result = await dbCountClasses(term);
        if (!result.success) resp.status(500);

        resp.setHeader("Content-Type", "text/plain; charset=utf-8");
        resp.write(JSON.stringify(result));
        resp.end();
    });
    app.put('/api/admin/reformat/Class', async function (req, resp) {
        let term = req.query.term;

        let result = await dbReformatClasses(term);
        if (!result.success) resp.status(500);

        resp.setHeader("Content-Type", "text/plain; charset=utf-8");
        resp.write(JSON.stringify(result));
        resp.end();
    });
    app.get('/api/admin/duplicate/Class', async function (req, resp) {
        let term = req.query.term;

        let result = await dbFindDuplicate(term);
        if (!result.success) resp.status(500);

        resp.setHeader("Content-Type", "text/plain; charset=utf-8");
        resp.write(JSON.stringify(result));
        resp.end();
    })
    //TODO: upsert class
    //TODO: upsert exam

    return new Promise((resolve, reject) => {
        try {
            const server = app.listen(SERVER_INFO.port, function () {
                let host = server.address().address;
                let port = server.address().port;
                console.log("server start at http://%s:%s", host, port);
                resolve();
            });
            server.on("error", reject);
        } catch (e) {
            reject(e);
        }
    });
}


async function main() {
    loadConfig().then(() => {
        connectDatabase().then(() => {
            initServer().catch(log_helper.error);
        }).catch(log_helper.error);
    }).catch(log_helper.error);
}

main();


