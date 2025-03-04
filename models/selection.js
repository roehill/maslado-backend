const { required } = require("joi");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SelectionSchema = new Schema(
  {
    galleryId: { type: Schema.Types.ObjectId, ref: "gallery", required: true },
    selectedPhotos: [
      {
        id: { type: String, required: true },
        url: { type: String, required: true },
        title: { type: String, required: true },
        printingsPrice: { type: Number, required: true },
        printings: [
          {
            size: { type: String, required: true },
            quantity: { type: Number, required: true },
            amount: { type: Number, required: false },
          },
        ],
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("selection", SelectionSchema);
