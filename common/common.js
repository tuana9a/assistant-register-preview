
const fs = require('fs');
const axios = require('axios');

async function download(url = "", path = "") {
    const outputStream = fs.createWriteStream(path);

    return axios({ method: 'GET', url: url, responseType: 'stream', }).then(response => {
        //ensure call `then()` only when the file has been downloaded entirely.
        return new Promise((resolve, reject) => {
            response.data.pipe(outputStream);
            let error = null;
            outputStream.on('error', e => {
                error = e;
                outputStream.close();
            });
            outputStream.on('finish', () => {
                outputStream.close();
            });
            outputStream.on('close', () => {
                resolve(error);
            });
        });
    });
}

module.exports.axios_download = download;
