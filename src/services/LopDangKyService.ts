import { Db, FilterQuery } from 'mongodb';
import { LopDangKy } from '../models/LopDangKy';
import { ResponseEntity } from '../models/ResponseEntity';
import { dbFactory } from './DbFactory';

var db: Db = dbFactory.dbLopDangKy;

class LopDangKyService {
    busy: boolean;
    setBusy(value: boolean) {
        this.busy = value;
    }
    async findClassesByTermAndIds(term: string, ids: Array<number>, type: string) {
        let classes: Array<LopDangKy> = [];
        let filter: FilterQuery<any> = { maLop: -1 };
        switch (type) {
            case 'match':
                filter = { maLop: { $in: ids } };
                break;
            case 'near':
                filter = {
                    $or: ids.map((id) => {
                        let length = String(id).length;
                        let missing = 6 - length;
                        let filter: FilterQuery<any> = { maLop: id };
                        if (missing > 0) {
                            let delta = Math.pow(10, missing);
                            let gte = id * delta;
                            let lte = gte + delta;
                            filter = { maLop: { $gte: gte, $lte: lte } };
                        }
                        return filter;
                    })
                };
                break;
            default:
                break;
        }
        await db
            .collection(`${term}-register-class`)
            .find(filter)
            .forEach((each: LopDangKy) => classes.push(each));
        return ResponseEntity.builder().code(1).message('success').data(classes).build();
    }
    async updateClasses(term: string, classes: Array<LopDangKy>) {
        this.setBusy(true);
        let count = 0;
        let collection = db.collection(`${term}-register-class`);
        for (let classs of classes) {
            delete classs.thiGiuaKi;
            delete classs.thiCuoiKi;
            collection.updateOne({ maLop: classs.maLop }, { $set: { ...classs } }, { upsert: true });
            count++;
        }
        this.setBusy(false);
        return ResponseEntity.builder().code(1).message('success').data(count).build();
    }
    async updateClasses_MidExam(term: string, classes: Array<LopDangKy>) {
        this.setBusy(true);
        let count = 0;
        let collection = db.collection(`${term}-register-class`);
        for (let classs of classes) {
            collection.updateOne({ maLop: classs.maLop }, { $set: { thiGiuaKi: classs.thiGiuaKi } });
            count++;
        }
        this.setBusy(false);
        return ResponseEntity.builder().code(1).message('success').data(count).build();
    }
    async updateClasses_EndExam(term: string, classes: Array<LopDangKy>) {
        this.setBusy(true);
        let count = 0;
        let collection = db.collection(`${term}-register-class`);
        for (let classs of classes) {
            collection.updateOne({ maLop: classs.maLop }, { $set: { thiCuoiKi: classs.thiCuoiKi } });
            count++;
        }
        this.setBusy(false);
        return ResponseEntity.builder().code(1).message('success').data(count).build();
    }
    async deleteClasses(term: string) {
        let collection = db.collection(`${term}-register-class`);
        let operationResult = await collection.deleteMany({});
        let count = operationResult.deletedCount;
        return ResponseEntity.builder().code(1).message('success').data(count).build();
    }
    async deleteClasses_MidExam(term: string) {
        let collection = db.collection(`${term}-register-class`);
        let operationResult = await collection.updateMany({}, { $set: { thiGiuaKi: [] } });
        let count = operationResult.modifiedCount;
        return ResponseEntity.builder().code(1).message('success').data(count).build();
    }
    async deleteClasses_EndExam(term: string) {
        let collection = db.collection(`${term}-register-class`);
        let operationResult = await collection.updateMany({}, { $set: { thiCuoiKi: [] } });
        let count = operationResult.modifiedCount;
        return ResponseEntity.builder().code(1).message('success').data(count).build();
    }
}

export const lopDangKyService = new LopDangKyService();
