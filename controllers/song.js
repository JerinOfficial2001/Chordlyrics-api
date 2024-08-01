const { auth } = require("../model/auth");
const { song } = require("../model/song");
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
    if (isAuthenticated(token, userId)) {
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
