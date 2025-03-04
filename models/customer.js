const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const Schema = mongoose.Schema;

const CustomerSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "users" },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    passwordUnsecured: { type: String, required: true },
    name: { type: String, required: true },
    phone: { type: String },
    organizationId: { type: String, required: true },
    organizationEmail: { type: String, required: true },
    role: { type: String, required: true, enum: ["admin", "user", "customer"] },
    galleries: { type: Array },
    notes: { type: String },
  },
  { timestamps: true }
);

CustomerSchema.pre("save", async function (next) {
  if (this.isModified("password") || this.isNew) {
    try {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(this.password, salt);
      this.password = hash;
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

CustomerSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model("customer", CustomerSchema);
