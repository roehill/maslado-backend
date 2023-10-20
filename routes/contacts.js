const router = require("express").Router();
const verifyToken = require("../middlewares/verify-token");

const { sendQuestion } = require("../controllers/contact");

// SEND QUESTION
router.post("/", verifyToken, sendQuestion);

module.exports = router;
