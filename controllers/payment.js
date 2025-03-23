const { P24 } = require("@dimski/przelewy24");
const nodemailer = require("nodemailer");
const hbs = require("nodemailer-express-handlebars");
const path = require("path");
const Payment = require("../models/payment");
const User = require("../models/user");
const UserPaymentsDetails = require("../models/userPaymentsDetails");
const Customer = require("../models/customer");
const Gallery = require("../models/gallery");
const { log } = require("console");

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

exports.testAccess = async (req, res) => {
  try {
    const { p24Id, apiKey, crcKey } = req.body;

    const p24 = new P24({
      prod: true, // Set to true for production environment
      merchantId: p24Id,
      posId: p24Id,
      apiKey: apiKey,
      crc: crcKey,
      defaultValues: {
        currency: "PLN",
        country: "PL",
        language: "pl",
      },
    });

    await p24.testAccess();
    return res
      .status(200)
      .json({ success: true, message: "Połączenie skonfigurowane prawidłowo. Możesz zapisać zmiany." });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Wystąpił problem z integracją. Sprawdź czy podane dane są poprawne bądź skontaktuj się z nami. ",
    });
  }
};

exports.registerPayment = async (req, res) => {
  try {
    const { customerEmail, galleryId, sessionId, price, amount, description, userId, client } = req.body;

    const userPaymentsDetail = await UserPaymentsDetails.findOne({ userId: userId });

    const p24 = new P24({
      prod: true, // Set to true for production environment
      merchantId: userPaymentsDetail.p24Id,
      posId: userPaymentsDetail.p24Id,
      apiKey: userPaymentsDetail.apiKey,
      crc: userPaymentsDetail.crcKey,
      defaultValues: {
        currency: "PLN",
        country: "PL",
        language: "pl",
      },
    });

    const payment = new Payment({
      // Informacje o userze
      customer: req.decoded._id,
      galleryId: galleryId,
      customerEmail: customerEmail,
      // Informacje o płatności
      sessionId: sessionId,
      price: price,
      amount: amount, // amount to cena podana w groszach
      description: description,
      currency: "PLN",
      isVerified: false,
    });

    const data = {
      sessionId: sessionId,
      amount: amount,
      description: description,
      email: customerEmail,
      client: client,
      urlReturn: `http://localhost:3000/customer-panel`,
      // urlStatus: `https://www.maslado-api.com/api/orders/verify-transaction`,
      urlStatus: `https://www.maslado-api.com/api/payments/verify-payment`,
      currency: "PLN",
    };

    const transactionData = await p24.registerTransaction(data);

    if (transactionData) {
      await payment.save();
      return res.status(200).json({
        payment,
        token: transactionData.token,
      });
    } else {
      return res.status(500).json("Nie udało się stworzyć zamówienia.");
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    console.log("ASd");

    const { sessionId, orderId, amount, currency, sign } = req.body;

    const user = await User.findOne({ sessionId: sessionId });
    const userPaymentsDetails = await UserPaymentsDetails({ userId: user._id });

    const p24 = new P24({
      prod: true, // Set to true for production environment
      merchantId: userPaymentsDetails.p24Id,
      posId: userPaymentsDetails.p24Id,
      apiKey: userPaymentsDetails.apiKey,
      crc: userPaymentsDetails.crcKey,
      defaultValues: {
        currency: "PLN",
        country: "PL",
        language: "pl",
      },
    });

    console.log(user);

    // Weryfikacja transakcji w Przelewy24
    const verifyData = {
      sessionId: sessionId,
      orderId: orderId,
      amount: Number(amount),
      currency: currency,
    };

    const isTransactionVerified = await p24.verifyTransaction(verifyData);

    if (isTransactionVerified) {
      try {
        const payment = await Payment.findOne({ sessionId: sessionId });
        // Tutaj możesz wykonać operacje na znalezionym rekordzie
        payment.isVerified = true;
        // Zapisz zmiany w bazie danych
        await payment.save();
        // Wyciągam informacje o nazwie klienta
        const customer = await Customer.findOne({ _id: payment.customer });

        // const payment = await Payment.findOneAndUpdate(
        //   { sessionId: sessionId },
        //   {
        //     $set: {
        //       isVerified: true,
        //     },
        //   },
        //   { upsert: true }
        // );

        const gallery = await Gallery.findOne({ _id: payment.galleryId });

        await Gallery.findOneAndUpdate(
          { _id: payment.galleryId },
          {
            $set: {
              paid: gallery.paid + Number(amount) / 100,
            },
          },
          { upsert: true }
        );

        sendEmailToPhotographer(user.email, gallery.title, customer.name);
      } catch (error) {
        return res.status(500).json("Order cannot be verified.");
      }
      return res.status(200).json("Transaction verified successfully.");
    } else {
      return res.status(500).json("Transaction verification failed.");
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const sendEmailToPhotographer = async (email, galleryTitle, customerName) => {
  try {
    const mailOptions = {
      from: "Maslado <kontakt@maslado.com>",
      to: email,
      subject: `Klient dokonał płatności`,
      template: "information-about-payment",
      context: {
        galleryTitle: galleryTitle,
        customerName: customerName,
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
  } catch (error) {
    console.log(error);
  }
};
