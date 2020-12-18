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

const readMovieFileHandler = async (filename) => {
  const targetFile = JSON.parse(fs.readFileSync(join(__dirname, "../movies/", filename)).toString());
  return targetFile;
};

const writeMovieFileHandler = (writeToFilename, file) => {
  try {
    fs.writeFileSync(path.join(__dirname, "../movies/", writeToFilename), JSON.stringify(file));
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

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

router.get("/sort", async (req, res, next) => {
  try {
    if (req.query.by) {
      if (req.query.by === "rating") {
        let movies = await readMovieFileHandler("movies.json");
        movies.forEach((movie) => {
          let totalRating = 0;
          for (let i = 0; i < movie.reviews.length; i++) {
            totalRating += movie.reviews[i].rate;
          }
          totalRating = totalRating / movie.reviews.length;
          movie.avgRating = totalRating;
        });
        movies.sort((a, b) => a.avgRating - b.avgRating);
        res.send(movies);
      } else if (req.query.by === "title") {
        let movies = await readMovieFileHandler("movies.json");
        movies.sort((a, b) => (a.name > b.name ? 1 : -1));
        res.send(movies);
      } else if (req.query.by === "genre") {
        let movies = await readMovieFileHandler("movies.json");
        movies.sort((a, b) => (a.genre > b.genre ? 1 : -1));
        res.send(movies);
      } else if (req.query.by === "year") {
        let movies = await readMovieFileHandler("movies.json");
        movies.sort((a, b) => (a.year > b.year ? 1 : -1));
        res.send(movies);
      } else {
        const error = errorMessage(`Sort by ${req.query.by} not currently available. `);
        next(error);
      }
    } else {
      const error = errorMessage("Sort by query is missing");
      next(error);
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

module.exports = router;
