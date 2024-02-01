const router = require("express").Router();
const {
  uploadPhotos,
  uploadEditedPhotos,
  uploadAvatar,
  deletePhotos,
  downloadPhotos,
} = require("../controllers/upload");
const verifyToken = require("../middlewares/verify-token");

router.post("/", verifyToken, uploadPhotos);
router.post("/edited", verifyToken, uploadEditedPhotos);
router.post("/avatar", verifyToken, uploadAvatar);
router.post("/delete", verifyToken, deletePhotos);
router.post("/download", verifyToken, downloadPhotos);

module.exports = router;
