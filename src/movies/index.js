const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { check, validationResult } = require("express-validator");
const { join } = require("path");
const axios = require("axios").default;

const router = express.Router();
const upload = multer({});

const readFileHandler = async (filename) => {
  const targetFile = JSON.parse(fs.readFileSync(join(__dirname, filename)).toString());
  return targetFile;
};

const writeFileHandler = (writeToFilename, file) => {
  try {
    fs.writeFileSync(path.join(__dirname, writeToFilename), JSON.stringify(file));
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

const errorMessage = (value, message, param = "_id", url = "url") => {
  const err = new Error();
  err.message = {
    errors: [
      {
        value: value,
        msg: message,
        param: param,
        location: url,
      },
    ],
  };
  err.httpStatusCode = 400;
  return err;
};

const newMovieHandler = async (data) => {
  console.log(data);
  const newMovie = {
    imdbID: data.imdbID,
    name: data.Title,
    year: data.Year,
    description: data.Plot,
    type: data.Type,
    genre: data.Genre,
    runtime: data.Runtime,
    poster: data.Poster,
    metascore: data.Metascore,
    imdbRating: data.imdbRating,
    reviews: [],
  };
  return newMovie;
};

router.get("/", async (req, res, next) => {
  try {
    res.send(readFileHandler("movies.json"));
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const movies = readFileHandler("movies.json");
    const indexOfMovie = movies.findIndex((movie) => movie._id === req.params.id);
    if (indexOfMovie !== -1) {
      res.send(movies[indexOfMovie]);
    } else {
      const error = errorMessage(req.params.id, "Movie with that ID not found");
      next(error);
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.get("/test/:id", async (req, res, next) => {
  try {
    const response = await axios({
      method: "get",
      url: `${process.env.OMDB_BASE_URL + "/?i=" + req.params.id + process.env.OMDB_API_KEY}`,
    });
    console.log(response.data);
    res.send(response.data);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.post("/new/:imdbID", async (req, res, next) => {
  try {
    const movies = await readFileHandler("movies.json");
    const indexOfMovie = await movies.findIndex((movie) => movie.imdbID === req.params.imdbID);
    const response = await axios({
      method: "get",
      url: `${process.env.OMDB_BASE_URL + "/?i=" + req.params.imdbID + process.env.OMDB_API_KEY}`,
    });
    if (indexOfMovie === -1) {
      if (response.data.imdbID !== undefined) {
        const newMovie = await newMovieHandler(response.data);
        movies.push(newMovie);
        writeFileHandler("movies.json", movies);
        res.send(`Movie has successfully been added, ID:${req.params.imdbID}`);
      } else {
        const error = errorMessage(req.params.imdbID, "Invalid imdbID provided, please try again.");
        next(error);
      }
    } else {
      const error = errorMessage(req.params.imdbID, "Movie/Show with that ID already exists.");
      next(error);
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.put("update/:imdbID", async (req, res, next) => {
  try {
    const movies = await readFileHandler("movies.json");
    const indexOfMovie = movies.findIndex((movie) => movie._id === req.params.imdbID);
    if (indexOfMovie !== -1) {
    } else {
      const error = errorMessage(
        req.params.id,
        "Movie/Show with that ID already exists or The ID you have provided is invalid."
      );
      next(error);
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

module.exports = router;
