const { JsonDatabase } = require('wondexzdb');
const db = new JsonDatabase({ databasePath: "./src/database/database.json" });
const codedb = new JsonDatabase({ databasePath: "./src/database/codes.json" });

module.exports = { db, codedb };