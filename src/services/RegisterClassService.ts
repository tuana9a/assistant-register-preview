import { Db, FilterQuery } from 'mongodb';
import { LopHoc } from '../models/RegisterClass';
import { ResponseEntity } from '../models/ResponseEntity';

var db: Db;

export class RegisterClassService {
    busy: boolean;
    constructor(dbRegisterClass: Db) {
        db = dbRegisterClass;
    }

    imBusy() {
        this.busy = true;
    }
    imFree() {
        this.busy = false;
    }

    async findClassesByTermAndIds_In(term: string, ids: Array<number>) {
        let classes: Array<LopHoc> = [];
        let result = new ResponseEntity();
        try {
            let filter = { maLop: { $in: ids } };
            await db
                .collection(`${term}-register-class`)
                .find(filter)
                .forEach((each: LopHoc) => classes.push(each));
            result.body = classes;
        } catch (e) {
            result.success = false;
            result.body = e;
        }
        return result;
    }
    async findClassesByTermAndIds_Near(term: string, ids: Array<number>) {
        let classes: Array<LopHoc> = [];
        let result = new ResponseEntity();
        try {
            let filters = {
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
            await db
                .collection(`${term}-register-class`)
                .find(filters)
                .forEach((e) => classes.push(e));
            result.body = classes;
        } catch (e) {
            result.success = false;
            result.body = e;
        }
        return result;
    }

    async updateClasses(term: string, classes: Array<LopHoc>) {
        let result = new ResponseEntity();
        if (this.busy) return result;
        this.imBusy();
        try {
            let count = 0;
            let collection = db.collection(`${term}-register-class`);
            for (let classs of classes) {
                delete classs.thiGiuaKi;
                delete classs.thiCuoiKi;
                collection.updateOne({ maLop: classs.maLop }, { $set: { ...classs } }, { upsert: true });
                count++;
            }
            result.body = count;
        } catch (e) {
            result.success = false;
            result.body = e;
        }
        this.imFree();
        return result;
    }
    async updateClasses_MidExam(term: string, classes: Array<LopHoc>) {
        let result = new ResponseEntity();
        if (this.busy) return result;
        this.imBusy();
        try {
            let count = 0;
            let collection = db.collection(`${term}-register-class`);
            for (let classs of classes) {
                collection.updateOne({ maLop: classs.maLop }, { $set: { thiGiuaKi: classs.thiGiuaKi } });
                count++;
            }
            result.body = count;
        } catch (e) {
            result.success = false;
            result.body = e;
        }
        this.imFree();
        return result;
    }
    async updateClasses_EndExam(term: string, classes: Array<LopHoc>) {
        let result = new ResponseEntity();
        if (this.busy) return result;
        this.imBusy();
        try {
            let count = 0;
            let collection = db.collection(`${term}-register-class`);
            for (let classs of classes) {
                collection.updateOne({ maLop: classs.maLop }, { $set: { thiCuoiKi: classs.thiCuoiKi } });
                count++;
            }
            result.body = 'count=' + count;
        } catch (e) {
            result.success = false;
            result.body = e;
        }
        this.imFree();
        return result;
    }

    async deleteClasses(term: string) {
        let result = new ResponseEntity();
        try {
            let collection = db.collection(`${term}-register-class`);
            let operationResult = await collection.deleteMany({});
            result.body = 'count=' + operationResult.deletedCount;
        } catch (e) {
            result.success = false;
            result.body = e;
        }
        return result;
    }
    async deleteClasses_MidExam(term: string) {
        let result = new ResponseEntity();
        try {
            let collection = db.collection(`${term}-register-class`);
            let operationResult = await collection.updateMany({}, { $set: { thiGiuaKi: [] } });
            result.body = 'count=' + operationResult.modifiedCount;
        } catch (e) {
            result.success = false;
            result.body = e;
        }
        return result;
    }
    async deleteClasses_EndExam(term: string) {
        let result = new ResponseEntity();
        try {
            let collection = db.collection(`${term}-register-class`);
            let operationResult = await collection.updateMany({}, { $set: { thiCuoiKi: [] } });
            result.body = 'count=' + operationResult.modifiedCount;
        } catch (e) {
            result.success = false;
            result.body = e;
        }
        return result;
    }
}
