const Gallery = require("../models/gallery");
const Customer = require("../models/customer");
const User = require("../models/user");
const path = require("path");
const fs = require("fs");
const nodemailer = require("nodemailer");
const hbs = require("nodemailer-express-handlebars");
const { convert } = require("html-to-text");

exports.writeResume = async (req, res) => {
  try {
    let title = req.body.title;
    let customer = req.body.customer;
    let selectedPhotos = req.body.selectedPhotos;

    list = selectedPhotos
      .map((photo) => `<li>${photo.title}</li><span>${photo.printingsPrice ? "WYDRUKI" : "BRAK WYDRUKÓW"}</span>`)
      .join("");

    let resume = `<div><p>Podsumowanie galerii "${title}"</p><br><p>Klient: ${customer}</p><div><ol>${list}</ol></div></div>`;

    const options = {
      wordwrap: 130,
    };
    resume = convert(resume, options);

    fs.writeFile(__dirname.replace("controllers", "resumes/") + `${req.body.resumeID}.txt`, resume, (error) => {
      if (error) {
        throw error;
      }
    });
    res.json("Set file");
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.readResume = async (req, res) => {
  try {
    res.download(__dirname.replace("controllers", "resumes/") + `${req.params.id}.txt`);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.createGallery = async (req, res) => {
  try {
    let newGallery = new Gallery();

    newGallery.user = req.decoded._id;
    newGallery.customer = req.body.customer;
    newGallery.customerName = req.body.customerName;
    newGallery.title = req.body.title;
    newGallery.date = req.body.date;
    newGallery.type = req.body.type;
    newGallery.price = req.body.price;
    newGallery.paid = req.body.paid;
    newGallery.shotsQt = req.body.shotsQt;
    newGallery.selectedShotsQt = 0;
    newGallery.additionalShotPrice = req.body.additionalShotPrice;
    newGallery.ifPrintings = req.body.ifPrintings;
    newGallery.additionalPrintings = req.body.additionalPrintings;
    newGallery.photos = req.body.photos;
    newGallery.status = "new";

    // Dodaję klientowi ID tworzonej właśnie galerii
    await Customer.findOneAndUpdate({ _id: req.body.customer }, { $push: { gallery: newGallery.id } });

    // Sprawdzam, czy user ma jeszcze sesje do wykorzystania
    let availableSessions = 0;
    await User.findOne({ _id: req.decoded._id }).then((data) => {
      return (availableSessions = data.available_sessions);
    });

    // Jeśli user nie ma juz sesji do wykorzystania nie moze utworzyć nowej galerii
    if (availableSessions <= 0) {
      return res.status(402).json({ message: "Brak dostępnych sesji. Wykup pakiet." });
    } else {
      // Jeśli ma dostępne sesje odejmuję jedną
      await User.findOneAndUpdate(
        { _id: req.decoded._id },
        {
          $set: {
            available_sessions: availableSessions - 1,
          },
        }
      );
      // Zapisuję nową galerię
      await newGallery.save();
      res.json(newGallery);
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getGalleries = async (req, res) => {
  try {
    const galleries = await Gallery.find({ user: req.decoded._id });
    res.json(galleries);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getGallery = async (req, res) => {
  try {
    const gallery = await Gallery.findOne({ _id: req.params.id });
    res.json(gallery);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.updateGallery = async (req, res) => {
  if (req.body.photos.length > 500) {
    return res.status(500).json({ message: "Przekroczono dopuszczalny limit zdjęć" });
  }

  try {
    const gallery = await Gallery.findOneAndUpdate(
      { _id: req.params.id },
      {
        $set: {
          customer: req.body.customer,
          customerName: req.body.customerName,
          title: req.body.title,
          date: req.body.date,
          type: req.body.type,
          price: req.body.price,
          paid: req.body.paid,
          shotsQt: req.body.shotsQt,
          selectedShotsQt: req.body.selectedShotsQt,
          printingsQt: req.body.printingsQt,
          additionalShotPrice: req.body.additionalShotPrice,
          ifPrintings: req.body.ifPrintings,
          additionalPrintings: req.body.additionalPrintings,
          additionalPrintingsPrice: req.body.additionalPrintingsPrice,
          status: req.body.status,
          photos: req.body.photos,
        },
      },
      { upsert: true }
    );

    res.json(gallery);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.deleteGallery = async (req, res) => {
  try {
    const gallery = await Gallery.findOneAndDelete({ _id: req.params.id });
    res.json(gallery);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getCustomerGalleries = async (req, res) => {
  try {
    const galleries = await Gallery.find({
      customer: req.decoded._id,
    });

    // const galleriesSentToClient = galleries.filter(
    //   (gallery) => gallery.status === "send-to-client"
    // );

    res.json(galleries);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

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

exports.sendGalleryToCustomer = async (req, res) => {
  try {
    let organization_name = req.decoded.organization_name;
    let email = req.body.login;
    let password = req.body.passwordUnsecure;

    const mailOptions = {
      from: "EasySelection <kontakt@easyselection.pl>",
      to: email,
      subject: `${organization_name} udostępnił/a galerię ze zdjęciami do wyboru`,
      template: "send-to-client",
      context: {
        organization_name: organization_name,
        email: email,
        password: password,
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

    res.json("Wyslano galerie");
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.sendGalleryToPhotographer = async (req, res) => {
  try {
    let galleryTitle = req.body.galleryTitle;
    let email = req.body.organizationEmail;
    let customerName = req.body.customerName;

    const mailOptions = {
      from: "EasySelection <kontakt@easyselection.pl>",
      to: email,
      subject: `Klient dokonał wyboru w galerii ${galleryTitle}`,
      template: "send-to-photographer",
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

    res.json("Wyslano galerie");
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
