const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema(
  {
    playerId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    email: { type: String, unique: true, sparse: true },
    image: { type: String },
    provider: { type: String, enum: ['google', 'guest'], required: true },
    providerId: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Player', playerSchema);
