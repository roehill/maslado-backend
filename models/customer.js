const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcrypt-nodejs");

const CustomerSchema = new Schema({
  organization: { type: Schema.Types.ObjectId, ref: "users" },
  organization_name: { type: String, required: true },
  name: { type: String, required: true },
  phone: { type: String, required: false },
  email: { type: String, unique: true, required: true },
  organizationEmail: { type: String, required: true },
  password: { type: String, required: true },
  passwordUnsecure: { type: String, required: true },
  role: { type: String, required: true },
  gallery: { type: Array },
  notes: { type: String },
});

CustomerSchema.pre("save", function (next) {
  let customer = this;
  if (this.isModified("password") || this.isNew) {
    bcrypt.genSalt(10, function (error, salt) {
      if (error) {
        return next(error);
      }

      bcrypt.hash(customer.password, salt, null, function (error, hash) {
        if (error) {
          return next(error);
        }

        customer.password = hash;
        next();
      });
    });
  } else {
    return next();
  }
});

CustomerSchema.methods.comparePassword = async function (password, next) {
  let customer = this;
  return await bcrypt.compareSync(password, customer.password);
};

module.exports = mongoose.model("customer", CustomerSchema);
