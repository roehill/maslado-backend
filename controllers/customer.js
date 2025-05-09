const Customer = require("../models/customer");
const Gallery = require("../models/gallery");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validateRegisterCustomer } = require("../validators/customerValidator");

// REGISTER CUSTOMER
exports.signupCustomer = async (req, res) => {
  try {
    const { email, password, passwordUnsecured, name, organizationEmail, notes, phone } = req.body;

    const { error } = validateRegisterCustomer(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }

    // Check if email already exist
    const checkEmail = await Customer.findOne({ email });
    if (checkEmail) {
      return res.status(400).json({
        success: false,
        message: "Istnieje już konto zarejestrowane na podany adres email.",
      });
    }

    const newCustomer = new Customer({
      organizationId: req.decoded._id,
      name,
      phone,
      email,
      organizationEmail,
      password,
      passwordUnsecured,
      notes,
      role: "customer",
    });

    await newCustomer.save();

    const token = jwt.sign(
      { _id: newCustomer._id, email: newCustomer.email, role: newCustomer.role },
      process.env.SECRET,
      { expiresIn: "7d" } // 1 week
    );

    res.status(201).json({
      success: true,
      message: "Rejestracja zakończona sukcesem.",
      token,
      newCustomer,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }

  // if (!req.body.email || !req.body.password) {
  //   res.json({
  //     success: false,
  //     message: "Please enter email and password",
  //   });
  // } else {
  //   try {
  //     let newCustomer = new Customer();

  //     newCustomer.organization = req.decoded._id;
  //     // newCustomer.organization_name = req.body.organization_name;
  //     newCustomer.name = req.body.name;
  //     newCustomer.phone = req.body.phone;
  //     newCustomer.email = req.body.email;
  //     newCustomer.organizationEmail = req.body.organizationEmail;
  //     newCustomer.password = req.body.password;
  //     newCustomer.passwordUnsecure = req.body.password;
  //     newCustomer.gallery = req.body.gallery;
  //     newCustomer.notes = req.body.notes;
  //     newCustomer.role = "customer";

  //     const checkEmail = await Customer.findOne({ email: req.body.email });
  //     if (checkEmail) {
  //       return res.status(400).json({
  //         message: "Istnieje juz konto zarejestrowane na podany adres email",
  //       });
  //     }

  //     await newCustomer.save();
  //     let token = jwt.sign(newCustomer.toJSON(), process.env.SECRET, {
  //       expiresIn: 604800, // 1 week
  //     });

  //     res.json({
  //       success: true,
  //       token: token,
  //       newCustomer,
  //     });
  //   } catch (error) {
  //     res.json({
  //       success: false,
  //       message: error.message,
  //     });
  //   }
  // }
};

// GET USER CUSTOMERS
exports.getUserCustomers = async (req, res) => {
  try {
    let customers = await Customer.find({ organizationId: req.decoded._id }).sort({
      date: -1,
    });
    res.json(customers);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET SINGLE CUSTOMER
exports.getSingleCustomer = async (req, res) => {
  try {
    let customer = await Customer.findOne({ _id: req.params.id });

    res.json(customer);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// EDIT CUSTOMER
exports.editCustomer = async (req, res) => {
  try {
    let customer = await Customer.findOneAndUpdate(
      { _id: req.params.id },
      {
        $set: {
          name: req.body.name,
          phone: req.body.phone,
          notes: req.body.notes,
        },
      },
      { upsert: true }
    );
    res.json({
      status: true,
      customer: customer,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// LOGIN CUSTOMER
exports.loginCustomer = async (req, res) => {
  try {
    const { email, password } = req.body;
    let customer = await Customer.findOne({ email: email });

    if (!customer) {
      return res.status(403).json({
        success: false,
        message: "Nie znaleziono takiego użytkownika.",
      });
    }

    const check = await bcrypt.compare(password, customer.password);
    if (!check) {
      return res.status(403).json({
        success: false,
        message: "Hasło nie pasuje do podanego użytkownika",
      });
    }

    let token = jwt.sign(customer.toJSON(), process.env.SECRET, {
      expiresIn: 604800, // 1 week
    });

    res.json({ success: true, token: token, user: customer });
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
};

// DELETE CUSTOMER
exports.deleteCustomer = async (req, res) => {
  try {
    let customer = await Customer.findByIdAndDelete({ _id: req.params.id });

    res.json({
      status: true,
      message: "Succesfully deleted",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET CUSTOMER GALLERIES
exports.getCustomerGalleries = async (req, res) => {
  try {
    const galleries = await Gallery.find({
      customerId: req.params.id,
    });

    res.status(200).json(galleries);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
