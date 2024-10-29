const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PaymentSchema = new Schema(
  {
    customer: { type: Schema.Types.ObjectId, ref: "user", required: true },
    galleryId: { type: Schema.Types.ObjectId, ref: "gallery", required: true },
    customerEmail: { type: String, required: true },
    isVerified: { type: Boolean, required: true },
    sessionId: { type: String, required: true },
    price: { type: Number, required: true },
    amount: { type: Number, required: true }, // kwota podana w groszach
    currency: { type: String, required: true },
    description: { type: String, required: true },
    orderId: { type: Number, required: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("payment", PaymentSchema);
