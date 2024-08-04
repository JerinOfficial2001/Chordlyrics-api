const express = require("express");
const {
  addSong,
  getSongs,
  getPendingSongs,
  getMyPendingSongs,
  getApprovedSongs,
  approveSongs,
  getSongIndex,
  getSongsTitle,
  getSong,
} = require("../controllers/song");
const router = express.Router();

router.post("/addSong", addSong);
router.get("/getAllSongs", getSongs);
router.get("/getIndex", getSongIndex);
router.get("/getSongTitles", getSongsTitle);
router.get("/getSong/:id", getSong);

router.get("/getPendingSongs", getPendingSongs);
router.get("/getMyPendingSongs", getMyPendingSongs);
router.get("/getApprovedSongs", getApprovedSongs);
router.delete("/delete/:id");
router.put("/approveSong", approveSongs);

module.exports = router;
