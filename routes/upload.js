const router = require("express").Router();
const {
  uploadPhotos,
  uploadEditedPhotos,
  deleteMultiplePhotos,
  deleteSinglePhoto,
  downloadPhotos,
} = require("../controllers/upload");
const verifyToken = require("../middlewares/verify-token");

router.post("/", verifyToken, uploadPhotos);
router.post("/edited", verifyToken, uploadEditedPhotos);
router.post("/delete", verifyToken, deleteMultiplePhotos);
router.post("/delete/single", verifyToken, deleteSinglePhoto);
router.post("/download", verifyToken, downloadPhotos);

module.exports = router;
