const mongoose = require("mongoose");
const { Schema } = mongoose;

const UserPaymentsDetailsSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User", // Referencja do modelu User
      required: true,
    },
    defaultCurrency: {
      type: String,
      required: true,
    },
    defaultLanguage: {
      type: String,
      required: true,
    },
    p24Id: {
      type: Number,
      required: false,
      default: null, // Domyślnie brak
    },
    crcKey: {
      type: String,
      required: false,
      default: null,
    },
    apiKey: {
      type: String,
      required: false,
      default: null,
    },
    isPaymentsAvailable: {
      type: Boolean,
      required: true,
      default: false, // Domyślnie płatności wyłączone
    },
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("UserPaymentsDetails", UserPaymentsDetailsSchema);
