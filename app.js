const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const multer = require("multer");

dotenv.config();

// SERVER
const app = express();
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

// CORS - w przyszlosci zmienic na jedną domenę
app.use(
  cors({
    origin: "*",
  })
);

// MIDDLEWARES
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// DATABASE
mongoose.connect(process.env.DATABASE, (error) => {
  if (error) {
    console.log(error);
  } else {
    console.log("Connected to MongoDB!");
  }
});

// UPLOADING IMAGES
const storage = multer.memoryStorage();
const upload = multer({ storage });
// const fileStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "images");
//   },
//   filename: (req, file, cb) => {
//     cb(null, file.originalname);
//   },
// });

// const fileFilter = (req, file, cb) => {
//   if (file.mimetype === "image/png" || file.mimetype === "image/jpg" || file.mimetype === "image/jpeg") {
//     cb(null, true);
//   } else {
//     cb(null, false);
//   }
// };
// const upload = multer({ storage: fileStorage, fileFilter: fileFilter }).array("photo");
// app.use(multer({ storage: fileStorage, fileFilter: fileFilter }).array("photo"));

// ROUTES
const galleriesRoutes = require("./routes/galleries");
app.use("/api/galleries", galleriesRoutes);

const selectionsRoutes = require("./routes/selections");
app.use("/api/selections", selectionsRoutes);

const uploadRoutes = require("./routes/upload");
app.use("/api/upload", upload.array("photo"), uploadRoutes);

const usersRoutes = require("./routes/user");
app.use("/api/users", usersRoutes);

const customersRoutes = require("./routes/customers");
app.use("/api/customers", customersRoutes);

const contactsRoutes = require("./routes/contacts");
app.use("/api/contacts", contactsRoutes);

const bundlesRoutes = require("./routes/bundles");
app.use("/api/bundles", bundlesRoutes);

app.use("/uploads/images", express.static(path.join("uploads", "images")));

// 4TyDPSmGN5mawPCN

//Access Key ID: AKIAUPAVTCMUWNSJ5DZH
// Secret Access Key: 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
