const router = require("express").Router();
const verifyToken = require("../middlewares/verify-token");

const { createCheckoutSession } = require("../controllers/order");

// POST CHECKOUT
router.post("/create-checkout-session", verifyToken, createCheckoutSession);

module.exports = router;
