const mongoose = require("mongoose");

const authSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    role: { type: String, required: true },
    password: { type: String, required: true },
    image: { type: Object },
  },
  {
    timestamps: true,
  }
);
const auth = mongoose.model("auth", authSchema);
exports.auth = auth;
