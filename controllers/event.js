const Event = require("../models/event");
const mongoose = require("mongoose");

exports.createEvent = async (req, res) => {
  try {
    const { date, body } = req.body;

    const newEvent = new Event({
      userId: req.decoded._id,
      date,
      body,
    });

    await newEvent.save();
    res.status(201).json(newEvent);
  } catch (error) {
    res.status(500).json({ message: "Błąd przy tworzeniu wydarzenia.", error });
  }
};

exports.getEvents = async (req, res) => {
  try {
    // Pobierz page i limit z zapytania, ustaw domyślne wartości
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;

    // Oblicz, ile elementów należy pominąć
    const skip = (page - 1) * limit;

    const events = await Event.find({ userId: req.decoded._id }).sort({ date: 1 }).skip(skip).limit(limit);
    const totalEvents = await Event.countDocuments({ userId: req.decoded._id });

    // Oblicz łączną liczbę stron
    const totalPages = Math.ceil(totalEvents / limit);

    res.json({
      events,
      pagination: {
        totalEvents,
        totalPages,
        currentPage: page,
        perPage: limit,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Błąd przy pobieraniu wydarzeń.", error });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    // Sprawdzenie, czy event należy do użytkownika
    const event = await Event.findOne({ _id: id, userId: req.decoded._id });

    if (!event) {
      return res.status(404).json({ message: "Wydarzenie nie zostało znalezione." });
    }

    await Event.deleteOne({ _id: id });

    res.json({ message: "Wydarzenie zostało usunięte." });
  } catch (error) {
    res.status(500).json({ message: "Błąd podczas usuwania wydarzenia.", error });
  }
};
