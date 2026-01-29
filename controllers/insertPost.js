const { dbConnection } = require('../connections/index.js');
const createError = require('http-errors');
const { promises: fs } = require('fs');
const path = require('path');

const insertPost = async (req, res, next) => {
  try {
    const dataPath = path.join(__dirname, '..', 'fromWebToProject', 'pageData.json');
    const rawData = await fs.readFile(dataPath, 'utf-8');
    const data = JSON.parse(rawData);

    const operations = data.map(item => ({
      updateOne: {
        filter: { link: item.link },
        update: { $setOnInsert: { ...item, likes: 0, createdAt: new Date() } },
        upsert: true
      }
    }));

    dbConnection('news', async (db) => {
      try {
        const result = await db.bulkWrite(operations, { ordered: false });

        res.status(200).json({
          status: true,
          message: "Imported successfully",
          inserted: result.upsertedCount || 0,
          matched: result.matchedCount || 0,
          modified: result.modifiedCount || 0
        });
      } catch (err) {
        next(createError(502, err.message));
      }
    });
  } catch (err) {
    next(createError(400, "Invalid JSON file or file not found: " + err.message));
  }
};

module.exports = insertPost;
