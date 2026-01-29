const { dbConnection } = require('../connections/index');
const createError = require('http-errors');
const { ObjectId } = require('bson');

const addLike = (req, res, next) => {
  if (!ObjectId.isValid(req.params.id)) {
    return next(createError(400, "Invalid ID syntax!"));
  }

  const _id = new ObjectId(req.params.id);

  dbConnection('news', async (db) => {
    try {
      // 1) زِد اللايك
      const updateResult = await db.updateOne({ _id }, { $inc: { likes: 1 } });

      // إذا ما لقى الوثيقة
      if (updateResult.matchedCount === 0) {
        return next(createError(404, "ID doesn't exist"));
      }

      // 2) رجّع العدد الجديد (مضمون)
      const doc = await db.findOne({ _id }, { projection: { likes: 1 } });

      return res.status(200).json({
        status: true,
        message: "Like added successfully",
        likes: doc?.likes ?? 0
      });
    } catch (err) {
      return next(createError(500, err.message));
    }
  });
};

module.exports = addLike;
