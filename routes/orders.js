const router = require("express").Router();
const verifyToken = require("../middlewares/verify-token");

const { registerTransaction } = require("../controllers/order");

// POST CHECKOUT
router.post("/register-transaction", verifyToken, registerTransaction);

module.exports = router;
