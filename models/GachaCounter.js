const mongoose = require('mongoose');

const gachaCharacterSchema = new mongoose.Schema({
  userId: String,
  name: String,
  banner: String,
  pull: Number,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('GachaCounter', gachaCharacterSchema);
