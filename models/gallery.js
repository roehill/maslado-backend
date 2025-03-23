const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const GallerySchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "user", required: true },
    customerId: { type: Schema.Types.ObjectId, ref: "customer", required: true },
    customerName: { type: String, required: true },
    title: { type: String, required: true },
    date: { type: Date, required: true },
    type: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
    amountPaid: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
      validate: {
        validator: function (value) {
          return value <= this.amount;
        },
        message: "Amount paid cannot exceed the total amount.",
      },
    },
    shotsIncluded: { type: Number, required: true },
    shotsSelected: { type: Number, required: true },
    shotsMarked: { type: Number, required: true },
    additionalShotPrice: { type: Number, required: true },
    isPrintingAvailable: { type: Boolean, required: true },
    additionalPrintings: [
      {
        size: { type: String },
        freePrintings: { type: Number },
        amount: { type: Number },
      },
    ],
    photosLimit: { type: Number, required: true },
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
            amount: { type: Number, required: true },
          },
        ],
        required: false,
      },
    ],
    editedPhotos: [
      {
        id: { type: String, required: true },
        url: { type: String, required: true },
        title: { type: String, required: true },
        edited: { type: Boolean, required: true },
        required: false,
      },
    ],
    status: {
      type: String,
      required: true,
      enum: ["new", "sent", "selected", "edited", "done"],
      default: "new",
    },
    viewDate: { type: Date, required: false },
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("gallery", GallerySchema);
