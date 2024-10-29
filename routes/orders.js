const router = require("express").Router();
const verifyToken = require("../middlewares/verify-token");

const { testAccess, registerTransaction, verifyTransaction, getOrder, getOrders } = require("../controllers/order");

// GET TEST ACCESS
router.get("/test-access", verifyToken, testAccess);

// POST REGISTER TRANSACTION
router.post("/register-transaction", verifyToken, registerTransaction);

// PUT VERIFY TRANSACTION
router.post("/verify-transaction", verifyTransaction);

// GET SINGLE ORDER
router.get("/:orderId", verifyToken, getOrder);

// GET ALL USERs ORDERS
router.get("/", verifyToken, getOrders);

module.exports = router;
