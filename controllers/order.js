const User = require("../models/user");
const Order = require("../models/order");
const uuid = require("uuid");
const { P24 } = require("@dimski/przelewy24");
const nodemailer = require("nodemailer");
const hbs = require("nodemailer-express-handlebars");
const path = require("path");

const p24 = new P24({
  prod: true, // Set to true for production environment
  merchantId: 276560,
  posId: 276560,
  apiKey: "4aba52910879b7bfaba0dcb3a10e7bff",
  crc: "553253f366ef0149",
  // apiKey: "781e2dc74f2947578b1565fb489f4702",
  // crc: "a1c789f0a480100d",
  defaultValues: {
    currency: "PLN",
    country: "PL",
    language: "pl",
  },
});

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
    await p24.testAccess();
    return res.status(200).json(true);
  } catch (error) {
    return res.status(500).json(false);
  }
};

// exports.registerTransaction = async (req, res) => {
//   try {
//     const {
//       userName,
//       userEmail,
//       userSurname,
//       address,
//       city,
//       zipcode,
//       taxNumber,
//       sessionId,
//       type,
//       galleriesQuantity,
//       price,
//       amount,
//       description,
//     } = req.body;

//     const order = new Order({
//       // Informacje o userze
//       userId: req.decoded._id,
//       userName: userName,
//       userEmail: userEmail,
//       userSurname: userSurname,
//       address: address,
//       city: city,
//       zipcode: zipcode,
//       taxNumber: taxNumber,
//       // Informacje o zamówieniu
//       sessionId: sessionId,
//       type: type,
//       galleriesQuantity: galleriesQuantity,
//       price: price,
//       amount: amount, // amount to cena podana w groszach
//       description: description,
//       currency: "PLN",
//       isVerified: false,
//     });

//     const data = {
//       sessionId: sessionId,
//       amount: amount,
//       description: description,
//       email: userEmail,
//       client: `${userName} ${userSurname}`,
//       urlReturn: `https://app.maslado.com/orders/return?sessionId=${sessionId}`,
//       // urlReturn: `https://maslado.com/orders/return?orderId=${sessionId}`,

//       urlStatus: `https://www.maslado-api.com/api/orders/verify-transaction`,
//       // urlStatus: `http://localhost:5000/api/orders/verify-transaction`,
//       currency: "PLN",
//     };

//     const transactionData = await p24.registerTransaction(data);

//     if (transactionData) {
//       await order.save();
//       return res.status(200).json({
//         order,
//         token: transactionData.token,
//       });
//     } else {
//       return res.status(500).json("Nie udało się stworzyć zamówienia.");
//     }
//   } catch (error) {
//     return res.status(500).json({ message: error.message });
//   }
// };

exports.registerTransaction = async (req, res) => {
  try {
    const {
      userName,
      userEmail,
      userSurname,
      address,
      city,
      zipcode,
      taxNumber,
      sessionId,
      type,
      galleriesQuantity,
      price,
      amount,
      description,
    } = req.body;

    const order = new Order({
      // Informacje o userze
      userId: req.decoded._id,
      userName: userName,
      userEmail: userEmail,
      userSurname: userSurname,
      address: address,
      city: city,
      zipcode: zipcode,
      taxNumber: taxNumber,
      // Informacje o zamówieniu
      sessionId: sessionId,
      type: type,
      galleriesQuantity: galleriesQuantity,
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
      email: userEmail,
      client: `${userName} ${userSurname}`,
      urlReturn: `https://app.maslado.com/orders/return?sessionId=${sessionId}`,
      // urlReturn: `https://maslado.com/orders/return?orderId=${sessionId}`,

      urlStatus: `https://www.maslado-api.com/api/orders/verify-transaction`,
      // urlStatus: `http://localhost:5000/api/orders/verify-transaction`,
      currency: "PLN",
    };

    const transactionData = await p24.registerTransaction(data);

    if (transactionData) {
      await order.save();
      return res.status(200).json({
        order,
        token: transactionData.token,
      });
    } else {
      return res.status(500).json("Nie udało się stworzyć zamówienia.");
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.verifyTransaction = async (req, res) => {
  try {
    const { sessionId, orderId, amount, currency, sign } = req.body;

    // Weryfikacja transakcji w Przelewy24
    const verifyData = {
      sessionId: sessionId,
      orderId: Number(orderId),
      amount: Number(amount),
      currency: currency,
    };

    const isTransactionVerified = await p24.verifyTransaction(verifyData);

    console.log(`isTransactionVerified : ${isTransactionVerified}`);

    if (isTransactionVerified) {
      try {
        let order = await Order.findOneAndUpdate(
          { sessionId: sessionId },
          {
            $set: {
              isVerified: true,
            },
          },
          { upsert: true }
        );

        const user = await User.findOne({ _id: order.userId });

        await User.findOneAndUpdate(
          { _id: order.userId },
          {
            $set: {
              availableSessions: user.availableSessions + order.galleriesQuantity,
              accountType: "premium",
            },
          },
          { upsert: true }
        );
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

exports.getOrder = async (req, res) => {
  try {
    const { sessionId } = req.params;
    console.log(sessionId);
    const order = await Order.findOne({ sessionId: req.params.sessionId });

    res.json(order);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.decoded._id, isVerified: true });

    res.json(orders);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.requestInvoice = async (req, res) => {
  try {
    const { orderId, email } = req.body;

    const updatedOrder = await Order.findOneAndUpdate(
      { _id: orderId },
      {
        $set: {
          invoice: true,
        },
      },
      { upsert: true }
    );

    const mailOptions = {
      from: "Maslado <kontakt@maslado.com>",
      to: "roehilldev@gmail.com",
      subject: `Zgłoszono potrzebę faktury`,
      template: "invoice-request",
      context: {
        email: email,
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

    res.json({
      message: `Wysłano prośbę o dostarczenie faktury. Zostanie wysłana na adres email ${email}`,
      updatedOrder,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
