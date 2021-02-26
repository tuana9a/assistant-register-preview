export class SinhVien {
    mssv: number;
    hoTen: string;
    ngaySinh: string;
    dangKi: Array<SinhVien.DangKi>;
    _timestamp: number;

    constructor() {}

    addDangKi(dangKi: SinhVien.DangKi) {
        this.dangKi.push(dangKi);
    }
}
export namespace SinhVien {
    export class DangKi {
        maLop: number;
        maLopThi: number;
        nhom: string;

        constructor() {}
    }
}
