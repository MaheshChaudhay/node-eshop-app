const expressSession = require("express-session");
const mongodbStore = require("connect-mongodb-session");

function createSessionStore() {
  const MongoDBStore = mongodbStore(expressSession);

  const store = new MongoDBStore({
    uri: process.env.MONGODB_URI,
    databaseName: "online-shop",
    collection: "sessions",
  });

  return store;
}

function createSessionConfig() {
  return {
    secret: "super secret",
    resave: false,
    saveUninitialized: false,
    store: createSessionStore(),
    cookie: {
      maxAge: 2 * 24 * 60 * 60 * 1000,
    },
  };
}

module.exports = createSessionConfig;
