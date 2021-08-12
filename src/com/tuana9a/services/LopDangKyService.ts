import { LopDangKy } from '../models/LopDangKy';
import { dbFactory } from './DbFactory';
import { csvUtils } from '../utils/CsvUtils';
import { AppConfig } from '../config/AppConfig';
import { utils } from '../utils/Utils';

class LopDangKyService {
    async findMany(term: string, filter = { ma_lop: -1 }) {
        const db = dbFactory.DB_LOP_DANG_KY;
        let result: Array<LopDangKy> = [];

        await db
            .collection(term)
            .find(filter)
            .limit(AppConfig.mongodb.read.limit)
            .forEach((each: LopDangKy) => result.push(each));
        return result;
    }
    async insertMany(term: string, filepath: string) {
        const db = dbFactory.DB_LOP_DANG_KY;
        let count = 0;
        let crash = false;
        let batch: LopDangKy[] = [];

        await csvUtils.readCsvAsync(filepath, async function (row) {
            if (crash) return;
            try {
                let lopDangKy = new LopDangKy();

                lopDangKy.ma_lop = utils.fromAnyToNumber(utils.reformatString(row[AppConfig.adapter.lopDangKy.ma_lop]));
                lopDangKy.buoi_hoc_so = utils.fromAnyToNumber(utils.reformatString(row[AppConfig.adapter.lopDangKy.buoi_hoc_so]));

                lopDangKy.thu_hoc = utils.reformatString(row[AppConfig.adapter.lopDangKy.thu_hoc]);
                lopDangKy.phong_hoc = utils.reformatString(row[AppConfig.adapter.lopDangKy.phong_hoc]);
                lopDangKy.thoi_gian_hoc = utils.reformatString(row[AppConfig.adapter.lopDangKy.thoi_gian_hoc]);
                lopDangKy.tuan_hoc = utils.reformatString(row[AppConfig.adapter.lopDangKy.tuan_hoc]);

                lopDangKy.ma_lop_kem = utils.fromAnyToNumber(utils.reformatString(row[AppConfig.adapter.lopDangKy.ma_lop]));
                lopDangKy.loai_lop = utils.reformatString(row[AppConfig.adapter.lopDangKy.loai_lop]);
                lopDangKy.ma_hoc_phan = utils.reformatString(row[AppConfig.adapter.lopDangKy.ma_hoc_phan]);
                lopDangKy.ten_hoc_phan = utils.reformatString(row[AppConfig.adapter.lopDangKy.ten_hoc_phan]);
                lopDangKy.ghi_chu = utils.reformatString(row[AppConfig.adapter.lopDangKy.ghi_chu]);

                lopDangKy._timestamp = Date.now();
                batch.push(lopDangKy);
            } catch (e) {
                console.error(e);
                crash = true;
            }
        });
        if (batch.length > 0) {
            let result = await db.collection(term).insertMany(batch);
            count += result.insertedCount;
        }
        console.log(`inserted: ${count}`);
        return count;
    }
    async deleteMany(term: string, filter = {}) {
        const db = dbFactory.DB_LOP_DANG_KY;
        let result = await db.collection(term).deleteMany(filter);
        let count = result.deletedCount;
        return count;
    }
}

export const lopDangKyService = new LopDangKyService();
