const User = require("../models/user");
const UserPaymentsDetails = require("../models/userPaymentsDetails");

exports.updateUserPaymentsDetails = async (req, res) => {
  try {
    const { p24Id, crcKey, apiKey, isPaymentsAvailable } = req.body;

    const userPaymentsDetails = await UserPaymentsDetails.findOneAndUpdate(
      { userId: req.decoded._id }, // Szukaj według ID użytkownika
      {
        $set: {
          p24Id: p24Id,
          crcKey: crcKey,
          apiKey: apiKey,
          isPaymentsAvailable: isPaymentsAvailable,
        },
      },
      { upsert: true, new: true } // Tworzy, jeśli nie istnieje, zwraca nowy dokument
    );
    res.json(userPaymentsDetails);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.updateUserPaymentsAvailable = async (req, res) => {
  try {
    const { p24Id, crcKey, apiKey } = req.body;

    const userPaymentsDetails = await UserPaymentsDetails.findOneAndUpdate(
      { userId: req.decoded._id }, // Szukaj według ID użytkownika
      {
        $set: {
          p24Id: p24Id,
          crcKey: crcKey,
          apiKey: apiKey,
        },
      },
      { upsert: true, new: true } // Tworzy, jeśli nie istnieje, zwraca nowy dokument
    );
    res.json(userPaymentsDetails);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getUserPaymentsDetails = async (req, res) => {
  try {
    // Znajdź opcje użytkownika na podstawie jego ID
    const userPaymentsDetails = await UserPaymentsDetails.findOne({ userId: req.params.userId });

    // Jeśli rekord nie istnieje, zwróć odpowiedni komunikat
    if (!userPaymentsDetails) {
      return res.status(404).json({ message: "Dane użytkownika nie zostały znalezione" });
    }

    // Zwróć znaleziony dokument w formacie JSON
    res.json(userPaymentsDetails);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
