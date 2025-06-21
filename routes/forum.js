const router = require("express").Router();
//const ForumPost = require('../models/ForumPost');
//const forumEvents = require('../utils/forumEvents');
//const { memoize } = require('../utils/memorizer');
//const { log } = require('../utils/logger');
const jwt = require("jsonwebtoken");

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

router.get("/all", verifyToken, (req, res) => {
  res.json(mockPosts);
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

// const createForumPost = log({
//  level: 'INFO',
//  profile: true,
// })(async function createForumPost(username, content) {
//  const newPost = new ForumPost({ username, content });
//  const saved = await newPost.save();

//  forumEvents.emit('post:created', saved);
//  return saved;
// });

// const getAllForumPosts = log({
//  level: 'INFO',
//  profile: true,
//})(async function getAllForumPosts() {
//  return await ForumPost.find().sort({ createdAt: -1 }).lean();
//});

// const getPopularPosts = async () => {
//   return await ForumPost.find().sort({ views: -1 }).limit(10).lean();
// };

// const memoizedPopular = memoize(getPopularPosts, {
//   maxSize: 1,
//   evictionPolicy: "LRU",
//   maxAge: 1000 * 60 * 60 * 24 * 90,
// });

// router.post("/add", async (req, res) => {
//   const { username, content } = req.body;
//   if (!username || !content) {
//     return res.status(400).json({ error: "Missing fields" });
//   }

//   try {
//     const savedPost = await createForumPost(username, content);
//     res.status(201).json(savedPost);
//   } catch (err) {
//     console.error("Post creation error:", err);
//     res.status(500).json({ error: "Failed to create post" });
//   }
// });

// router.get("/all", async (req, res) => {
//   try {
//     const posts = await getAllForumPosts();
//     res.json(posts);
//   } catch (err) {
//     console.error("Error fetching forum posts:", err);
//     res.status(500).json({ error: "Failed to fetch posts" });
//   }
// });

// router.get("/popular", async (req, res) => {
//   try {
//     const result = await memoizedPopular();
//     res.json(result);
//   } catch (err) {
//     console.error("Error fetching popular posts:", err);
//     res.status(500).json({ error: "Failed to fetch popular posts" });
//   }
// });

// router.get("/random", async (req, res) => {
//   const limit = parseInt(req.query.limit) || 10;

//   try {
//     const randomPosts = await ForumPost.aggregate([
//       { $sample: { size: limit } },
//     ]);
//     res.json(randomPosts);
//   } catch (err) {
//     console.error("Error fetching random posts", err);
//     res.status(500).json({ error: "Failed to fetch random posts" });
//   }
// });

module.exports = router;
