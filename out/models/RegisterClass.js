"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LopHoc = void 0;
class LopHoc {
    constructor() {
        this.cacBuoiHoc = [];
        this.thiGiuaKi = [];
        this.thiCuoiKi = [];
        this.cacBuoiHoc = [];
        this.thiGiuaKi = [];
        this.thiCuoiKi = [];
    }
    addBuoiHoc(newBuoiHoc) {
        let exist = false;
        this.cacBuoiHoc = this.cacBuoiHoc.map(function (existBuoiHoc) {
            //EXPLAIN: nếu cần cập nhật thì sẽ vào block trong cùng
            // nếu không mặc định sẽ trả về giá trị cũ
            if (existBuoiHoc.name == newBuoiHoc.name) {
                exist = true;
                if (newBuoiHoc._timestamp >= existBuoiHoc._timestamp) {
                    return newBuoiHoc;
                }
            }
            return existBuoiHoc;
        });
        if (!exist)
            this.cacBuoiHoc.push(newBuoiHoc);
    }
    addThiGiuaKi(newNhomThi) {
        let exist = false;
        this.thiGiuaKi = this.thiGiuaKi.map(function (existNhomThi) {
            //EXPLAIN: nếu cần cập nhật thì sẽ vào block trong cùng
            // nếu không mặc định sẽ trả về giá trị cũ
            if (existNhomThi.name == newNhomThi.name) {
                exist = true;
                if (newNhomThi._timestamp >= existNhomThi._timestamp) {
                    return newNhomThi;
                }
            }
            return existNhomThi;
        });
        if (!exist)
            this.thiGiuaKi.push(newNhomThi);
    }
    addThiCuoiKi(newNhomThi) {
        let exist = false;
        this.thiCuoiKi = this.thiCuoiKi.map(function (existNhomThi) {
            //EXPLAIN: nếu cần cập nhật thì sẽ vào block trong cùng
            // nếu không mặc định sẽ trả về giá trị cũ
            if (existNhomThi.name == newNhomThi.name) {
                exist = true;
                if (newNhomThi._timestamp >= existNhomThi._timestamp) {
                    return newNhomThi;
                }
            }
            return existNhomThi;
        });
        if (!exist)
            this.thiCuoiKi.push(newNhomThi);
    }
}
exports.LopHoc = LopHoc;
(function (LopHoc) {
    class BuoiHoc {
        constructor() { }
    }
    LopHoc.BuoiHoc = BuoiHoc;
    class NhomThi {
        constructor() { }
    }
    LopHoc.NhomThi = NhomThi;
})(LopHoc = exports.LopHoc || (exports.LopHoc = {}));
//# sourceMappingURL=RegisterClass.js.map