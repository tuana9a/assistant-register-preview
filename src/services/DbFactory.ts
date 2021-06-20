import { Db, MongoClient } from 'mongodb';
import { CONFIG } from '../config/AppConfig';

class DbFactory {
    mongoClient: MongoClient;
    DB_REGISTER_CLASS: Db;
    DB_STUDENT_REGISTER: Db;

    async init() {
        let address = CONFIG.DATABASE.ADDRESS;
        let username = CONFIG.DATABASE.USERNAME;
        let password = CONFIG.DATABASE.PASSWORD;

        let url = '';
        if (username == '') {
            url = `mongodb://${address}`;
        } else {
            // url = `mongodb+srv://${username}:${password}@${address}?retryWrites=true&w=majority`;
            url = `mongodb://${username}:${password}@${address}?retryWrites=true&w=majority`;
        }
        this.mongoClient = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });
        await this.mongoClient.connect();
        await this.mongoClient.db('test').command({ ping: 1 }); // Establish and verify connection
        this.DB_REGISTER_CLASS = this.mongoClient.db(CONFIG.DATABASE.DB_REGISTER_CLASS);
        this.DB_STUDENT_REGISTER = this.mongoClient.db(CONFIG.DATABASE.DB_STUDENT_REGISTER);
        console.log(' * database: ' + url);
    }
}

export const dbFactory = new DbFactory();
