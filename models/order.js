const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const OrderSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "user", required: true },
    type: { type: String, required: true },
    galleriesQuantity: { type: String, required: true },
    price: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("bundle", OrderSchema);
