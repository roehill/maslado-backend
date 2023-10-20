const router = require("express").Router();
const {
  uploadPhotos,
  uploadEditedPhotos,
  deleteMultiplePhotos,
  deleteSinglePhoto,
  resizePhotos,
  downloadPhotos,
} = require("../controllers/upload");
const verifyToken = require("../middlewares/verify-token");

router.post("/", verifyToken, uploadPhotos);
router.post("/resize", verifyToken, resizePhotos);
router.post("/edited", verifyToken, uploadEditedPhotos);
router.post("/delete", verifyToken, deleteMultiplePhotos);
router.post("/delete/single", verifyToken, deleteSinglePhoto);
router.post("/download", verifyToken, downloadPhotos);

module.exports = router;
