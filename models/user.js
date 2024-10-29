const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcrypt-nodejs");

const UserSchema = new Schema(
  {
    organization_name: { type: String, required: true },
    name: { type: String, required: true },
    surname: { type: String, required: false },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    webpage: { type: String, required: false },
    facebook: { type: String, required: false },
    instagram: { type: String, required: false },
    phone: { type: String, required: false },
    defaultCurrency: { type: String, required: true },
    defaultLanguage: { type: String, required: true },
    address: { type: String, required: false },
    city: { type: String, required: false },
    zipcode: { type: String, required: false },
    taxNumber: { type: String, required: false },
    role: { type: String, required: true },
    verified: { type: Boolean, required: true },
    logo: { id: { type: String }, url: { type: String } },
    avatar: {
      id: { type: String },
      url: { type: String },
    },
    available_sessions: { type: Number, required: true },
    p24ID: { type: Number, required: false },
    CRCkey: { type: String, required: false },
    APIkey: { type: String, required: false },
    payments: { type: Boolean, required: true },
  },
  { timestamps: true }
);

UserSchema.pre("save", function (next) {
  let user = this;
  if (this.isModified("password") || this.isNew) {
    bcrypt.genSalt(10, function (error, salt) {
      if (error) {
        return next(error);
      }

      bcrypt.hash(user.password, salt, null, function (error, hash) {
        if (error) {
          return next(error);
        }

        user.password = hash;
        next();
      });
    });
  } else {
    return next();
  }
});

// UserSchema.methods.comparePassword = async function (password, next) {
//   let user = this;
//   return await bcrypt.compareSync(password, user.password);
// };

module.exports = mongoose.model("user", UserSchema);
