"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterClassService = void 0;
const ResponseEntity_1 = require("../models/ResponseEntity");
var db;
class RegisterClassService {
    constructor(dbRegisterClass) {
        db = dbRegisterClass;
    }
    imBusy() {
        this.busy = true;
    }
    imFree() {
        this.busy = false;
    }
    async findClassesByTermAndIds_In(term, ids) {
        let classes = [];
        let result = new ResponseEntity_1.ResponseEntity();
        try {
            let filter = { maLop: { $in: ids } };
            await db
                .collection(`${term}-register-class`)
                .find(filter)
                .forEach((each) => classes.push(each));
            result.body = classes;
        }
        catch (e) {
            result.success = false;
            result.body = e;
        }
        return result;
    }
    async findClassesByTermAndIds_Near(term, ids) {
        let classes = [];
        let result = new ResponseEntity_1.ResponseEntity();
        try {
            let filters = {
                $or: ids.map((id) => {
                    let length = String(id).length;
                    let missing = 6 - length;
                    let filter = { maLop: id };
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
        }
        catch (e) {
            result.success = false;
            result.body = e;
        }
        return result;
    }
    async updateClasses(term, classes) {
        let result = new ResponseEntity_1.ResponseEntity();
        if (this.busy)
            return result;
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
        }
        catch (e) {
            result.success = false;
            result.body = e;
        }
        this.imFree();
        return result;
    }
    async updateClasses_MidExam(term, classes) {
        let result = new ResponseEntity_1.ResponseEntity();
        if (this.busy)
            return result;
        this.imBusy();
        try {
            let count = 0;
            let collection = db.collection(`${term}-register-class`);
            for (let classs of classes) {
                collection.updateOne({ maLop: classs.maLop }, { $set: { thiGiuaKi: classs.thiGiuaKi } });
                count++;
            }
            result.body = count;
        }
        catch (e) {
            result.success = false;
            result.body = e;
        }
        this.imFree();
        return result;
    }
    async updateClasses_EndExam(term, classes) {
        let result = new ResponseEntity_1.ResponseEntity();
        if (this.busy)
            return result;
        this.imBusy();
        try {
            let count = 0;
            let collection = db.collection(`${term}-register-class`);
            for (let classs of classes) {
                collection.updateOne({ maLop: classs.maLop }, { $set: { thiCuoiKi: classs.thiCuoiKi } });
                count++;
            }
            result.body = 'count=' + count;
        }
        catch (e) {
            result.success = false;
            result.body = e;
        }
        this.imFree();
        return result;
    }
    async deleteClasses(term) {
        let result = new ResponseEntity_1.ResponseEntity();
        try {
            let collection = db.collection(`${term}-register-class`);
            let operationResult = await collection.deleteMany({});
            result.body = 'count=' + operationResult.deletedCount;
        }
        catch (e) {
            result.success = false;
            result.body = e;
        }
        return result;
    }
    async deleteClasses_MidExam(term) {
        let result = new ResponseEntity_1.ResponseEntity();
        try {
            let collection = db.collection(`${term}-register-class`);
            let operationResult = await collection.updateMany({}, { $set: { thiGiuaKi: [] } });
            result.body = 'count=' + operationResult.modifiedCount;
        }
        catch (e) {
            result.success = false;
            result.body = e;
        }
        return result;
    }
    async deleteClasses_EndExam(term) {
        let result = new ResponseEntity_1.ResponseEntity();
        try {
            let collection = db.collection(`${term}-register-class`);
            let operationResult = await collection.updateMany({}, { $set: { thiCuoiKi: [] } });
            result.body = 'count=' + operationResult.modifiedCount;
        }
        catch (e) {
            result.success = false;
            result.body = e;
        }
        return result;
    }
}
exports.RegisterClassService = RegisterClassService;
//# sourceMappingURL=RegisterClassService.js.map