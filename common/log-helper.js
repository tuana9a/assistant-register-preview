const fs = require("fs");

function timeFormat(date = new Date()) {
    let hour = date.getHours();
    let minute = date.getMinutes();
    let second = date.getSeconds();
    let timeString = (hour < 10 ? "0" : "") + hour + ":" + (minute < 10 ? "0" : "") + minute + ":" + (second < 10 ? "0" : "") + second;
    return timeString;
}
function dateFormate(date = new Date()) {
    let day = date.getDate();
    let month = date.getMonth() + 1;//EXPLAIN: range: 0-11
    let year = date.getFullYear();
    let dayString = year + "-" + (month < 10 ? "0" : "") + month + "-" + (day < 10 ? "0" : "") + day;
    return dayString;
}

async function info(data) {
    let now = new Date();
    let fileName = dateFormate(now) + ".log";
    let timeStamp = timeFormat(now);
    data = timeStamp + " [INFO] " + data + "\n";
    fs.appendFile("./logs/" + fileName, data, () => { });
}
async function error(data) {
    let now = new Date();
    let fileName = dateFormate(now) + ".log";
    let timeStamp = timeFormat(now);
    data = timeStamp + " [ERROR] " + data + "\n";
    fs.appendFile("./logs/" + fileName, data, () => { });
}
async function log(data) {
    let now = new Date();
    let fileName = dateFormate(now) + ".log";
    let timeStamp = timeFormat(now);
    data = timeStamp + " [LOG] " + data + "\n";
    fs.appendFile("./logs/" + fileName, data, () => { });
}

module.exports.info = info;
module.exports.error = error;
module.exports.log = log;
