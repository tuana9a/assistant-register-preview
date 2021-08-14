import { Db, MongoClient } from 'mongodb';
import { AppConfig } from '../config/AppConfig';

class DbFactory {
    mongoClient: MongoClient;
    DB_LOP_DANG_KY: Db;

    async init() {
        const connection_string = AppConfig.database.connection_string;
        this.mongoClient = new MongoClient(connection_string, { useNewUrlParser: true, useUnifiedTopology: true });
        await this.mongoClient.connect();
        await this.mongoClient.db('test').command({ ping: 1 }); // Establish and verify connection
        let db_lop_dang_ky = this.mongoClient.db(AppConfig.database.db_lop_dang_ky);
        this.DB_LOP_DANG_KY = db_lop_dang_ky;

        console.log(' * database: ' + connection_string);
    }
}

export const dbFactory = new DbFactory();
