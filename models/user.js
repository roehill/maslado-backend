const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcrypt-nodejs");

const UserSchema = new Schema(
  {
    organization_name: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    role: { type: String, required: true },
    verified: { type: Boolean, required: true },
    watermark: {
      id: { type: String, required: false },
      url: { type: String, required: false },
    },
    preview: {
      id: { type: String, required: false },
      url: { type: String, required: false },
    },
    available_sessions: { type: Number, required: true },
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
