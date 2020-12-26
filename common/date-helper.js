
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
function daysBetween(date1 = new Date(), date2 = new Date()) {
    return Math.abs(date1.getTime() - date2.getTime()) / 86_400_000;
}

module.exports.dateToDash = dateToDash;
module.exports.dashToDate = dashToDate;
module.exports.daysBetween = daysBetween;
