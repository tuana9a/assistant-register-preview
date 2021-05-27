import { Db, MongoClient } from 'mongodb';
import { app } from '../main';

class DbFactory {
    mongoClient: MongoClient;
    dbLopDangKy: Db;
    dbSinhVienDangKy: Db;
    async init() {
        let username = encodeURIComponent(app.getConfig('database.username'));
        let password = encodeURIComponent(app.getConfig('database.password'));
        let address = app.getConfig('database.address');

        let url = `mongodb://${address}`;
        // let url = `mongodb+srv://${username}:${password}@${address}?retryWrites=true&w=majority`;

        this.mongoClient = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });
        await this.mongoClient.connect();
        await this.mongoClient.db('test').command({ ping: 1 }); // Establish and verify connection
        console.log(' * database: ' + url);

        this.dbLopDangKy = this.mongoClient.db('register-class');
        this.dbSinhVienDangKy = this.mongoClient.db('student-register');
    }
}

export const dbFactory = new DbFactory();
