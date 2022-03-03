const mongodb = require("mongodb");

const MongoClient = mongodb.MongoClient;

let database;
async function connectToDatabase() {
  const client = await MongoClient.connect(process.env.MONGODB_URI);
  database = client.db("online-shop");
}

function getDb() {
  if (!database) {
    throw new Error("You must first connect!");
  }
  return database;
}

module.exports = {
  connectToDatabase: connectToDatabase,
  getDb: getDb,
};
