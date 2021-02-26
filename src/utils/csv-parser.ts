import fs from 'fs';
import csv from 'csv-parser';

export async function readCsvAsync(path: string, handler = (row: any) => {}) {
    return new Promise((resolve, reject) => {
        fs.createReadStream(path)
            .pipe(csv())
            .on('data', handler)
            .on('end', resolve)
            .on('error', reject);
    });
}
