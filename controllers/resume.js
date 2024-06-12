const fs = require("fs");
const path = require("path");

// DOWNLOAD RESUME BATCh FILE
exports.downloadBatch = async (req, res) => {
  try {
    const { filesToCopy } = req.body;
    console.log(filesToCopy);

    // Create batch file content
    let batchContent = `@echo off\nsetlocal\n\n:: Tworzenie nowego folderu\nmkdir "%~dp0wybrane"\n\n:: Kopiowanie plików do nowego folderu\n`;
    filesToCopy.forEach((file) => {
      batchContent += `copy "%~dp0${file}" "%~dp0wybrane"\n`;
    });
    batchContent += `\necho Operacja zakończona.\npause`;

    const batchFilePath = path.join(__dirname, "wybrane.bat");

    fs.writeFileSync(batchFilePath, batchContent);

    res.download(batchFilePath, "wybrane.bat", (err) => {
      if (err) {
        console.error("Błąd podczas wysyłania pliku:", err);
      } else {
        fs.unlinkSync(batchFilePath);
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
