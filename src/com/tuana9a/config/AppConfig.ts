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
    }
};
config = JSON.parse(fs.readFileSync('resource/app-config.json', { flag: 'r', encoding: 'utf-8' }));

export const CONFIG = config;
