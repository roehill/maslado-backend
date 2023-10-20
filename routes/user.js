const router = require("express").Router();
const verifyToken = require("../middlewares/verify-token");
const path = require("path");
const {
  registerUser,
  verifyEmail,
  activateAccount,
  loginUser,
  getUser,
  findUser,
  sendResetPasswordCode,
  validateResetCode,
  changePassword,
  editUser,
} = require("../controllers/user");

// SIGN UP
router.post("/signup", registerUser);

// VERIFY EMAIL
router.get("/verify/:userID/:uniqueString", verifyEmail);

// VERIFY PAGE
router.get("/verified", (req, res) => {
  res.sendFile(path.join(__dirname, "../views/verified.html"));
});

// ACTIVATE ACCOUNT
router.post("/activate", activateAccount);

// LOGIN
router.post("/login", loginUser);

// GET PROFILE
router.get("/", verifyToken, getUser);

// FOUND USER
router.get("/find-user", findUser);

// SEND RESET CODE
router.post("/send-reset-code", sendResetPasswordCode);

//VALIDATE RESET CODE
router.post("/validate-reset-code", validateResetCode);

//VALIDATE RESET CODE
router.put("/change-password", changePassword);

// EDIT
router.put("/", verifyToken, editUser);

module.exports = router;
