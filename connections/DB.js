const { MongoClient } = require("mongodb");
const { env } = require("process");

const URI = env.DB_URI;
const DB_NAME = env.DB_NAME;

let clientInstance = null;

const getClient = async () => {
    if (clientInstance) return clientInstance;

    clientInstance = new MongoClient(URI, {
        maxPoolSize: 50,
        minPoolSize: 10
    });

    await clientInstance.connect();
    console.log("MongoDB connected (pooling enabled)");
    return clientInstance;
};

const useCollection = async (collectionName, callback) => {
    const client = await getClient();
    const collection = client.db(DB_NAME).collection(collectionName);
    return await callback(collection);
};

module.exports = useCollection;
