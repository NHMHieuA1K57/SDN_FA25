const express = require("express");
const {
  registerUser,
  loginUser,
  changePassword,
  updateUserProfile,
} = require("../../controllers/auth-controller/index");
const authenticateMiddleware = require("../../middleware/auth-middleware");
const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/check-auth", authenticateMiddleware, (req, res) => {
  const user = req.user;

  res.status(200).json({
    success: true,
    message: "Authenticated user!",
    data: {
      user,
    },
  });
});
router.post("/change-password", changePassword);
router.post("/update-profile", updateUserProfile);

module.exports = router;
