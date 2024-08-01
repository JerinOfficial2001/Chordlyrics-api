const mongoose = require("mongoose");

const authSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    role: { type: String, required: true },
    password: { type: String, required: true },
    image: { type: Object },
    approved_songs: [
      {
        type: mongoose.Types.ObjectId,
        ref: "song",
      },
    ],
    pending_songs: [
      {
        type: mongoose.Types.ObjectId,
        ref: "song",
      },
    ],
  },
  {
    timestamps: true,
  }
);
const auth = mongoose.model("auth", authSchema);
exports.auth = auth;
