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
    if (req.query.id) {
      const response = await axios({
        method: "get",
        url: `${process.env.OMDB_BASE_URL + "/?i=" + req.query.id + process.env.OMDB_API_KEY}`,
      });
      res.send(response.data.Search);
    } else if (req.query.title) {
      const response = await axios({
        method: "get",
        url: `${process.env.OMDB_BASE_URL + "/?s=" + req.query.title + process.env.OMDB_API_KEY}`,
      });
      let data = response.data.Search;
      if (req.query.year && req.query.type) {
        data = data.filter((movie) => movie.Year === req.query.year);
        data = data.filter((movie) => movie.Type === req.query.type);
      } else if (req.query.year) {
        data = data.filter((movie) => movie.Year === req.query.year);
      } else if (req.query.type) {
        data = data.filter((movie) => movie.Type === req.query.type);
      }
      res.send(data);
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

module.exports = router;
