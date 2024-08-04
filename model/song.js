const mongoose = require("mongoose");

const songSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    scale: { type: String, required: true },
    tempo: { type: Number, required: true },
    style: { type: String, required: true },
    beat: { type: String, required: true },
    status: { type: String, required: true },
    isPinned: { type: Boolean, required: true },
    language: { type: String, required: true },
    keyboardModal: { type: String, required: true },
    lyrics: { type: String, required: true },
    user_id: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);
const song = mongoose.model("song", songSchema);
exports.song = song;
