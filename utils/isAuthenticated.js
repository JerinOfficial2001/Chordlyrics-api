const jwt = require("jsonwebtoken");
const { auth } = require("../model/auth");
const SECRET_KEY = process.env.SECRET_KEY;

exports.isAuthenticated = async (token, userid) => {
  const decoded = jwt.verify(token, SECRET_KEY);
  const user = await auth.findById(decoded.userId);
  const userID = user ? user._id : null;
  if (!token || !user || userID.toString() !== userid || !userid) {
    return false;
  } else {
    return true;
  }
};
exports.getUserIdFromToken = async (token) => {
  if (token) {
    const decoded = jwt.verify(token, SECRET_KEY);
    const user = await auth.findById(decoded.userId);
    return user ? user._id : null;
  } else {
    return null;
  }
};
