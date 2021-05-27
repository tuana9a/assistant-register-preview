export class LopDangKy {
    maLop: number;
    maLopKem: number;
    loaiLop: string;
    maHocPhan: string;
    tenHocPhan: string;
    ghiChu: string;
    cacBuoiHoc: Array<LopDangKy.BuoiHoc> = [];
    thiGiuaKi: Array<LopDangKy.NhomThi> = [];
    thiCuoiKi: Array<LopDangKy.NhomThi> = [];
    constructor() {
        this.cacBuoiHoc = [];
        this.thiGiuaKi = [];
        this.thiCuoiKi = [];
    }

    addBuoiHoc(newBuoiHoc: LopDangKy.BuoiHoc) {
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

        if (!exist) this.cacBuoiHoc.push(newBuoiHoc);
    }
    addThiGiuaKi(newNhomThi: LopDangKy.NhomThi) {
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

        if (!exist) this.thiGiuaKi.push(newNhomThi);
    }
    addThiCuoiKi(newNhomThi: LopDangKy.NhomThi) {
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

        if (!exist) this.thiCuoiKi.push(newNhomThi);
    }
}
export namespace LopDangKy {
    export class BuoiHoc {
        name: string;
        thuHoc: string;
        phongHoc: string;
        thoiGianHoc: string;
        tuanHoc: string;
        _timestamp: number;
        constructor() {}
    }
    export class NhomThi {
        name: string;
        thuThi: string;
        ngayThi: string;
        kipThi: string;
        phongThi: string;
        tuanThi: string;
        _timestamp: number;
        constructor() {}
    }
}
