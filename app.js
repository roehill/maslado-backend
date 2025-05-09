const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const multer = require("multer");
const fileUpload = require("express-fileupload");

dotenv.config();

// SERVER
const app = express();
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

// CORS - w przyszlosci zmienic na jedną domenę
app.use(cors());

// MIDDLEWARES
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: false }));

app.use(fileUpload());

// DATABASE
mongoose.connect(process.env.DATABASE, (error) => {
  if (error) {
    console.log(error);
  } else {
    console.log("Connected to MongoDB!");
  }
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "temp");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

// ROUTES
app.get("/", (req, res) => {
  res.send("Maslado REST API 0.10");
});

const galleriesRoutes = require("./routes/galleries");
app.use("/api/galleries", galleriesRoutes);

const selectionsRoutes = require("./routes/selections");
app.use("/api/selections", selectionsRoutes);

const uploadRoutes = require("./routes/upload");
app.use("/api/upload", uploadRoutes);

const usersRoutes = require("./routes/user");
app.use("/api/users", usersRoutes);

const userOptionsRoutes = require("./routes/userOptions");
app.use("/api/user-options", userOptionsRoutes);

const userPaymentsDetailsRoutes = require("./routes/userPaymentsDetails");
app.use("/api/user-payments-details", userPaymentsDetailsRoutes);

const customersRoutes = require("./routes/customers");
app.use("/api/customers", customersRoutes);

const contactsRoutes = require("./routes/contacts");
app.use("/api/contacts", contactsRoutes);

const ordersRoutes = require("./routes/orders");
app.use("/api/orders", ordersRoutes);

const paymentsRoutes = require("./routes/payments");
app.use("/api/payments", paymentsRoutes);

const eventsRoutes = require("./routes/events");
app.use("/api/events", eventsRoutes);

const resumeRoutes = require("./routes/resumes");
app.use("/api/resumes", resumeRoutes);

app.use("/uploads/images", express.static(path.join("images")));
app.use("/uploads/archives", express.static(path.join("archives")));
