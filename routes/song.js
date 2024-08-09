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
  getLanguages,
  getKeyboard,
  getMySongs,
  updateSong,
} = require("../controllers/song");
const router = express.Router();

router.get("/getAllSongs", getSongs);
router.get("/getKeyboards", getKeyboard);
router.get("/getlanguages", getLanguages);
router.get("/getIndex", getSongIndex);
router.get("/getSongTitles", getSongsTitle);
router.get("/getSong/:id", getSong);

router.get("/getPendingSongs", getPendingSongs);
router.get("/getMySongs", getMySongs);
router.get("/getMyPendingSongs", getMyPendingSongs);
router.get("/getApprovedSongs", getApprovedSongs);
router.put("/updateSong/:id", updateSong);

router.post("/addSong", addSong);
router.delete("/delete/:id");
router.put("/approveSong", approveSongs);

module.exports = router;
