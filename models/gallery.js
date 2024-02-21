const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const GallerySchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "user", required: true },
  customer: { type: Schema.Types.ObjectId, ref: "customer", required: true },
  customerName: { type: String, required: true },
  title: { type: String, required: true },
  date: { type: String, required: true },
  type: { type: String, required: true },
  price: { type: Number, required: true },
  paid: { type: Number, required: true },
  shotsQt: { type: Number, required: true },
  selectedShotsQt: { type: Number, required: true },
  markedShotsQt: { type: Number, required: true },
  additionalShotPrice: { type: Number, required: true },
  ifPrintings: { type: Boolean, required: true },
  additionalPrintings: [
    {
      size: { type: String },
      freePrintings: { type: Number },
      value: { type: Number },
    },
  ],
  photos: [
    {
      id: { type: String, required: true },
      url: { type: String, required: true },
      title: { type: String, required: true },
      edited: { type: Boolean, required: true },
      selected: { type: Boolean, required: true },
      marked: { type: Boolean, required: true },
      showPrintings: { type: Boolean, required: true },
      printingsPrice: { type: Number, required: true },
      printings: [
        {
          size: { type: String, required: true },
          quantity: { type: Number, required: true },
          price: { type: Number, required: true },
        },
      ],
    },
  ],
  status: { type: String, required: true },
  viewDate: { type: String, required: false },
});

module.exports = mongoose.model("gallery", GallerySchema);
