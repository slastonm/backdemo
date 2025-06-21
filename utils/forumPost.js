const ForumPost = require('../models/ForumPost');

async function* streamForumPosts() {
  const cursor = ForumPost.find().sort({ createdAt: -1 }).lean().cursor();

  for await (const doc of cursor) {
    yield doc;
  }
}

async function processForumPostsIncrementally() {
  try {
    for await (const post of streamForumPosts()) {

      console.log(`Processing post by ${post.username} at ${post.createdAt}`);
    }
    console.log('Finished processing all posts.');
  } catch (err) {
    console.error('Error during stream processing:', err);
  }
}

processForumPostsIncrementally();
