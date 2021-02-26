import { Db } from 'mongodb';
import { LopHoc } from '../models/RegisterClass';
import { ResponseEntity } from '../models/ResponseEntity';
import { fromAnyToNumber } from '../utils/convert';

export class RegisterClassService {
    db: Db;
    busy: boolean;
    constructor(dbRegisterClass: Db) {
        this.db = dbRegisterClass;
    }

    imBusy() {
        this.busy = true;
    }
    imFree() {
        this.busy = false;
    }

    async findByTermAndIds(term: string, classIds: Array<number>) {
        let classes: Array<LopHoc> = [];
        let result = new ResponseEntity();
        try {
            let filter = { maLop: { $in: classIds } };
            await this.db
                .collection(`${term}-register-class`)
                .find(filter)
                .forEach((each: LopHoc) => classes.push(each));
            result.body = classes;
        } catch (e) {
            result.success = false;
            result.body = e;
        }
        return classes;
    }
    async findByTermAndIds_Regex(term: string, classIds: Array<number>) {
        let classes: Array<LopHoc> = [];
        let result = new ResponseEntity();
        try {
            let filter = {
                $or: classIds
                    .map((classId) => new RegExp(`${classId}.*`))
                    .map((regex) => {
                        let entry = { maLop: { $regex: regex } };
                        return entry;
                    })
            };
            await this.db
                .collection(`${term}-register-class`)
                .find(filter)
                .forEach((e) => classes.push(e));
            result.body = classes;
        } catch (e) {
            result.success = false;
            result.body = e;
        }
        return result;
    }
    async findDuplicate(term: string) {
        let classes: Array<number> = [];
        let result = new ResponseEntity();
        try {
            let maLopSet = new Set<any>();
            await this.db
                .collection(`${term}-register-class`)
                .find({})
                .forEach((classs: LopHoc) => {
                    if (maLopSet.has(classs.maLop)) {
                        classes.push(classs.maLop);
                    } else {
                        maLopSet.add(classs.maLop);
                    }
                });
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
            let collection = this.db.collection(`${term}-register-class`);
            for (let classs of classes) {
                collection.updateOne(
                    { maLop: classs.maLop },
                    { $set: { ...classs } },
                    { upsert: true }
                );
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
            let collection = this.db.collection(`${term}-register-class`);
            for (let classs of classes) {
                collection.updateOne(
                    { maLop: classs.maLop },
                    { $set: { thiGiuaKi: classs.thiGiuaKi } }
                );
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
            let collection = this.db.collection(`${term}-register-class`);
            for (let classs of classes) {
                collection.updateOne(
                    { maLop: classs.maLop },
                    { $set: { thiGiuaKi: classs.thiGiuaKi } }
                );
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
            let collection = this.db.collection(`${term}-register-class`);
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
            let collection = this.db.collection(`${term}-register-class`);
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
            let collection = this.db.collection(`${term}-register-class`);
            let operationResult = await collection.updateMany({}, { $set: { thiCuoiKi: [] } });
            result.body = 'count=' + operationResult.modifiedCount;
        } catch (e) {
            result.success = false;
            result.body = e;
        }
        return result;
    }
}
