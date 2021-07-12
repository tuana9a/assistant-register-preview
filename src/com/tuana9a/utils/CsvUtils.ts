import fs from 'fs';
import csv from 'csv-parser';

class CsvUtils {
    async readCsvAsync(path: string, handler = function (row: any) {}) {
        return new Promise(function (resolve, reject) {
            fs.createReadStream(path).pipe(csv()).on('data', handler).on('end', resolve).on('error', reject);
        });
    }
}

export const csvUtils = new CsvUtils();
