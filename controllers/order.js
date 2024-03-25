const User = require("../models/user");
const Order = require("../models/order");
const uuid = require("uuid");
const { P24 } = require("@dimski/przelewy24");

const p24 = new P24({
  prod: false, // Set to true for production environment
  merchantId: 276560,
  posId: 276560,
  apiKey: "781e2dc74f2947578b1565fb489f4702",
  crc: "a1c789f0a480100d",
  defaultValues: {
    currency: "PLN",
    country: "PL",
    language: "pl",
  },
});

exports.registerTransaction = async (req, res) => {
  try {
    const order = new Order({
      user: req.decoded._id,
      orderId: req.body.orderId,
      type: req.body.type,
      galleriesQuantity: req.body.galleriesQuantity,
      price: req.body.price,
      userEmail: req.body.email,
      description: req.body.description,
    });

    console.log(order);

    await order.save();

    const transactionData = await p24.registerTransaction({
      sessionId: req.body.orderId,
      amount: req.body.price,
      description: req.body.description,
      email: req.decoded.email,
      urlReturn: "https://maslado.com/return",
      urlStatus: "https://maslado.com/status",
      currency: "PLN",
    });

    return res.status(200).json({
      order,
      token: transactionData.token,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.verifyTransaction = async (req, res) => {
  try {
    const notificationData = {
      sessionId: "unique_session_id",
      amount: 1000,
      originAmount: 1000,
      currency: "PLN",
      orderId: 123456,
      methodId: 1,
      statement: "Payment for Order #123456",
      sign: "generated_sign_from_przelewy24",
    };

    const isNotificationValid = p24.verifyTransactionNotification(notificationData);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
