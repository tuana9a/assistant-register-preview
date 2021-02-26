import { MongoClient } from 'mongodb';

export class MongoDB {
    mongoClient: MongoClient;

    async connect(connectionString: string) {
        this.mongoClient = new MongoClient(connectionString, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        await this.mongoClient.connect(); // Connect the client to the server
        await this.mongoClient.db('test').command({ ping: 1 }); // Establish and verify connection
        return this.mongoClient;
    }
    async disconnect() {
        if (this.mongoClient) {
            await this.mongoClient.close();
        }
    }

    db(dbName: string) {
        return this.mongoClient.db(dbName);
    }
}
