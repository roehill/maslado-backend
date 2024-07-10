const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const OrderSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "user", required: true },
    userEmail: { type: String, required: true },
    userName: { type: String, required: true },
    userSurname: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    zipcode: { type: String, required: true },
    taxNumber: { type: String, required: true },
    isVerified: { type: Boolean, required: true },
    sessionId: { type: String, required: true },
    type: { type: String, required: true },
    galleriesQuantity: { type: Number, required: true },
    price: { type: Number, required: true },
    amount: { type: Number, required: true }, // kwota podana w groszach
    currency: { type: String, required: true },
    description: { type: String, required: true },
    orderId: { type: Number, required: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("order", OrderSchema);
