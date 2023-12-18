const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SelectionSchema = new Schema(
  {
    gallery: { type: Schema.Types.ObjectId, ref: "gallery", required: true },
    photos: [
      // {
      //   id: { type: String, required: true },
      //   url: { type: String, required: true },
      //   title: { type: String, required: true },
      //   edited: { type: Boolean, required: true },
      //   selected: { type: Boolean, required: true },
      //   showPrintings: { type: Boolean, required: true },
      //   printingsPrice: { type: Number, required: true },
      //   printings: [
      //     {
      //       size: { type: String, required: true },
      //       quantity: { type: Number, required: true },
      //       price: { type: Number, required: true },
      //     },
      //   ],
      // },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("selection", SelectionSchema);
