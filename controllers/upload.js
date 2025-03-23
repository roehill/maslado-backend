const User = require("../models/user");
const fs = require("fs");
const uuid = require("uuid");
const sharp = require("sharp");
const JSZip = require("jszip");
const { log } = require("console");
// const zip = new JSZip();

const archiver = require("archiver");
const zip = archiver("zip", { zlib: { level: 9 } });

exports.uploadPhotos = async (req, res) => {
  try {
    // Zmienne potrzebne do przesłania zdjęcia, ścieżka do folderu[nazwa firmy] oraz plik ze zdjęciem.
    const path = req.body.path;
    const { photo } = req.files;

    //
    if (!req.files || Object.values(req.files).flat().length === 0) {
      return res.status(400).json({ message: "Nie wybrano żadnych zdjęć" });
    }

    if (photo.mimetype !== "image/jpeg" && photo.mimetype !== "image/png") {
      return res.status(400).json({ message: "Nieobsługiwany format zdjęć" });
    }

    // Tworzę jego unikalne ID
    const photoID = uuid.v4();

    // Ścieżki do pliku temp i do pliku do folderu firmy
    const uploadTempPath = `./temp/${photoID}.jpg`;
    const uploadPath = `./images/${path}/${photoID}.jpg`;

    // Przenoszę plik do folderu temp
    photo.mv(uploadTempPath, function (err) {});

    // Sprawdzam czy istnieje folder, jeśli nie to go tworzę
    const dir = `./images/${path}`;
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    // Pobieram dane [rozmiar] przesyłanego zdjęcia
    const sharpPhoto = sharp(photo.data);
    const metadata = await sharpPhoto.metadata();
    // Dopasowuję rozmiar znaku wodnego do przesyłanego zdjęcia
    await sharp(`./images/internal/watermark.png`)
      .resize(metadata.width, metadata.height)
      .toFile(`./images/internal/resizedWatermark.png`);
    // Zmniejszam rozmiar zdjęcia oraz dodaję znak wodny
    await sharp(`./temp/${photoID}.jpg`)
      .jpeg({ quality: 50 })
      .rotate()
      .composite([{ input: `./images/internal/resizedWatermark.png`, gravity: "center" }])
      .toFile(uploadPath);

    // Usuwam plik temp z serwera
    fs.unlinkSync(uploadTempPath);

    // Zwracam adres url
    return res.status(201).json({
      success: true,
      id: photoID,
      url: `${process.env.BASE_URL}/uploads/images/${path}/${photoID}.jpg`,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.uploadEditedPhotos = async (req, res) => {
  try {
    // Zmienne potrzebne do przesłania zdjęcia, ścieżka do folderu[nazwa firmy] oraz plik ze zdjęciem.
    const path = req.body.path;
    const { photo } = req.files;

    // Tworzę jego unikalne ID
    const photoID = uuid.v4();

    // Ścieżki do pliku do folderu firmy
    const uploadPath = `./images/${path}/${photoID}.jpg`;

    // Przenoszę plik do folderu
    photo.mv(uploadPath, function (err) {});

    // Zwracam adres url
    return res.status(201).json({
      success: true,
      id: photoID,
      url: `${process.env.BASE_URL}/uploads/images/${path}/${photoID}.jpg`,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.uploadAvatar = async (req, res) => {
  const path = req.body.path;
  const avatarID = req.body.avatarID;
  const { photo } = req.files;

  // Tworzę jego unikalne ID
  const photoID = uuid.v4();

  // Ścieżki do pliku do folderu firmy
  const uploadPath = `./images/${path}/${photoID}.jpg`;

  // Przenoszę plik do folderu
  photo.mv(uploadPath, function (err) {});

  // Sprawdzam czy istnieje folder, jeśli nie to go tworzę
  const dir = `./images/${path}`;
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Usuwam plik ze starym avatarem z serwera
  if (avatarID) {
    fs.unlinkSync(`./images/${path}/${avatarID}.jpg`);
  }

  // Zwracam adres url
  return res.status(201).json({
    success: true,
    id: photoID,
    url: `${process.env.BASE_URL}/uploads/images/${path}/${photoID}.jpg`,
  });
};

// exports.downloadPhotos = async (req, res) => {
//   try {
//     const { id, photos, galleryTitle, userID } = req.body;
//     const images = [];

//     let user = await User.findOne({ _id: userID }).select("-password");

//     const path = user.email;

//     for (const photo of photos) {
//       images.push(`images/${path}/${photo.id}.jpg`);
//     }

//     const img = zip.folder("sesja fotograficzna");

//     for (const image of images) {
//       const imageData = fs.readFileSync(image);
//       img.file(image, imageData);
//     }

//     // Sprawdzam czy istnieje folder, jeśli nie to go tworzę
//     const dir = `./archives/${path}`;
//     if (!fs.existsSync(dir)) {
//       fs.mkdirSync(dir, { recursive: true });
//     }

//     zip
//       .generateNodeStream({ type: "nodebuffer", streamFiles: true })
//       .pipe(fs.createWriteStream(`archives/${path}/${id}.zip`))
//       .on("finish", function () {
//         console.log("sample.zip written.");
//       });

//     return res.status(200).json({
//       url: `${process.env.BASE_URL}/uploads/archives/${path}/${id}.zip`,
//     });
//   } catch (error) {
//     return res.status(500).json({ success: false, message: error.message });
//   }
// };

exports.downloadPhotos = async (req, res) => {
  try {
    const { id, photos, galleryTitle, userID } = req.body;
    const images = [];

    let user = await User.findOne({ _id: userID }).select("-password");

    const path = user.email;
    const galleryPath = `sesja fotograficzna/${galleryTitle}`;

    for (const photo of photos) {
      images.push(`images/${path}/${photo.id}.jpg`);
    }

    // Tworzenie ZIP
    const archive = archiver("zip", { zlib: { level: 9 } });

    // Sprawdzam czy istnieje folder, jeśli nie to go tworzę
    const archivePath = `./archives/${galleryTitle}`;
    const zipFilePath = `${archivePath}/${id}.zip`;

    if (!fs.existsSync(archivePath)) {
      fs.mkdirSync(archivePath, { recursive: true });
    }

    const output = fs.createWriteStream(zipFilePath);

    output.on("close", () => {
      console.log("Plik ZIP został utworzony.");
      return res.status(200).json({
        url: `${process.env.BASE_URL}/uploads/archives/${galleryTitle}/${id}.zip`,
      });
    });

    archive.on("error", (err) => {
      throw err;
    });

    archive.pipe(output);

    // Dodanie zdjęć do archiwum
    for (const image of images) {
      const imageData = fs.readFileSync(image);
      archive.append(imageData, { name: `${galleryTitle}/${image.split("/").pop()}` });
    }

    archive.finalize();
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.deletePhotos = async (req, res) => {
  try {
    const { deletedPhotos, galleryStatus, path } = req.body;

    console.log(deletedPhotos, galleryStatus, path);

    if (galleryStatus === "new") {
      for (const photo of deletedPhotos) {
        const uploadPath = `./images/${path}/${photo}.jpg`;
        // Usuwam plik z serwera
        fs.unlinkSync(uploadPath);
      }

      return res.status(201).json({ deletedPhotos, message: "Poprawnie usunięto zdjęcia" });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
