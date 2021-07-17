import { AppConfig } from '../config/AppConfig';
import { LopDangKy } from '../models/LopDangKy';
import { csvUtils } from '../utils/CsvUtils';
import { utils } from '../utils/Utils';

class CsvService {
    async getClasses_BuoiHoc(filepath: string) {
        let classes = new Map<number, LopDangKy>();
        await csvUtils.readCsvAsync(filepath, function (row) {
            try {
                let maLop = utils.fromAnyToNumber(utils.reformatString(row[AppConfig.adapter.lopDangKy.maLop]));

                let buoiHoc = new LopDangKy.BuoiHoc();
                buoiHoc.name = utils.reformatString(row[AppConfig.adapter.lopDangKy.buoiHoc.name]);
                buoiHoc.thuHoc = utils.reformatString(row[AppConfig.adapter.lopDangKy.buoiHoc.thuHoc]);
                buoiHoc.phongHoc = utils.reformatString(row[AppConfig.adapter.lopDangKy.buoiHoc.phongHoc]);
                buoiHoc.thoiGianHoc = utils.reformatString(row[AppConfig.adapter.lopDangKy.buoiHoc.thoiGianHoc]);
                buoiHoc.tuanHoc = utils.reformatString(row[AppConfig.adapter.lopDangKy.buoiHoc.tuanHoc]);
                buoiHoc._timestamp = Date.now();

                let lopHoc = new LopDangKy();
                lopHoc.maLop = maLop;
                lopHoc.maLopKem = utils.fromAnyToNumber(utils.reformatString(row[AppConfig.adapter.lopDangKy.maLop]));
                lopHoc.loaiLop = utils.reformatString(row[AppConfig.adapter.lopDangKy.loaiLop]);
                lopHoc.maHocPhan = utils.reformatString(row[AppConfig.adapter.lopDangKy.maHocPhan]);
                lopHoc.tenHocPhan = utils.reformatString(row[AppConfig.adapter.lopDangKy.tenHocPhan]);
                lopHoc.ghiChu = utils.reformatString(row[AppConfig.adapter.lopDangKy.ghiChu]);
                lopHoc.addBuoiHoc(buoiHoc);

                if (classes.has(maLop)) {
                    classes.get(maLop).addBuoiHoc(buoiHoc);
                } else {
                    classes.set(maLop, lopHoc);
                }
            } catch (e) {
                console.error(e);
            }
        });
        return classes;
    }
    async getClasses_ThiCuoiKi(filepath: string) {
        let classes = new Map<number, LopDangKy>();
        await csvUtils.readCsvAsync(filepath, function (row) {
            try {
                let maLop = utils.fromAnyToNumber(utils.reformatString(row[AppConfig.adapter.lopDangKy.maLop]));

                let nhomThi = new LopDangKy.NhomThi();
                nhomThi.name = utils.reformatString(row[AppConfig.adapter.lopDangKy.nhomThiCuoiKy.name]);
                nhomThi.thuThi = utils.reformatString(row[AppConfig.adapter.lopDangKy.nhomThiCuoiKy.thuThi]);
                nhomThi.kipThi = utils.reformatString(row[AppConfig.adapter.lopDangKy.nhomThiCuoiKy.kipThi]);
                nhomThi.ngayThi = utils.reformatString(row[AppConfig.adapter.lopDangKy.nhomThiCuoiKy.ngayThi]);
                nhomThi.tuanThi = utils.reformatString(row[AppConfig.adapter.lopDangKy.nhomThiCuoiKy.tuanThi]);
                nhomThi.phongThi = utils.reformatString(row[AppConfig.adapter.lopDangKy.nhomThiCuoiKy.phongThi]);
                nhomThi._timestamp = Date.now();

                let lopHoc = new LopDangKy();
                lopHoc.maLop = maLop;
                lopHoc.addThiCuoiKi(nhomThi);

                if (classes.has(maLop)) {
                    classes.get(maLop).addThiCuoiKi(nhomThi);
                } else {
                    classes.set(maLop, lopHoc);
                }
            } catch (e) {
                console.error(e);
            }
        });
        return classes;
    }
    async getClasses_ThiGiuaKi(filepath: string) {
        let classes = new Map<number, LopDangKy>();
        await csvUtils.readCsvAsync(filepath, function (row) {
            try {
                let maLop = utils.fromAnyToNumber(utils.reformatString(row[AppConfig.adapter.lopDangKy.maLop]));

                let nhomThi = new LopDangKy.NhomThi();
                nhomThi.name = utils.reformatString(row[AppConfig.adapter.lopDangKy.nhomThiGiuaKy.name]);
                nhomThi.thuThi = utils.reformatString(row[AppConfig.adapter.lopDangKy.nhomThiGiuaKy.thuThi]);
                nhomThi.kipThi = utils.reformatString(row[AppConfig.adapter.lopDangKy.nhomThiGiuaKy.kipThi]);
                nhomThi.ngayThi = utils.reformatString(row[AppConfig.adapter.lopDangKy.nhomThiGiuaKy.ngayThi]);
                nhomThi.tuanThi = utils.reformatString(row[AppConfig.adapter.lopDangKy.nhomThiGiuaKy.tuanThi]);
                nhomThi.phongThi = utils.reformatString(row[AppConfig.adapter.lopDangKy.nhomThiGiuaKy.phongThi]);
                nhomThi._timestamp = Date.now();

                let lopHoc = new LopDangKy();
                lopHoc.maLop = maLop;
                lopHoc.addThiGiuaKi(nhomThi);

                if (classes.has(maLop)) {
                    classes.get(maLop).addThiGiuaKi(nhomThi);
                } else {
                    classes.set(maLop, lopHoc);
                }
            } catch (e) {
                console.error(e);
            }
        });
        return classes;
    }
}

export const csvService = new CsvService();
