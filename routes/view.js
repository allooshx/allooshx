const { Router } = require("express");
const post_ops = require("../controllers/index.js");

const router = Router();

// ✅ Endpoint للاستيراد فقط
router.post("/import", post_ops.insertPosts);

// ✅ عرض الأخبار (بدون import)
router.get("/view", post_ops.getPosts.getNews);       // أو getPosts حسب اسمك
router.get("/view/:id", post_ops.getPosts.getNewsById);
router.get("/:id/like", post_ops.addLike);


// ✅ Like
router.post("/:id/like", post_ops.addLike);

module.exports = router;

