const {MongoClient} = require('mongodb');

const url = 'mongodb://0.0.0.0:27017';
const client = new MongoClient(url);

const dbName = 'project-nosql';

async function main() {
    await client.connect();
    console.log('Connected successfully to server');

    const db = client.db(dbName);
    const collection = db.collection('products');

    return 'done';
}

main()
.then(console.log)
.catch(console.error)
.finally(() => client.close());
