const express = require("express");
const multer = require("multer");
const fs = require("fs");
const uniqid = require("uniqid");
const path = require("path");
const { check, validationResult } = require("express-validator");
const { join } = require("path");
const axios = require("axios").default;

const router = express.Router();
const upload = multer({});

router.get("/imdbsearch", async (req, res, next) => {
  try {
    const response = await axios({
      method: "get",
      url: `${process.env.OMDB_BASE_URL + "/?i=" + req.query.id + process.env.OMDB_API_KEY}`,
    });
    res.send(response.data);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

module.exports = router;
