const { auth } = require("../model/auth");
const { song } = require("../model/song");
const { param } = require("../routes/song");
const { isAuthenticated } = require("../utils/isAuthenticated");

exports.addSong = async (req, res) => {
  const { userId } = req.query;
  const token = req.headers.authorization?.replace("Bearer ", "");
  const {
    title,
    scale,
    tempo,
    style,
    beat,
    status,
    isPinned,
    language,
    keyboardModal,
    lyrics,
  } = req.body;
  try {
    const DatasToAdd = {
      title,
      scale,
      tempo,
      style,
      beat,
      status,
      isPinned,
      language,
      keyboardModal,
      lyrics,
      user_id: userId,
    };
    console.log(req.body);
    if (await isAuthenticated(token, userId).then((data) => data)) {
      if (
        (title,
        scale && tempo && style && beat && language && keyboardModal && lyrics)
      ) {
        const userData = await auth.findById(userId);
        DatasToAdd.status = "pending";
        DatasToAdd.isPinned = false;
        const result = await song.create(DatasToAdd);
        if (result) {
          userData.pending_songs.push(result._id);
          userData.save();
          res.status(200).json({
            status: "ok",
            message: "Song added successfully",
          });
        } else {
          res.status(200).json({
            status: "error",
            message: "Something went wrong",
          });
        }
      } else {
        res
          .status(200)
          .json({ status: "error", message: "All fields are mandatory" });
      }
    } else {
      res.status(200).json({ status: "error", message: "Unauthorized" });
    }
  } catch (error) {
    console.log(error, "addSong");
    res.status(500).json({ error: "Internal Server Error" });
  }
};
exports.getSongs = async (req, res) => {
  try {
    const songs = await song.find({ status: "active" });
    res.status(200).json({
      status: "ok",
      data: songs.sort((a, b) => {
        if (a.title < b.title) {
          return -1;
        }
        if (a.title > b.title) {
          return 1;
        }
        return 0;
      }),
    });
  } catch (error) {
    console.log(error, "addSong");
    res.status(500).json({ error: "Internal Server Error" });
  }
};
exports.getPendingSongs = async (req, res) => {
  const { userId } = req.query;
  const token = req.headers.authorization?.replace("Bearer ", "");
  try {
    if (await isAuthenticated(token, userId).then((data) => data)) {
      const songs = await song.find({ status: "pending" });
      res.status(200).json({ status: "ok", data: songs });
    } else {
      res.status(200).json({ status: "error", message: "Unauthorized" });
    }
  } catch (error) {
    console.log(error, "addSong");
    res.status(500).json({ error: "Internal Server Error" });
  }
};
exports.getMyPendingSongs = async (req, res) => {
  const { userId } = req.query;
  const token = req.headers.authorization?.replace("Bearer ", "");
  try {
    if (await isAuthenticated(token, userId).then((data) => data)) {
      const songs = await auth.findById(userId).populate("pending_songs");
      res.status(200).json({ status: "ok", data: songs.pending_songs });
    } else {
      res.status(200).json({ status: "error", message: "Unauthorized" });
    }
  } catch (error) {
    console.log(error, "addSong");
    res.status(500).json({ error: "Internal Server Error" });
  }
};
exports.getApprovedSongs = async (req, res) => {
  const { userId } = req.query;
  const token = req.headers.authorization?.replace("Bearer ", "");
  try {
    if (await isAuthenticated(token, userId).then((data) => data)) {
      const songs = await auth.findById(userId).populate("approved_songs");
      res.status(200).json({ status: "ok", data: songs.approved_songs });
    } else {
      res.status(200).json({ status: "error", message: "Unauthorized" });
    }
  } catch (error) {
    console.log(error, "addSong");
    res.status(500).json({ error: "Internal Server Error" });
  }
};
exports.approveSongs = async (req, res) => {
  const { userId, songId } = req.query;
  const token = req.headers.authorization?.replace("Bearer ", "");
  try {
    const user = await auth.findById(userId);
    if (
      (await isAuthenticated(token, userId).then((data) => data)) &&
      user.role == "ADMIN"
    ) {
      const songs = await song.findById(songId);
      if (songs && songs.status != "active") {
        songs.status = "active";

        const songUser = await auth.findById(songs.user_id);
        if (songUser) {
          songUser.approved_songs.push(songs._id);
          songUser.pending_songs = songUser.pending_songs.filter(
            (i) => i != songId
          );
          songUser.save();
          const result = songs.save();
          if (result) {
            res.status(200).json({ status: "ok", message: "Song approved" });
          } else {
            res
              .status(200)
              .json({ status: "ok", message: "Something went wrong" });
          }
        } else {
          res
            .status(200)
            .json({ status: "ok", message: "Song is not dependent on user" });
        }
      } else {
        res
          .status(200)
          .json({ status: "error", message: "Check the Song status" });
      }
    } else {
      res.status(200).json({ status: "error", message: "Unauthorized" });
    }
  } catch (error) {
    console.log(error, "addSong");
    res.status(500).json({ error: "Internal Server Error" });
  }
};
exports.getSongIndex = async (req, res) => {
  const { language } = req.query;
  try {
    const allSongs = await song.find({});
    const filteredSongs = allSongs.filter((i) => i.language == language);
    const songIndexs = filteredSongs.map((elem) => {
      const title = elem.title.charAt(0);
      const totalSongs = filteredSongs.filter(
        (i) => i.title.charAt(0) == title
      ).length;
      return { title, totalSongs };
    });
    res.status(200).json({
      status: "ok",
      data: songIndexs.sort((a, b) => {
        if (a.title < b.title) {
          return -1;
        }
        if (a.title > b.title) {
          return 1;
        }
        return 0;
      }),
    });
  } catch (error) {
    console.log(error, "addSong");
    res.status(500).json({ error: "Internal Server Error" });
  }
};
exports.getSongsTitle = async (req, res) => {
  const { index } = req.query;
  try {
    const allSongs = await song.find({});
    const filteredSongs = allSongs.filter((i) => i.title.charAt(0) == index);

    res.status(200).json({
      status: "ok",
      data: filteredSongs.sort((a, b) => {
        if (a.title < b.title) {
          return -1;
        }
        if (a.title > b.title) {
          return 1;
        }
        return 0;
      }),
    });
  } catch (error) {
    console.log(error, "addSong");
    res.status(500).json({ error: "Internal Server Error" });
  }
};
exports.getSong = async (req, res) => {
  try {
    const result = await song.findById(req.params.id);

    res.status(200).json({
      status: "ok",
      data: result,
    });
  } catch (error) {
    console.log(error, "addSong");
    res.status(500).json({ error: "Internal Server Error" });
  }
};
