const router = require("express").Router();
const verifyToken = require("../middlewares/verify-token");
const { updateUserOptions, getUserOptions } = require("../controllers/userOptions");

router.put("/", verifyToken, updateUserOptions);
router.get("/:userID", getUserOptions);

module.exports = router;
