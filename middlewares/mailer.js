const nodemailer = require("nodemailer");
const { google } = require("googleapis");

const { OAuth2 } = google.auth;
const oauth_link = "https://developers.google.com/oauthplayground";
const { EMAIL, MAILING_ID, MAILING_REFRESH, MAILING_SECRET } = process.env;

const auth = new OAuth2(
  MAILING_ID,
  MAILING_SECRET,
  MAILING_REFRESH,
  oauth_link
);

exports.sendVerificationEmail = (email, name, url) => {
  auth.setCredentials({
    refresh_token: MAILING_REFRESH,
  });

  const accessToken = auth.getAccessToken();

  const stmp = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.AUTH_EMAIL,
      pass: process.env.AUTH_PASS,
    },
  });

  const mailOptions = {
    from: EMAIL,
    to: email,
    subject: "Easy Selection email verification",
    html: `<div><h2>Witaj ${name}.
    Aby dokończyć rejestrację konta w serwisie Easy Selection, kliknij w link aktywacyjny</h2><a href=${url}>Aktywuj konto</a></div>`,
  };

  stmp.sendMail(mailOptions, (err, res) => {
    if (err) return err;
    return res;
  });
};
