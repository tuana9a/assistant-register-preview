import { LopDangKy } from '../models/LopDangKy';
import { csvUtils } from '../utils/CsvUtils';
import { utils } from '../utils/Utils';

class LopDangKyCsvService {
    async getClassesFromCsv_BuoiHoc(filepath: string) {
        let classes = new Map<number, LopDangKy>();
        await csvUtils.readCsvAsync(filepath, function (row) {
            try {
                let maLop = utils.fromAnyToNumber(utils.reformatString(row['#maLop']));

                let buoiHoc = new LopDangKy.BuoiHoc();
                buoiHoc.name = utils.reformatString(row['#buoiHocSo']);
                buoiHoc.thuHoc = utils.reformatString(row['#thuHoc']);
                buoiHoc.phongHoc = utils.reformatString(row['#phongHoc']);
                buoiHoc.thoiGianHoc = utils.reformatString(row['#thoiGianHoc']);
                buoiHoc.tuanHoc = utils.reformatString(row['#tuanHoc']);
                buoiHoc._timestamp = Date.now();

                let lopHoc = new LopDangKy();
                lopHoc.maLop = maLop;
                lopHoc.maLopKem = utils.fromAnyToNumber(utils.reformatString(row['#maLopKem']));
                lopHoc.loaiLop = utils.reformatString(row['#loaiLop']);
                lopHoc.maHocPhan = utils.reformatString(row['#maHocPhan']);
                lopHoc.tenHocPhan = utils.reformatString(row['#tenHocPhan']);
                lopHoc.ghiChu = utils.reformatString(row['#ghiChu']);
                lopHoc.addBuoiHoc(buoiHoc);

                if (classes.has(maLop)) {
                    classes.get(maLop).addBuoiHoc(buoiHoc);
                } else {
                    classes.set(maLop, lopHoc);
                }
            } catch (e) {}
        });
        return classes;
    }
    async getClassesFromCsv_ThiCuoiKi(filepath: string) {
        let classes = new Map<number, LopDangKy>();
        await csvUtils.readCsvAsync(filepath, function (row) {
            try {
                let maLop = utils.fromAnyToNumber(utils.reformatString(row['#maLop']));

                let nhomThi = new LopDangKy.NhomThi();
                nhomThi.name = utils.reformatString(row['#tenNhom']);
                nhomThi.thuThi = utils.reformatString(row['#thuThi']);
                nhomThi.kipThi = utils.reformatString(row['#kipThi']);
                nhomThi.ngayThi = utils.reformatString(row['#ngayThi']);
                nhomThi.tuanThi = utils.reformatString(row['#tuanThi']);
                nhomThi.phongThi = utils.reformatString(row['#phongThi']);
                nhomThi._timestamp = Date.now();

                let lopHoc = new LopDangKy();
                lopHoc.maLop = maLop;
                lopHoc.addThiCuoiKi(nhomThi);

                if (classes.has(maLop)) {
                    classes.get(maLop).addThiCuoiKi(nhomThi);
                } else {
                    classes.set(maLop, lopHoc);
                }
            } catch (ignored) {}
        });
        return classes;
    }
    async getClassesFromCsv_ThiGiuaKi(filepath: string) {
        let classes = new Map<number, LopDangKy>();
        await csvUtils.readCsvAsync(filepath, function (row) {
            try {
                let maLop = utils.fromAnyToNumber(utils.reformatString(row['#maLop']));

                let nhomThi = new LopDangKy.NhomThi();
                nhomThi.name = utils.reformatString(row['#tenNhom']);
                nhomThi.thuThi = utils.reformatString(row['#thuThi']);
                nhomThi.kipThi = utils.reformatString(row['#kipThi']);
                nhomThi.ngayThi = utils.reformatString(row['#ngayThi']);
                nhomThi.tuanThi = utils.reformatString(row['#tuanThi']);
                nhomThi.phongThi = utils.reformatString(row['#phongThi']);
                nhomThi._timestamp = Date.now();

                let lopHoc = new LopDangKy();
                lopHoc.maLop = maLop;
                lopHoc.addThiGiuaKi(nhomThi);

                if (classes.has(maLop)) {
                    classes.get(maLop).addThiGiuaKi(nhomThi);
                } else {
                    classes.set(maLop, lopHoc);
                }
            } catch (ignored) {}
        });
        return classes;
    }
}

export const lopDangKyCsvService = new LopDangKyCsvService();
