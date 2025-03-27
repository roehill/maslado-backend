const router = require("express").Router();
const verifyToken = require("../middlewares/verify-token");

const { createEvent, getEvents, deleteEvent } = require("../controllers/event");

// CREATE NEW EVENT
router.post("/", verifyToken, createEvent);

// GET EVENTS LIST
router.get("/", verifyToken, getEvents);

// DELETE EVENT
router.delete("/:id", verifyToken, deleteEvent);

module.exports = router;
