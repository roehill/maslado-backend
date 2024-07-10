const router = require("express").Router();
const verifyToken = require("../middlewares/verify-token");

const { registerTransaction, verifyTransaction, getOrder } = require("../controllers/order");

// POST REGISTER TRANSACTION
router.post("/register-transaction", verifyToken, registerTransaction);

// PUT VERIFY TRANSACTION
router.post("/verify-transaction", verifyTransaction);

// GET SINGLE ORDER
router.get("/:orderId", verifyToken, getOrder);

module.exports = router;
