const router = require("express").Router();
const verifyToken = require("../middlewares/verify-token");
const {
  createGallery,
  getGalleries,
  getSelectedGalleries,
  getGallery,
  deleteGallery,
  updateGallery,
  getCustomerGalleries,
  sendGalleryToCustomer,
  sendGalleryToPhotographer,
  writeResume,
  readResume,
} = require("../controllers/gallery");

// CREATE GALLERY
router.post("/", verifyToken, createGallery);

// GET CUSTOMER GALLERIES
router.get("/customer", verifyToken, getCustomerGalleries);

// GET ALL GALLERIES
router.get("/", verifyToken, getGalleries);

// DOWNLOAD RESUME
router.post("/download-resume/:id", verifyToken, writeResume);
router.get("/download-resume/:id", verifyToken, readResume);

// GET SINGLE GALLERY
router.get("/:id", verifyToken, getGallery);

// UPDATE GALLERY
router.put("/:id", verifyToken, updateGallery);

// DELETE GALLERY
router.delete("/:id", verifyToken, deleteGallery);

// SEND GALLERY TO CUSTOMER
router.post("/send", verifyToken, sendGalleryToCustomer);

// SEND GALLERY TO CUSTOMER
router.post("/send-to-photographer", verifyToken, sendGalleryToPhotographer);

module.exports = router;