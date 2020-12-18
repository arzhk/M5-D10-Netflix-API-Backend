const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const uniqid = require("uniqid");
const { check, validationResult } = require("express-validator");
const { writeFile, createReadStream } = require("fs-extra");
const { join } = require("path");

const router = express.Router();
const upload = multer({});

const readFileHandler = (filename) => {
  const targetFile = JSON.parse(fs.readFileSync(join(__dirname, filename)).toString());
  return targetFile;
};

const writeFileHandler = (writeToFilename, file) => {
  fs.writeFileSync(path.join(__dirname, writeToFilename), JSON.stringify(file));
};

router.get("/", (req, res, next) => {
  try {
    res.send(readFileHandler("movies.json"));
  } catch (error) {
    console.log(error);
    next(error);
  }
});
