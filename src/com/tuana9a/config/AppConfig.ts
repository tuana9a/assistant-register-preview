import fs from 'fs';

var config = {
    server: {
        address: '',
        port: -1
    },
    worker: {
        name: '',
        ask: ['']
    },
    master: {
        address: ''
    },
    database: {
        db_student_register: '',
        db_register_class: '',
        address: '',
        username: '',
        password: ''
    },
    adapter: {
        lopDangKy: {
            buoiHoc: {
                name: 'Buổi_Học_Số',
                thuHoc: 'Thứ_Học',
                phongHoc: 'Phòng_Học',
                thoiGianHoc: 'Thời_Gian_Học',
                tuanHoc: 'Tuần_Học'
            },
            nhomThiGiuaKy: {
                name: 'Nhóm_Thi',
                thuThi: 'Thứ_Thi',
                kipThi: 'Kíp_Thi',
                ngayThi: 'Ngày_Thi',
                tuanThi: 'Tuần_Thi',
                phongThi: 'Phòng_Thi'
            },
            nhomThiCuoiKy: {
                name: 'Nhóm_Thi',
                thuThi: 'Thứ_Thi',
                kipThi: 'Kíp_Thi',
                ngayThi: 'Ngày_Thi',
                tuanThi: 'Tuần_Thi',
                phongThi: 'Phòng_Thi'
            },
            maLop: 'Mã_Lớp',
            maLopKem: 'Mã_Lớp_Kèm',
            loaiLop: 'Loại_Lớp',
            maHocPhan: 'Mã_HP',
            tenHocPhan: 'Tên_HP',
            ghiChu: 'Ghi_Chú'
        }
    }
};
config = JSON.parse(fs.readFileSync('resource/app-config.json', { flag: 'r', encoding: 'utf-8' }));

export const AppConfig = config;
