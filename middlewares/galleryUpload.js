const fs = require("fs");

module.exports = async function (req, res, next) {
  try {
    if (!req.files || Object.values(req.files).flat().length === 0) {
      return res.status(400).json({ message: "Nie wybrano żadnych zdjęć" });
    }

    let files = Object.values(req.files).flat();
    files.forEach((file) => {
      if (file.mimetype !== "image/jpeg" && file.mimetype !== "image/png") {
        removeTmp(file.tempFilePath);
        return res.status(400).json({ message: "Nieobsługiwany format zdjęć" });
      }
      if (file.size > 1024 * 1024) {
        removeTmp(file.tempFilePath);
        return res.status(400).json({ message: "Za duży rozmiar zdjęcia" });
      }
    });
    next();
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const removeTmp = (path) => {
  fs.unlink(path, (err) => {
    if (err) throw err;
  });
};
