const { auth } = require("../model/auth");
const { song } = require("../model/song");
const { param } = require("../routes/song");
const {
  isAuthenticated,
  getUserIdFromToken,
} = require("../utils/isAuthenticated");
exports.getSongs = async (req, res) => {
  try {
    const songs = await song.find({ status: "active" }).lean();
    const token = req.headers.authorization?.replace("Bearer ", "");
    const userID = token ? await getUserIdFromToken(token) : null;

    const sortedSongs = songs
      .sort((a, b) => a.title.localeCompare(b.title))
      .map((elem) => {
        if (userID) {
          elem.isPinned = Array.isArray(elem.isPinned)
            ? elem.isPinned.some((id) => id.toString() === userID.toString())
            : false;
        } else {
          elem.isPinned = false;
        }
        return elem;
      });

    res.status(200).json({
      status: "ok",
      data: sortedSongs,
    });
  } catch (error) {
    console.log(error, "getSongs");
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getKeyboard = async (req, res) => {
  try {
    const allActiveSongs = await song.find({ status: "active" });
    const result = [...new Set(allActiveSongs.map((i) => i.keyboardModal))];
    res.status(200).json({
      status: "ok",
      data: result,
    });
  } catch (error) {
    console.log(error, "addSong");
    res.status(500).json({ error: "Internal Server Error" });
  }
};
exports.getLanguages = async (req, res) => {
  const { keyboard } = req.query;
  try {
    const allActiveSongs = await song.find({
      status: "active",
      keyboardModal: keyboard,
    });
    const result = [...new Set(allActiveSongs.map((i) => i.language))];
    res.status(200).json({
      status: "ok",
      data: result,
    });
  } catch (error) {
    console.log(error, "addSong");
    res.status(500).json({ error: "Internal Server Error" });
  }
};
exports.getSongIndex = async (req, res) => {
  const { language } = req.query;
  try {
    const allSongs = await song.find({ status: "active" });
    const filteredSongs = allSongs.filter((i) => i.language == language);

    const titleCounts = {};

    filteredSongs.forEach((elem) => {
      const title = elem.title.charAt(0);
      if (!titleCounts[title]) {
        const totalSongs = filteredSongs.filter(
          (i) => i.title.charAt(0) === title
        ).length;

        titleCounts[title] = totalSongs;
      }
    });

    const songIndexs = Object.keys(titleCounts).map((title) => ({
      title,
      totalSongs: titleCounts[title],
    }));

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
    const allSongs = await song.find({}).lean();
    const filteredSongs = allSongs.filter((i) => i.title.charAt(0) == index);
    const token = req.headers.authorization?.replace("Bearer ", "");
    const userID = token ? await getUserIdFromToken(token) : null;

    const sortedSongs = filteredSongs
      .sort((a, b) => {
        if (a.title < b.title) {
          return -1;
        }
        if (a.title > b.title) {
          return 1;
        }
        return 0;
      })
      .map((elem) => {
        if (userID) {
          elem.isPinned = Array.isArray(elem.isPinned)
            ? elem.isPinned.some((id) => id.toString() === userID.toString())
            : false;
        } else {
          elem.isPinned = false;
        }
        return elem;
      });
    res.status(200).json({
      status: "ok",
      data: sortedSongs,
    });
  } catch (error) {
    console.log(error, "addSong");
    res.status(500).json({ error: "Internal Server Error" });
  }
};
exports.getSong = async (req, res) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    const userID = token ? await getUserIdFromToken(token) : null;
    const result = await song.findById(req.params.id).lean();
    if (userID) {
      result.isPinned = Array.isArray(result.isPinned)
        ? result.isPinned.some((id) => id.toString() === userID.toString())
        : false;
    } else {
      result.isPinned = false;
    }
    res.status(200).json({
      status: "ok",
      data: result,
    });
  } catch (error) {
    console.log(error, "addSong");
    res.status(500).json({ error: "Internal Server Error" });
  }
};

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
exports.getMySongs = async (req, res) => {
  const { userId } = req.query;
  const token = req.headers.authorization?.replace("Bearer ", "");
  try {
    if (await isAuthenticated(token, userId).then((data) => data)) {
      const pendingSongs = await auth
        .findById(userId)
        .populate("pending_songs");
      const approvedSongs = await auth
        .findById(userId)
        .populate("approved_songs");
      const pendings = pendingSongs.pending_songs;
      const approveds = approvedSongs.approved_songs;
      res.status(200).json({
        status: "ok",
        data: [...pendings, ...approveds].sort(
          (a, b) => b.createdAt - a.createdAt
        ),
      });
    } else {
      res.status(200).json({ status: "error", message: "Unauthorized" });
    }
  } catch (error) {
    console.log(error, "addSong");
    res.status(500).json({ error: "Internal Server Error" });
  }
};
exports.updateSong = async (req, res) => {
  const { userId } = req.query;
  const token = req.headers.authorization?.replace("Bearer ", "");
  const {
    title,
    scale,
    tempo,
    style,
    beat,
    isPinned,
    language,
    keyboardModal,
    lyrics,
    user_id,
  } = req.body;
  try {
    const user = await auth.findById(userId);
    if (await isAuthenticated(token, userId).then((data) => data)) {
      if (
        (title,
        scale && tempo && style && beat && language && keyboardModal && lyrics)
      ) {
        const userData = await auth.findById(user_id);
        const songObj = await song.findById(req.params.id);
        if (songObj) {
          songObj.title = title;
          songObj.scale = scale;
          songObj.tempo = tempo;
          songObj.style = style;
          songObj.beat = beat;
          songObj.isPinned = isPinned;
          songObj.language = language;
          songObj.keyboardModal = keyboardModal;
          songObj.lyrics = lyrics;
          songObj.status = user.role == "ADMIN" ? "active" : "pending";

          const result = await song.findByIdAndUpdate(req.params.id, songObj);
          if (result) {
            if (user.role == "ADMIN") {
              if (!userData.approved_songs.includes(result._id)) {
                userData.approved_songs.push(result._id);
                userData.pending_songs = userData.pending_songs.filter(
                  (songId) => !songId.equals(result._id)
                );
              }
            } else {
              if (userData.approved_songs.includes(result._id)) {
                userData.approved_songs = userData.approved_songs.filter(
                  (songId) => !songId.equals(result._id)
                );
                userData.pending_songs.push(result._id);
              }
            }
            userData.save();
            res.status(200).json({
              status: "ok",
              message: "Song updated successfully",
            });
          } else {
            res.status(200).json({
              status: "error",
              message: "Something went wrong",
            });
          }
        } else {
          res.status(200).json({ status: "error", message: "Song not found" });
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
exports.pinSong = async (req, res) => {
  const { userId } = req.query;
  const token = req.headers.authorization?.replace("Bearer ", "");
  const { isPinned } = req.body;
  try {
    if (await isAuthenticated(token, userId).then((data) => data)) {
      const userData = await auth.findById(userId);
      const songObj = await song.findById(req.params.id);
      if (songObj) {
        if (!songObj.isPinned) {
          songObj.isPinned = [];
        }
        if (!userData.pinned_songs) {
          userData.pinned_songs = [];
        }
        if (isPinned) {
          if (songObj.isPinned && !songObj.isPinned.includes(userData._id)) {
            songObj.isPinned.push(userData._id);
          }
          if (
            userData.pinned_songs &&
            !userData.pinned_songs.includes(songObj._id)
          ) {
            userData.pinned_songs.push(songObj._id);
          }
        } else {
          if (songObj.isPinned && songObj.isPinned.includes(userData._id)) {
            songObj.isPinned = songObj.isPinned.filter(
              (elem) => elem.toString() != userData._id.toString()
            );
          }
          if (
            userData.pinned_songs &&
            userData.pinned_songs.includes(songObj._id)
          ) {
            userData.pinned_songs = userData.pinned_songs.filter(
              (elem) => elem.toString() != songObj._id.toString()
            );
          }
        }
        const result = await song.findByIdAndUpdate(req.params.id, songObj);
        if (result) {
          userData.save();
          res.status(200).json({
            status: "ok",
            message: isPinned ? "Song pinned" : "Song unpinned",
          });
        } else {
          res.status(200).json({
            status: "error",
            message: "Something went wrong",
          });
        }
      } else {
        res.status(200).json({ status: "error", message: "Song not found" });
      }
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
        const songUser = await auth.findById(songs.user_id);
        if (songUser) {
          songs.status = "active";
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
              .json({ status: "error", message: "Something went wrong" });
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
exports.getPendingSongs = async (req, res) => {
  const { userId } = req.query;
  const token = req.headers.authorization?.replace("Bearer ", "");
  try {
    if (await isAuthenticated(token, userId).then((data) => data)) {
      const songs = await song.find({ status: "pending" });
      const uniqueUserIDs = [...new Set(songs.map((song) => song.user_id))];
      const users = await auth.find({
        _id: { $in: ["66af458624280ff49b455318", "66af507ba81691fc5d2f8b84"] },
      });
      const userMap = users.reduce((map, user) => {
        map[user._id] = user.name;
        return map;
      }, {});
      const SongsWithUserName = songs.map((song) => ({
        ...song._doc,
        userName: userMap[song.user_id],
      }));
      res.status(200).json({ status: "ok", data: SongsWithUserName });
    } else {
      res.status(200).json({ status: "error", message: "Unauthorized" });
    }
  } catch (error) {
    console.log(error, "addSong");
    res.status(500).json({ error: "Internal Server Error" });
  }
};
exports.deleteSong = async (req, res) => {
  const { userId } = req.query;
  const token = req.headers.authorization?.replace("Bearer ", "");
  try {
    if (await isAuthenticated(token, userId).then((data) => data)) {
      const userData = await auth.findById(userId);
      const allUsers = await auth.find({});
      let result;
      if (userData.role == "ADMIN") {
        for (let user of allUsers) {
          if (
            user.pinned_songs &&
            user.pinned_songs.toString().includes(req.params.id)
          ) {
            user.pinned_songs = user.pinned_songs.filter(
              (elem) => elem.toString() != req.params.id
            );
          }
          if (
            user.approved_songs &&
            user.approved_songs.toString().includes(req.params.id)
          ) {
            user.approved_songs = user.approved_songs.filter(
              (elem) => elem.toString() != req.params.id
            );
          }
          if (
            user.pending_songs &&
            user.pending_songs.toString().includes(req.params.id)
          ) {
            user.pending_songs = user.pending_songs.filter(
              (elem) => elem.toString() != req.params.id
            );
          }
          user.save();
        }
        result = await song.findByIdAndDelete(req.params.id);
      } else {
        if (
          userData.pending_songs &&
          userData.pending_songs.toString().includes(req.params.id)
        ) {
          if (
            userData.pinned_songs &&
            userData.pinned_songs.toString().includes(req.params.id)
          ) {
            userData.pinned_songs = userData.pinned_songs.filter(
              (elem) => elem.toString() != req.params.id
            );
          }
          if (
            userData.pending_songs &&
            userData.pending_songs.toString().includes(req.params.id)
          ) {
            userData.pending_songs = userData.pending_songs.filter(
              (elem) => elem.toString() != req.params.id
            );
          }
          userData.save();
          result = await song.findByIdAndDelete(req.params.id);
        }
      }
      if (result) {
        res.status(200).json({
          status: "ok",
          message: "Song deleted successfully",
        });
      } else {
        res.status(200).json({
          status: "error",
          message: "Only admins could delete this song",
        });
      }
    } else {
      res.status(200).json({ status: "error", message: "Unauthorized" });
    }
  } catch (error) {
    console.log(error, "addSong");
    res.status(500).json({ error: "Internal Server Error" });
  }
};
