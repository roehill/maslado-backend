const router = require("express").Router();
const verifyToken = require("../middlewares/verify-token");

const { downloadBatch } = require("../controllers/resume");

// POST GENERATE BATCH
// Donwload batch file wihchc contain list with all selected photos.
//Photographer can open it in folder with session photos to generate new folder with all this files copied to new folder.
router.post("/download-batch", verifyToken, downloadBatch);

module.exports = router;
