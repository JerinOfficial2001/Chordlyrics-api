const { auth } = require("../model/auth");
const jwt = require("jsonwebtoken");
const cloudinary = require("../utils/cloudinary");
const { isAuthenticated } = require("../utils/isAuthenticated");
const SECRET_KEY = process.env.SECRET_KEY;

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (email && password) {
      const User = await auth.findOne({ email });
      if (User) {
        if (User.password != password) {
          res.status(200).json({
            status: "error",
            message: "Incorrect password",
          });
        } else {
          const token = jwt.sign({ userId: User._id }, SECRET_KEY, {
            expiresIn: "24h",
          });
          res.status(200).json({
            status: "ok",
            token,
          });
        }
      } else {
        res.status(200).json({
          status: "ok",
          message: "User not exist",
        });
      }
    } else {
      res
        .status(200)
        .json({ status: "error", message: "All fields are mandatory" });
    }
  } catch (error) {
    console.log(error, "Login");
    res.status(500).json({ error: "Internal Server Error" });
  }
};
exports.register = async (req, res) => {
  const { email, password, role, name, image } = req.body;

  try {
    if (email && password && name) {
      const User = await auth.findOne({ email });
      if (!User) {
        const userDatas = {
          email,
          password,
          role: "User",
          name,
          image: null,
        };
        if (req.file) {
          userDatas.image = {
            url: req.file.path,
            public_id: req.file.path
              .split("/")
              .slice(-2)
              .join("/")
              .replace(/\.\w+$/, ""),
            mimetype: req.file.mimetype,
            originalname: req.file.originalname,
            size: req.file.size,
          };
        }
        const result = await auth.create(userDatas);
        if (result) {
          const token = jwt.sign({ userId: result._id }, SECRET_KEY, {
            expiresIn: "24h",
          });
          res.status(200).json({
            status: "ok",
            token,
          });
        } else {
          await cloudinary.uploader.destroy(
            req.file.path
              .split("/")
              .slice(-2)
              .join("/")
              .replace(/\.\w+$/, "")
          );
          res.status(200).json({
            status: "error",
            message: "Something went wrong",
          });
        }
      } else {
        res.status(200).json({
          status: "error",
          message: "User already exist",
        });
      }
    } else {
      res
        .status(200)
        .json({ status: "error", message: "All fields are mandatory" });
    }
  } catch (error) {
    console.log(error, "register");
    res.status(500).json({ error: "Internal Server Error" });
  }
};
exports.userData = async (req, res) => {
  const token = req.headers.authorization?.replace("Bearer ", "");

  try {
    if (token) {
      const decoded = jwt.verify(token, SECRET_KEY);
      const user = await auth.findById(decoded.userId);
      if (user) {
        res.status(200).json({
          status: "ok",
          data: {
            email: user.email,
            password: user.password,
            image: user.image,
            role: user.role,
            accessToken: token,
            _id: user._id,
            approved_songs: user.approved_songs,
            pending_songs: user.pending_songs,
            name: user.name,
            createdAt: user.createdAt,
          },
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
        .json({ status: "error", message: "Unauthorized - Missing Token" });
    }
  } catch (error) {
    console.log(error, "userData");
    res.status(500).json({ error: "Internal Server Error" });
  }
};
exports.deleteAccount = async (req, res) => {
  const { userId } = req.params;
  const token = req.headers.authorization?.replace("Bearer ", "");

  try {
    if (isAuthenticated(token, userId)) {
      const User = await auth.findById(userId);
      if (User) {
        if (User.image && User.image.public_id) {
          await cloudinary.uploader.destroy(User.image.public_id);
        }
        const result = await auth.findByIdAndDelete(userId);
        if (result) {
          res.status(200).json({
            status: "ok",
            message: "Account deleted successfully",
          });
        } else {
          res.status(200).json({
            status: "error",
            message: "Something went wrong",
          });
        }
      } else {
        res.status(200).json({
          status: "error",
          message: "User not exist",
        });
      }
    } else {
      res.status(200).json({ status: "error", message: "Unauthorized" });
    }
  } catch (error) {
    console.log(error, "register");
    res.status(500).json({ error: "Internal Server Error" });
  }
};
exports.getUserById = async (req, res) => {
  const { userId } = req.query;
  const token = req.headers.authorization?.replace("Bearer ", "");

  try {
    if (isAuthenticated(token, userId)) {
      const User = await auth.findById(req.params.id);
      if (User) {
        res.status(200).json({
          status: "ok",
          data: User,
        });
      } else {
        res.status(200).json({
          status: "error",
          message: "Invalid Id",
        });
      }
    } else {
      res.status(200).json({ status: "error", message: "Unauthorized" });
    }
  } catch (error) {
    console.log(error, "register");
    res.status(500).json({ error: "Internal Server Error" });
  }
};
