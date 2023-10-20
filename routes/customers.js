const router = require("express").Router();
const verifyToken = require("../middlewares/verify-token");

const {
  getUserCustomers,
  getSingleCustomer,
  editCustomer,
  signupCustomer,
  deleteCustomer,
  loginCustomer,
  getCustomerGalleries,
} = require("../controllers/customer");

// GET ALL USER CUSTOMERS
router.get("/", verifyToken, getUserCustomers);

// GET SINGLE CUSTOMER
router.get("/:id", verifyToken, getSingleCustomer);

// EDIT CUSTOMER
router.put("/:id", verifyToken, editCustomer);

// SIGN UP CUSTOMER
router.post("/", verifyToken, signupCustomer);

// LOGIN CUSTOMER
router.post("/login", loginCustomer);

// DELETE CUSTOMER
router.delete("/:id", verifyToken, deleteCustomer);

// GET SINGLE CUSTOMER
router.get("/galleries/:id", verifyToken, getCustomerGalleries);

module.exports = router;
