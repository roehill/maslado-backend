const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserVerificationSchema = new Schema({
  userID: { type: String, required: true },
  uniqueString: { type: String, required: true },
  createdAt: { type: Date, required: true },
  expiresAt: { type: Date, required: true },
});

module.exports = mongoose.model("userVerification", UserVerificationSchema);
