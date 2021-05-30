import { MongoClient } from 'mongodb';

export class DbConfig {
    address: string;
    username: string;
    password: string;
}

class DbFactory {
    mongoClient: MongoClient;
    async init(config: DbConfig) {
        let url = '';
        if (config.username == '') {
            url = `mongodb://${config.address}`;
        } else {
            // url = `mongodb+srv://${config.username}:${config.password}@${config.address}?retryWrites=true&w=majority`;
            url = `mongodb://${config.username}:${config.password}@${config.address}?retryWrites=true&w=majority`;
        }
        this.mongoClient = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });
        await this.mongoClient.connect();
        await this.mongoClient.db('test').command({ ping: 1 }); // Establish and verify connection
        console.log(' * database: ' + url);
    }
    getDb(name: string) {
        return this.mongoClient.db(name);
    }
}

export const dbFactory = new DbFactory();
