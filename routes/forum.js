const router = require("express").Router();
const jwt = require("jsonwebtoken");
const { memoize } = require("../utils/memorizer");
const { generateFakePosts } = require("../utils/generator");
const { asyncMap, asyncMapCallback } = require("../utils/asyncArray");

const memoizedPostGenerator = memoize(
  ({ offset, limit }) => {
    const total = offset + limit;
    const generated = generateFakePosts(total, mockPosts);
    return generated.slice(offset, offset + limit);
  },
  {
    maxSize: 20,
    maxAge: 1000 * 60 * 2,
    evictionPolicy: "LRU",
    cleanupInterval: 1000 * 30,
  }
);

// API: /forum/slice-generated?offset=10&limit=5
router.get("/slice-generated", (req, res) => {
  const offset = parseInt(req.query.offset) || 0;
  const limit = parseInt(req.query.limit) || 5;
  const posts = memoizedPostGenerator({ offset, limit });
  const stats = memoizedPostGenerator.cache.stats();

  res.json({ offset, limit, posts, cache: stats });
});

let mockPosts = [];
let currentId = 1;

function verifyToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).send("Access denied");
  try {
    const verified = jwt.verify(token, "secretkey");
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).send("Invalid token");
  }
}

router.get("/all", async (req, res) => {
  const enrichedPosts = await asyncMap(mockPosts, async (post) => {
    await new Promise((r) => setTimeout(r, 100)); // імітація async
    return { ...post, enriched: true };
  });

  res.json(enrichedPosts);
});

// Асинхронна обробка кожного поста
function analyzePost(post, callback) {
  setTimeout(() => {
    const wordCount = post.content.split(" ").length;
    const hasFile = !!post.file;
    callback(null, {
      ...post,
      wordCount,
      hasFile,
      analyzed: true,
    });
  }, 100);
}

router.get("/analyze", (req, res) => {
  asyncMapCallback(mockPosts, analyzePost, (err, analyzedPosts) => {
    if (err) {
      return res.status(500).json({ error: "Failed to analyze posts" });
    }
    res.json({ total: analyzedPosts.length, posts: analyzedPosts });
  });
});

router.post("/add", verifyToken, (req, res) => {
  const { content, file } = req.body;
  if (!file || !content) {
    return res.status(400).json({ error: "Missing fields" });
  }
  const newPost = {
    id: currentId++,
    content,
    file: file,
    author: req.user.email,
    createdAt: new Date(),
  };

  try {
    mockPosts.push(newPost);
    console.log(newPost);
    res.json(newPost);
  } catch (err) {
    console.error("Post creation error:", err);
  }
});

router.put("/edit/:id", verifyToken, (req, res) => {
  const postId = parseInt(req.params.id);
  const post = mockPosts.find((p) => p.id === postId);
  if (!post) return res.status(404).send("Post not found");
  if (post.author !== req.user.email) return res.status(403).send("Forbidden");

  const { content, file } = req.body;
  if (content) post.content = content;
  if (file) post.file = file;

  res.json(post);
});

router.delete("/delete/:id", verifyToken, (req, res) => {
  const postId = parseInt(req.params.id);
  const index = mockPosts.findIndex((p) => p.id === postId);
  if (index === -1) return res.status(404).send("post not found");
  if (mockPosts[index].author !== req.user.email)
    return res.status(403).send("Forbidden");
  const deleted = mockPosts.splice(index, 1)[0];
  res.json(deleted);
});

module.exports = router;
