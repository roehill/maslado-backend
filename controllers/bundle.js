const User = require("../models/user");
const Bundle = require("../models/bundle");

// BUY BUNDLE
exports.buyBundle = async (req, res) => {
  try {
    const { type, galleriesQuantity, price } = req.body;

    const bundle = new Bundle({
      user: req.decoded._id,
      type: type,
      galleriesQuantity: galleriesQuantity,
      price: price,
    });

    // Sprawdzam, ile galerii pozostało
    let availableSessions = 0;
    await User.findOne({ _id: req.decoded._id }).then((data) => {
      return (availableSessions = data.available_sessions);
    });

    await User.findOneAndUpdate(
      { _id: req.decoded._id },
      {
        $set: {
          available_sessions: availableSessions + parseInt(galleriesQuantity),
        },
      }
    );

    await bundle.save();

    return res.status(200).json({
      success: true,
      message: "Dodano nowy pakiet",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
