const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const OrderSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "user", required: true },
    userEmail: { type: String, required: true },
    orderId: { type: String, required: true },
    type: { type: String, required: true },
    galleriesQuantity: { type: Number, required: true },
    price: { type: Number, required: true },
    description: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("order", OrderSchema);
