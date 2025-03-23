const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcrypt");

const UserSchema = new Schema(
  {
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    verified: { type: Boolean, required: true, default: false },
    accountType: { type: String, required: true, default: "free" },
    role: { type: String, required: true, default: "admin" },
    availableSessions: { type: Number, required: true, default: 3 },
    organizationName: { type: String, required: true },
    name: { type: String, required: true },
    surname: { type: String, required: false },
    phone: { type: String, required: false },
    address: {
      street: { type: String },
      city: { type: String },
      zipcode: { type: String, match: [/^\d{2}-\d{3}$/, "Invalid postal code format"] },
    },
    socials: {
      webpage: { type: String, required: false },
      facebook: { type: String, required: false },
      instagram: { type: String, required: false },
    },

    taxNumber: { type: String, required: false },
    logo: { id: { type: String }, url: { type: String } },
    avatar: {
      id: { type: String },
      url: { type: String },
    },
  },
  { timestamps: true, versionKey: false }
);

UserSchema.pre("save", async function (next) {
  if (this.isModified("password") || this.isNew) {
    try {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

module.exports = mongoose.model("user", UserSchema);
