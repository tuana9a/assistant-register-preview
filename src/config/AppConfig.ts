import fs from 'fs';

let config = {
    server: {
        address: '',
        port: -1
    },
    database: {
        db_lop_dang_ky: '',
        connection_string: ''
    },
    adapter: {
        lopDangKy: {
            buoi_hoc_so: '',
            thu_hoc: '',
            phong_hoc: '',
            thoi_gian_hoc: '',
            tuan_hoc: '',
            ma_lop: '',
            ma_lop_kem: '',
            loai_lop: '',
            ma_hoc_phan: '',
            ten_hoc_phan: '',
            ghi_chu: ''
        }
    },
    mongodb: {
        read: {
            limit: 1
        },
        write: {
            batch_size: 1
        }
    },
    path: {
        resource_dir: 'resource/',
        logs_dir: 'logs/'
    }
};
config = JSON.parse(fs.readFileSync('resource/app-config.json', { flag: 'r', encoding: 'utf-8' }));

export const AppConfig = config;
