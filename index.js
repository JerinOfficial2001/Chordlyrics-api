const express = require("express");
const app = express();
app.use(express.json());
const mongoose = require("mongoose");
const cors = require("cors");
app.use(cors());
const dotenv = require("dotenv");
dotenv.config();

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log("SERVER STARTED" + ":" + PORT);
});
const MONGO = process.env.MONGO_DB;

mongoose.connect(MONGO).then((res) => console.log("DB CONNECTED"));
// app.get("/", (req, res) => {
//   res
//     .status(200)
//     .json({ status: "ok", message: "Chordlyrics server is running" });
// });
const Auth = require("./routes/auth");
const Song = require("./routes/song");
app.use("/chordlyrics/auth", Auth);
app.use("/chordlyrics/song", Song);
