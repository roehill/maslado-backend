const router = require("express").Router();
const verifyToken = require("../middlewares/verify-token");
const {
  createGallery,
  getGalleries,
  getGalleriesByUpdateDate,
  getSelectedGalleries,
  getGallery,
  deleteGallery,
  updateGallery,
  updateGalleryViewDate,
  updateGalleryPayment,
  getCustomerGalleries,
  sendGalleryToCustomer,
  sendGalleryToPhotographer,
  sendEditedGalleryToCustomer,
  writeResume,
  readResume,
} = require("../controllers/gallery");

// CREATE GALLERY
router.post("/", verifyToken, createGallery);

// GET CUSTOMER GALLERIES
router.get("/customer", verifyToken, getCustomerGalleries);

// GET ALL GALLERIES
router.get("/", verifyToken, getGalleries);

// GET GALLERIES SORT BY UPDATE DATE
router.get("/byUpdateDate", verifyToken, getGalleriesByUpdateDate);

// DOWNLOAD RESUME
router.post("/download-resume/:id", verifyToken, writeResume);
router.get("/download-resume/:id", verifyToken, readResume);

// GET SINGLE GALLERY
router.get("/:id", verifyToken, getGallery);

// UPDATE GALLERY
router.put("/:id", verifyToken, updateGallery);
router.put("/viewDate/:id", verifyToken, updateGalleryViewDate);
router.put("/payment/:id", verifyToken, updateGalleryPayment);

// DELETE GALLERY
router.delete("/:id", verifyToken, deleteGallery);

// SEND GALLERY TO CUSTOMER
router.post("/send", verifyToken, sendGalleryToCustomer);

// SEND EDITED GALLERY TO CUSTOMER
router.post("/send-edited", verifyToken, sendEditedGalleryToCustomer);

// SEND GALLERY TO CUSTOMER
router.post("/send-to-photographer", verifyToken, sendGalleryToPhotographer);

module.exports = router;
