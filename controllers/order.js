const User = require("../models/user");
const Order = require("../models/order");
const uuid = require("uuid");

const stripe = require("stripe")(process.env.STRIPE_API_KEY);
const frontendUrl = process.env.FRONTEND_URL;

exports.createCheckoutSession = async (req, res) => {
  try {
    // const order = {
    //   id: uuid.v4(),
    //   user: req.decoded._id,
    //   productName: req.body.productName,
    //   quantity: req.body.quantity,
    //   price: req.body.price,
    // };

    // const user = User.findOne({ _id: req.decoded._id });
    // if (!user) {
    //   throw new Error("Nie znaleziono użytkownika");
    // }

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
          price: '{{PRICE_ID}}',
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${YOUR_DOMAIN}?success=true`,
      cancel_url: `${YOUR_DOMAIN}?canceled=true`,
      automatic_tax: {enabled: true},
    });
  
    res.redirect(303, session.url);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
