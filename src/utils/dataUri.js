const DataUriParser = require("datauri/parser.js");
const path = require("path");

const parcer = new DataUriParser();

const getDataUri = (file) => {
    const ext = path.extname(file.originalname).toString();
    return parcer.format(ext, file.buffer);
};

module.exports = getDataUri;