const User = require("../models/user");
const Code = require("../models/userCode");
const UserVerification = require("../models/userVerification");
const UserOptions = require("./../models/userOptions");
const UserPaymentsDetails = require("./../models/userPaymentsDetails");
const nodemailer = require("nodemailer");
const hbs = require("nodemailer-express-handlebars");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { validateEmail } = require("../middlewares/validations");
const { log } = require("console");

const { validateRegisterUser } = require("../validators/userValidator");

// nodemailer
let transporter = nodemailer.createTransport({
  host: "smtp.hostinger.com",
  port: 465,
  secure: true, // upgrade later with STARTTLS
  auth: {
    user: process.env.AUTH_EMAIL,
    pass: process.env.AUTH_PASS,
  },
});

transporter.use(
  "compile",
  hbs({
    viewEngine: {
      defaultLayout: false,
    },
    viewPath: path.resolve("./views"),
  })
);

const sendVerificationEmail = ({ _id, email, name }, res) => {
  const currentURL = process.env.API_URL;
  const uniqueString = uuidv4() + _id;

  const mailOptions = {
    // from: process.env.AUTH_EMAIL,
    from: "Maslado <kontakt@maslado.com>",
    to: email,
    subject: "Weryfikacja konta",
    template: "registration",
    context: {
      name: name,
      verifyLink: currentURL + "/users/verify/" + _id + "/" + uniqueString,
    },
    attachments: [
      {
        filename: "logo.png",
        path: path.resolve("./views/logo.png"),
        cid: "imagename",
      },
    ],
  };

  const saltRounds = 10;
  bcrypt
    .hash(uniqueString, saltRounds)
    .then((hashedUniqueString) => {
      const newVerification = new UserVerification({
        userID: _id,
        uniqueString: hashedUniqueString,
        createdAt: Date.now(),
        expiresAt: Date.now() + 21600000,
      });

      newVerification
        .save()
        .then(() => {
          transporter.sendMail(mailOptions);
        })
        .catch(() => {
          res.json({
            success: false,
            message: "Wystąpił błąd",
          });
        });
    })
    .catch(() => {
      res.json({
        success: false,
        message: "Wystąpił błąd",
      });
    });
};

// REGISTER USER
exports.registerUser = async (req, res) => {
  try {
    // Enter validation
    const { email, password, organization, name } = req.body;

    const { error } = validateRegisterUser(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }

    // Check if user already exist
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Konto już istnieje." });
    }

    // Create user
    const newUser = new User({
      organizationName: organization,
      name,
      email,
      password,
      role: "admin",
      defaultLanguage: "PL",
      defaultCurrency: "PLN",
    });

    const newUserOptions = new UserOptions({
      userId: newUser._id,
      paymentsMessage: "",
    });
    console.log(newUserOptions);

    const newUserPaymentsDetails = new UserPaymentsDetails({
      userId: newUser._id,
      defaultCurrency: "PLN",
      defaultLanguage: "PL",
      isPaymentsAvailable: false,
    });

    await newUser.save();
    await newUserOptions.save();
    await newUserPaymentsDetails.save();
    sendVerificationEmail(newUser);

    // Generate token
    const token = jwt.sign({ id: newUser._id }, process.env.SECRET, { expiresIn: "7d" });

    res.status(201).json({ success: true, token });
  } catch (error) {
    res.json({
      success: false,
      message: error.message,
    });
  }
};

// VERIFY EMAIL
exports.verifyEmail = async (req, res) => {
  let { userID, uniqueString } = req.params;

  console.log(userID);

  UserVerification.find({ userID })
    .then((result) => {
      console.log(result);

      if (result.length > 0) {
        const { expiresAt } = result[0];
        const hashedUniqueString = result[0].uniqueString;

        if (expiresAt < Date.now()) {
          UserVerification.deleteOne({ userID }).then((result) => {
            User.deleteOne({ _id: userID });
          });
        } else {
          bcrypt.compare(uniqueString, hashedUniqueString).then((result) => {
            if (result) {
              User.updateOne({ _id: userID }, { verified: true })
                .then(() => {
                  UserVerification.deleteOne({ userID }).then(() => {
                    res.sendFile(path.join(__dirname, "../views/verified.html"));
                  });
                })
                .catch((error) => {
                  console.log(error);
                });
            } else {
              let message = "blad";
              res.redirect(`/users/verified/error=true&message=${message}`);
            }
          });
        }
      } else {
        let message = "asd";
        res.sendFile(path.join(__dirname, "../views/verified.html"));
      }
    })
    .catch((error) => {
      console.log(error);
      let message = "An easdasded";
      res.redirect(`/users/verified/error=true&message=${message}`);
    });
};

// ACTIVATE ACCOUNT
exports.activateAccount = async (req, res) => {
  const { token } = req.body;

  const user = jwt.verify(token, process.env.SECRET);

  const checkUser = await User.findById(user._id);
  if (checkUser.verified == true) {
    return res.status(400).json({ message: "This email is already activated" });
  } else {
    await User.findByIdAndUpdate(user._id, { verified: true });
    return res.status(200).json({ message: "Account has been activated seccessfully" });
  }
};

