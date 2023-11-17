const router = require("express").Router();
const verifyToken = require("../middlewares/verify-token");

const { createSelection, fetchSelections } = require("../controllers/selection");

// CREATE SELECTION
router.post("/", verifyToken, createSelection);

// FETCH SELECTIONS BY GALLERY ID
router.get("/:id", verifyToken, fetchSelections);

module.exports = router;
