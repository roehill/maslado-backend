const router = require("express").Router();
const verifyToken = require("../middlewares/verify-token");

const { buyBundle } = require("../controllers/bundle");

// SIGN UP
router.post("/buy-bundle", verifyToken, buyBundle);

module.exports = router;