// LOG IN
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    let user = await User.findOne({ email: email });
    if (!user) {
      return res.status(403).json({
        success: false,
        message: "Nie znaleziono takiego użytkownika",
      });
    }

    const check = await bcrypt.compare(password, user.password);
    if (!check) {
      return res.status(403).json({
        success: false,
        message: "Hasło nie pasuje do podanego użytkownika",
      });
    }

    if (user.verified === false) {
      return res.status(403).json({
        success: false,
        message: "Konto nie zostało aktywowane.",
      });
    }

    let token = jwt.sign(user.toJSON(), process.env.SECRET, {
      expiresIn: 604800, // 1 week
    });

    res.json({ success: true, token: token, user: user });
  } catch (error) {
    res.json({
      success: false,
      message: error.message,
    });
  }
};

// GET USER
exports.getUser = async (req, res) => {
  try {
    let foundUser = await User.findOne({ _id: req.decoded._id }).select("-password");
    if (foundUser) {
      res.json(foundUser);
    }
  } catch (error) {
    res.json({
      success: false,
      message: error.message,
    });
  }
};

const sendResetPasswordEmail = (email, name, code) => {
  const mailOptions = {
    from: "Maslado <kontakt@maslado.com>",
    to: email,
    subject: "Odzyskiwanie hasła",
    template: "resetPassword",
    context: {
      name: name,
      code: code,
    },
    attachments: [
      {
        filename: "logo.png",
        path: path.resolve("./views/logo.png"),
        cid: "imagename",
      },
    ],
  };

  transporter.sendMail(mailOptions);
};

// FIND USER
exports.findUser = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email: email }).select("-password");
    console.log(user);
    if (!user) {
      return res.status(404).json({ message: "Konto nie istnieje" });
    }

    return res.status(200).json({
      email: user.email,
      name: user.name,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// FIND USER by galleries user (photographer)
exports.findUserByUserID = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.userID }).select("-password");

    return res.status(200).json({
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const generateCode = (length) => {
  let code = "";
  let schema = "0123456789";

  for (let i = 0; i < length; i++) {
    code += schema.charAt(Math.floor(Math.random() * schema.length));
  }

  return code;
};

// SEND RESET PASSWORD CODE
exports.sendResetPasswordCode = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email: email }).select("-password");

    if (!user) {
      return res.status(400).json({ message: "Konto nie istnieje" });
    }

    await Code.findOneAndRemove({ user: user._id });
    const code = generateCode(5);

    sendResetPasswordEmail(user.email, user.name, code);

    const savedCode = new Code({
      code,
      user: user._id,
    });

    await savedCode.save();

    return res.status(200).json({
      message: "Kod weryfikacyjny został wysłany na podany adres email",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// VALIDATE RESET CODE
exports.validateResetCode = async (req, res) => {
  try {
    const { email, code } = req.body;
    const user = await User.findOne({ email });
    const DBcode = await Code.findOne({ user: user._id });

    if (DBcode.code !== code) {
      return res.status(400).json({ message: "Kod weryfikacyjny jest niepoprawny" });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//CHANGE PASSWORD
exports.changePassword = async (req, res) => {
  try {
    const { email, password, passwordConfirm } = req.body;

    if (password != passwordConfirm) {
      return res.status(400).json({ message: "Hasła nie pasują do siebie" });
    }

    const cryptedPassword = await bcrypt.hash(password, 12);
    await User.findOneAndUpdate({ email }, { password: cryptedPassword });

    return res.status(200).json({ success: true, message: "Hasło zostało poprawnie zmienione" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// EDIT USER
exports.editUser = async (req, res) => {
  try {
    console.log(req.body);
    const { name, surname, phone, socials, organizationName, address, taxNumber, avatarID, avatarURL } = req.body;

    const user = await User.findOneAndUpdate(
      { _id: req.decoded._id },
      {
        $set: {
          availableSessions: req.body.availableSessions,
          name: name,
          surname: surname,
          phone: phone,
          address: {
            street: address?.street,
            city: address?.city,
            zipcode: address?.zipcode,
          },
          socials: {
            webpage: socials?.webpage,
            facebook: socials?.facebook,
            instagram: socials?.instagram,
          },
          organizationName: organizationName,
          taxNumber: taxNumber,
        },
      },
      { upsert: true }
    );
    console.log(user);

    res.json(user);
  } catch (error) {
    res.json({
      success: false,
      message: error.message,
    });
  }
};

// EDIT AVATAR
exports.editAvatar = async (req, res) => {
  try {
    const { avatarID, avatarURL } = req.body;

    const user = await User.findOneAndUpdate(
      { _id: req.decoded._id },
      {
        $set: {
          avatar: {
            id: avatarID,
            url: avatarURL,
          },
        },
      },
      { upsert: true }
    );

    res.json(user);
  } catch (error) {
    res.json({
      success: false,
      message: error.message,
    });
  }
};
