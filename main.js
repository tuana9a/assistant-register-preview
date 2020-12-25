const fs = require("fs");
const express = require("express");

const serverInfo = {
    address: "",
    port: -1,
}
const databaseInfo = {
    address: "",
    port: "",
    username: "",
    password: "",
    authSource: "",
}

function dateToDash(date = new Date()) {
    let day = date.getDate();
    let month = date.getMonth() + 1;//EXPLAIN: range: 0-11
    let year = date.getFullYear();
    return (day < 10 ? "0" : "") + day + "/" + (month < 10 ? "0" : "") + month + '/' + year;
}
function dashToDate(dash = "") {
    try {
        let temp = dash.split("/");
        let day = temp[0];
        let month = temp[1];
        let year = temp[2];
        return new Date(`${month}/${day}/${year}`);
    } catch (e) {
        return undefined;
    }
}
function dayBetween(date1 = new Date(), date2 = new Date()) {
    return Math.abs(date1.getTime() - date2.getTime()) / 86_400_000;
}

//TODO: connect database

async function loadConfig() {
    return new Promise((resolve, reject) => {
        fs.readFile("config.json", "utf-8", (error, data) => {
            if (error) {
                reject(error);
                return;
            }
            try {
                let config = JSON.parse(data);
                serverInfo.address = config.server.address;
                serverInfo.port = config.server.port;

                databaseInfo.address = config.database.address;
                databaseInfo.port = config.database.port;
                databaseInfo.username = config.database.username;
                databaseInfo.password = config.database.password;
                databaseInfo.authSource = config.database.authSource;
                
            } catch (e) {
                reject(e);
            }
        });
    });
}
async function initServer() {
    const app = express();
    app.get('/', function (req, resp) {
        resp.write('<h1 style="font-family:cursive; text-align:center">Hello World! 😜</h1>');
        resp.end();
    });
    app.get('/api/public/Class', function (req, resp) {
        //TODO: class ids + term
        resp.end();
    });
    //TODO: upsert class
    //TODO: upsert exam
    //TODO: reformat

    return new Promise((resolve, reject) => {
        try {
            const server = app.listen(serverInfo.port, serverInfo.address, function () {
                let host = server.address().address;
                let port = server.address().port;
                console.log("server start at http://%s:%s", host, port);
                resolve();
            });
        } catch (e) {
            reject(e);
        }
    });
}


async function main() {
    loadConfig().then(() => {
        initServer();
        setInterval(updateSchoolInfo, 14_600);
    });
}

main()
