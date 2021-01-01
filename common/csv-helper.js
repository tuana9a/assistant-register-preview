const fs = require('fs');
const csv = require('csv-parser');

/**
 * read csv and handle when reading it
 * @param {String} path path to file
 * @param {Function} rowHandler handle for each row
 * @param {Function} endHandler handle when nothing to read
 */
async function readAsync(path, rowHandler = async (row) => { }, endHandler = async () => { }) {
    fs.createReadStream(path).pipe(csv()).on('data', rowHandler).on('end', endHandler);
}

module.exports.readAsync = readAsync;