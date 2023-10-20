const router = require("express").Router();
const verifyToken = require("../middlewares/verify-token");

const { createSelection } = require("../controllers/selection");

// CREATE SELECTION
router.post("/", verifyToken, createSelection);

module.exports = router;
