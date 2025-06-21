const mongoose = require('mongoose');

const forumPostSchema = new mongoose.Schema({
  username: String,
  content: String
}, { timestamps: true });

module.exports = mongoose.model('ForumPost', forumPostSchema);
