const User = require("../models/user");
const Selection = require("../models/selection");

// CREATE SELECTION
exports.createSelection = async (req, res) => {
  try {
    const { galleryId, photos } = req.body;

    if (photos.length <= 0) {
      return res.status(400).json({
        success: false,
        message: "Nie wybrano żadnego ujęcia",
      });
    }

    const selection = new Selection({
      galleryId: galleryId,
      selectedPhotos: photos,
    });
    console.log(selection);

    await selection.save();

    return res.status(200).json({
      success: true,
      message: "Dodano nową selekcję",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// FETCH SELECTIONS BY GALLERY ID
exports.fetchSelections = async (req, res) => {
  try {
    const selections = await Selection.find({ galleryId: req.params.id });
    res.json(selections);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
