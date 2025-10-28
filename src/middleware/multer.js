const multer = require("multer");

const storage = multer.memoryStorage();

//single upload
const singleUpload = multer({ storage }).single("file");

//multiple upload
const multipleUpload = multer({ storage }).array("file", 6);

module.exports = { singleUpload, multipleUpload };