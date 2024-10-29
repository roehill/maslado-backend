const router = require("express").Router();
const verifyToken = require("../middlewares/verify-token");

const { registerPayment, verifyPayment, testAccess } = require("../controllers/payment");

// POST REGISTER PAYMENT
router.post("/register-payment", verifyToken, registerPayment);

// POST VERIFY PAYMENT
router.post("/verify-payment", verifyPayment);

// GET TEST ACCESS
router.post("/test-access", verifyToken, testAccess);

module.exports = router;
