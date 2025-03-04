const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserOptionsSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "user", required: true },
    paymentsMessage: { type: String, required: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("userOptions", UserOptionsSchema);
