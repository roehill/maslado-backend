const fs = require("fs");
const { Readable } = require("stream");
const uuid = require("uuid");
const sharp = require("sharp");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

const bufferToStream = (buffer) => {
  const readable = new Readable({
    read() {
      this.push(buffer);
      this.push(null);
    },
  });
  return readable;
};

exports.uploadPhotos = async (req, res) => {
  try {
    // Zmienne potrzebne do przesłania zdjęcia, ścieżka do folderu[nazwa firmy] oraz plik ze zdjęciem.
    const path = req.body.path;
    const { photo } = req.files;

    // Ścieżki do pliku temp i do pliku do folderu firmy
    const uploadTempPath = `./temp/${photo.name}`;
    const uploadPath = `./images/${path}/${photo.name}`;

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
    await sharp(`./temp/${photo.name}`)
      .jpeg({ quality: 50 })
      .rotate()
      .composite([{ input: `./images/internal/resizedWatermark.png`, gravity: "center" }])
      .toFile(uploadPath);

    // Usuwam plik temp z serwera
    fs.unlinkSync(uploadTempPath);

    // Zwracam adres url
    return res.status(201).json({
      success: true,
      id: `${uuid.v4()}`,
      // url: `https://www.maslado-api.com/uploads/images/${path}/${photo.name}`,
      url: `http://localhost:5000/uploads/images/${path}/${photo.name}`,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const uploadFromBuffer = (file, path) => {
  return new Promise((resolve, reject) => {
    let stream = cloudinary.uploader.upload_stream(
      {
        folder: path,
        transformation: [
          {
            overlay: `Watermark:watermark_zeopzj`,
          },
          { flags: "relative", width: "0.99", height: "0.99", crop: "scale" },
          { flags: ["layer_apply", "no_overflow"] },
          {
            gravity: "center",
          },
        ],
      },
      (error, res) => {
        if (res) {
          resolve({
            id: res.public_id,
            url: res.secure_url,
          });
        } else {
          reject(error);
        }
      }
    );
    bufferToStream(file).pipe(stream);
  });
};

exports.uploadPhotossss = async (req, res) => {
  try {
    const path = req.body.path;
    const photo = req.file;
    // console.log(photo);
    await sharp(`./images/${photo.originalname}`)
      .jpeg({ quality: 20 })
      .rotate()
      .toFile(`./resized/${photo.originalname}`);
    fs.readFile(`./resized/${photo.originalname}`, async (err, data) => {
      let url = await uploadFromBuffer(data, path);
      res.json(url);
    });
    // console.log(file);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
  // try {
  //   const { path } = req.body;
  //   let photos = req.body.photos;
  //   if (photos === undefined) {
  //     photos = [];
  //   }
  //   let newPhotos = req.files;
  //   console.log(newPhotos);
  //   let images = [];
  //   if (photos.length < 500) {
  //     for (const photo of newPhotos) {
  //       const file = await sharp(photo.buffer).jpeg({ quality: 20 }).rotate().toBuffer();
  //       let url = await uploadToCloudinary(file, path);
  //       images.push(url);
  //       res.json(url);
  //     }
  //     // res.json(images);
  //   } else {
  //     return res.status(404).json({
  //       success: false,
  //       message: "Przekroczono limit zdjęć w galerii",
  //     });
  //   }
  // } catch (error) {
  //   return res.status(500).json({ success: false, message: error.message });
  // }
};

const uploadToCloudinary = async (file, path) => {
  return new Promise((resolve) => {
    cloudinary.uploader.upload(
      file.path,
      {
        folder: path,
        transformation: [
          {
            overlay: `Watermark:watermark_zeopzj`,
          },
          { flags: "relative", width: "0.99", height: "0.99", crop: "scale" },
          { flags: ["layer_apply", "no_overflow"] },
          {
            gravity: "center",
          },
        ],
      },
      (err, result) => {
        if (err) {
          return console.log({ message: "Upload image failed" });
        }

        resolve({
          id: result.public_id,
          url: result.secure_url,
          title: result.original_filename,
        });
      }
    );
  });
};

const uploadFromBufferEditedPhotos = (file, path) => {
  return new Promise((resolve, reject) => {
    let stream = cloudinary.uploader.upload_stream(
      {
        folder: path,
      },
      (error, res) => {
        if (res) {
          resolve({
            id: res.public_id,
            url: res.secure_url,
          });
        } else {
          reject(error);
        }
      }
    );
    bufferToStream(file).pipe(stream);
  });
};

exports.uploadEditedPhotos = async (req, res) => {
  try {
    const { path } = req.body;
    let photos = req.files;
    let images = [];

    for (const photo of photos) {
      const file = await sharp(photo.buffer).jpeg({ quality: 60 }).rotate().toBuffer();

      let url = await uploadFromBufferEditedPhotos(file, path);
      images.push(url);
    }

    res.json(images);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.uploadAvatar = async (req, res) => {
  try {
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.downloadPhotos = async (req, res) => {
  try {
    console.log(req.body.public_ids, req.body.title);
    cloudinary.uploader.create_zip(
      {
        public_ids: req.body.public_ids,
        target_public_id: req.body.title,
      },
      (err, response) => {
        res.status(200).json(response);
      }
    );
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteMultiplePhotos = async (req, res) => {
  try {
    const { deletedPhotos, galleryStatus } = req.body;

    if (galleryStatus === "new") {
      for (const photo of deletedPhotos) {
        await cloudinary.uploader.destroy(`${photo}`, function (result) {
          console.log(photo, result);
        });
      }

      return res.status(201).json({ deletedPhotos, message: "Poprawnie usunięto zdjęcia" });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.deleteSinglePhoto = async (req, res) => {
  try {
    const { deletedPhoto } = req.body;

    await cloudinary.uploader.destroy(`${deletedPhoto}`, function (result) {
      console.log(result);
    });

    return res.status(201).json({ message: "Poprawnie usunięto zdjęcie" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
