const router = require("express").Router();
const verifyToken = require("../middlewares/verify-token");
const { updateUserPaymentsDetails, getUserPaymentsDetails } = require("../controllers/userPaymentsDetails");

router.put("/", verifyToken, updateUserPaymentsDetails);
router.get("/:userId", getUserPaymentsDetails);

module.exports = router;
