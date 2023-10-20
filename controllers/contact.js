const Question = require("../models/question");

const nodemailer = require("nodemailer");
const hbs = require("nodemailer-express-handlebars");
const path = require("path");
const { google } = require("googleapis");

// nodemailer
let transporter = nodemailer.createTransport({
  host: "roehill.atthost24.pl",
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

// SEND QUESTION
exports.sendQuestion = async (req, res) => {
  try {
    let question = new Question();

    question.name = req.decoded.name;
    question.email = req.decoded.email;
    question.title = req.body.title;
    question.question = req.body.question;

    const stmp = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.AUTH_EMAIL,
        pass: process.env.AUTH_PASS,
      },
    });

    const mailOptions = {
      from: "EasySelection <kontakt@easyselection.pl>",
      to: "roehilldev@gmail.com",
      subject: question.title,
      html: `Pytanie od: ${question.email} <br><br> ${question.question}`,
    };

    transporter.sendMail(mailOptions);

    question.save();
    res.json(question);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
