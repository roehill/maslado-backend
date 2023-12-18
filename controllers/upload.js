const fs = require("fs");
const { Readable } = require("stream");
const sharp = require("sharp");
const cloudinary = require("cloudinary").v2;

const im = require("imagemagick");

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

exports.uploadPhotos = async (req, res) => {
  try {
    const { path } = req.body;
    let photos = req.body.photos;
    if (photos === undefined) {
      photos = [];
    }

    let newPhotos = req.files;
    let images = [];

    if (photos.length < 500) {
      for (const photo of newPhotos) {
        console.log(newPhotos);
        const file = await sharp(photo.buffer).jpeg({ quality: 20 }).rotate().toBuffer();

        let url = await uploadFromBuffer(file, path);
        images.push(url);
      }

      res.json(images);
    } else {
      return res.status(404).json({
        success: false,
        message: "Przekroczono limit zdjęć w galerii",
      });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
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

exports.resizePhotos = async (req, res) => {
  try {
    const { path } = req.body;

    let photos = Object.values(req.files).flat();

    if (photos.length > 500) {
      return res.status(400).json({ message: "Przekroczono dopuszczalny limit zdjęć" });
    }

    // Checking if there is no organization folder create one
    const folderName = `upload/${path}`;
    if (!fs.existsSync(folderName)) {
      fs.mkdirSync(folderName);
    }

    // Resize all send photos and save them in separate folder
    for (const photo of photos) {
      await sharp(photo.path)
        .resize(1200)
        .toFormat("jpeg")
        .jpeg({ quality: 90 })
        .toFile(`upload/${path}/${photo.originalname}`);

      // removeTmp(photo.path);
    }

    return res.status(200).json({ success: true, path, photos });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.uploadAvatar = async (req, res) => {
  try {
    const { path } = req.body;

    let photos = req.files;

    let images = [];

    if (photos.length > 500) {
      return res.status(400).json({ message: "Przekroczono dopuszczalny limit zdjęć" });
    }

    for (const photo of photos) {
      const file = await sharp(photo.buffer).jpeg({ quality: 20 }).toBuffer();

      const url = await uploadToCloudinary(file, path);
      images.push(url);
      bufferToStream(file).pipe(url);
    }

    res.json(images);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const uploadToCloudinary = async (file, path) => {
  return new Promise((resolve) => {
    cloudinary.uploader.upload_stream(
      file.path,
      {
        folder: path,
        transformation: [
          {
            overlay: `Watermark:watermark_egejlx`,
          },
          { flags: "relative", width: "0.99", height: "0.99", crop: "scale" },
          { flags: ["layer_apply", "no_overflow"] },
          {
            gravity: "center",
          },
          { width: 1280, crop: "limit" },
        ],
      },
      (err, res) => {
        if (err) {
          return res.status(400).json({ message: "Upload image failed" });
        }

        resolve({
          id: res.public_id,
          url: res.secure_url,
        });

        // bufferToStream(file).pipe(stream);
      }
    );
  });
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

const removeTmp = (path) => {
  fs.unlink(path, (err) => {
    if (err) throw err;
  });
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
