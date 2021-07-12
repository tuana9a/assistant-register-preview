export class SinhVienDangKy {
    mssv: number;
    hoTen: string;
    ngaySinh: string;
    dangKi: Array<SinhVienDangKy.DangKy> = [];
    _timestamp: number;
    constructor() {
        this.dangKi = [];
    }

    addDangKy(dangKy: SinhVienDangKy.DangKy) {
        this.dangKi.push(dangKy);
    }
}
export namespace SinhVienDangKy {
    export class DangKy {
        maLop: number;
        maLopThi: number;
        nhom: string;
        constructor() {}
    }
}
