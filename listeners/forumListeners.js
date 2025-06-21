const forumEvents = require('../utils/forumEvents');

const logPostCreated = (post) => {
  console.log(`[EVENT] New post by ${post.username}: "${post.content.slice(0, 30)}..."`);
};

const notifyAdmin = (post) => {
  if (post.content.includes('forbidden')) {
    console.warn(`[ALERT] Post from ${post.username} may contain sensitive content.`);
  }
};

forumEvents.on('post:created', logPostCreated);
forumEvents.on('post:created', notifyAdmin);

module.exports = { logPostCreated, notifyAdmin };