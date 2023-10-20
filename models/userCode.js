const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserCodeSchema = new Schema({
  code: { type: String, required: true },
  user: { type: Schema.Types.ObjectId, ref: "user", required: true },
});

module.exports = mongoose.model("userCode", UserCodeSchema);
