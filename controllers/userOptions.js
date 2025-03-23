const User = require("../models/user");
const UserOptions = require("../models/userOptions");

exports.updateUserOptions = async (req, res) => {
  try {
    const { paymentsMessage } = req.body;
    // Znajdź lub utwórz userOptions dla danego użytkownika
    console.log(paymentsMessage);

    const userOptions = await UserOptions.findOneAndUpdate(
      { userId: req.decoded._id }, // Szukaj według ID użytkownika
      {
        $set: {
          paymentsMessage: paymentsMessage,
        },
      },
      { upsert: true, new: true } // Tworzy, jeśli nie istnieje, zwraca nowy dokument
    );
    res.json(userOptions);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getUserOptions = async (req, res) => {
  try {
    console.log(req.params.userID);

    // Znajdź opcje użytkownika na podstawie jego ID
    const userOptions = await UserOptions.findOne({ userId: req.params.userID });

    // Jeśli rekord nie istnieje, zwróć odpowiedni komunikat
    if (!userOptions) {
      return res.status(404).json({ message: "Opcje użytkownika nie zostały znalezione" });
    }

    // Zwróć znaleziony dokument w formacie JSON
    res.json(userOptions);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
