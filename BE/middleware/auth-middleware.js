const jwt = require("jsonwebtoken");
const User = require("../models/User");

const verifyToken = (token, secretKey) => {
  return jwt.verify(token, secretKey);
};

const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log(authHeader, "authHeader");

  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: "User is not authenticated",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = verifyToken(token, "JWT_SECRET");

    // Fetch fresh user data from database
    const user = await User.findById(payload._id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    req.user = {
      _id: user._id,
      userName: user.userName,
      userEmail: user.userEmail,
      role: user.role,
      createdAt: user.createdAt,
    };

    next();
  } catch (e) {
    return res.status(401).json({
      success: false,
      message: "invalid token",
    });
  }
};

module.exports = authenticate;
