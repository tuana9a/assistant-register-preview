import { Db, MongoClient } from 'mongodb';
import { CONFIG } from '../config/AppConfig';

class DbFactory {
    mongoClient: MongoClient;
    DB_REGISTER_CLASS: Db;
    DB_STUDENT_REGISTER: Db;

    async init() {
        let address = CONFIG.database.address;
        let username = CONFIG.database.username;
        let password = CONFIG.database.password;

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
        this.DB_REGISTER_CLASS = this.mongoClient.db(CONFIG.database.db_register_class);
        this.DB_STUDENT_REGISTER = this.mongoClient.db(CONFIG.database.db_student_register);
        console.log(' * database: ' + url);
    }
}

export const dbFactory = new DbFactory();
