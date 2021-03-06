const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { join } = require("path");
const axios = require("axios").default;
const pdfMake = require("pdfmake");
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const fonts = {
  Roboto: {
    normal: join(__dirname, "fonts/Roboto-Regular.ttf"),
    bold: join(__dirname, "fonts/Roboto-Medium.ttf"),
    italics: join(__dirname, "fonts/Roboto-Italic.ttf"),
    bolditalics: join(__dirname, "fonts/Roboto-MediumItalic.ttf"),
  },
};

const router = express.Router();
const upload = multer({});

// ********* GLOBAL FUNCTIONS

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

// ******** START OF ROUTERS

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

router.get("/catalogue/export", async (req, res, next) => {
  try {
    if (req.query.title) {
      const response = await axios({
        method: "get",
        url: `${process.env.OMDB_BASE_URL + "/?s=" + req.query.title + process.env.OMDB_API_KEY}`,
      });
      const data = response.data.Search;
      const docDefinition = {
        pageSize: "A4",
        pageMargins: [40, 60, 40, 60],
        permissions: {
          printing: "highResolution",
          modifying: false,
          copying: false,
          annotating: false,
          fillingForms: false,
          contentAccessibility: false,
        },
        header: { text: "Catalogue Request", fontSize: 22, bold: true },

        content: [
          { text: `Searched for... ${req.query.title}`, fontSize: 18 },
          {
            alignment: "justify",
            columns: [
              {
                width: "30%",
                text: "Response:",
              },
            ],
          },
          {
            alignment: "justify",
            columns: [
              {
                width: "80%",
                text: JSON.stringify(data, null, 1),
              },
            ],
          },
        ],
      };
      const pdfFile = new pdfMake(fonts);
      const pdfDoc = pdfFile.createPdfKitDocument(docDefinition);
      res.setHeader("Content-Type", "application/pdf");
      pdfDoc.pipe(res);
      pdfDoc.end();
    } else {
      const error = errorMessage(`Title query is missing.`);
      next(error);
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.get("/email/catalogue", async (req, res, next) => {
  try {
    if (req.query.email) {
      if (req.query.title) {
        const response = await axios({
          method: "get",
          url: `${process.env.OMDB_BASE_URL + "/?s=" + req.query.title + process.env.OMDB_API_KEY}`,
        });
        const data = JSON.stringify(response.data.Search, null, 1);
        const msg = {
          to: req.query.email,
          from: process.env.SENDER_EMAIL, // Use the email address or domain you verified above
          subject: "Catalogue request",
          text: data,
          html: `<h2>Catalogue request</h2><h4>Searched for... ${req.query.title}</h4><pre>${data}</pre>`,
        };
        await sgMail.send(msg);
        res.send("Email successfully sent");
      } else {
        const error = errorMessage(`Title query is missing.`);
        next(error);
      }
    } else {
      const error = errorMessage(`Email query is missing.`);
      next(error);
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.get("/catalogue", async (req, res, next) => {
  try {
    if (req.query.title) {
      const response = await axios({
        method: "get",
        url: `${process.env.OMDB_BASE_URL + "/?s=" + req.query.title + process.env.OMDB_API_KEY}`,
      });
      const data = response.data.Search;
      res.send(JSON.stringify(data, null, 1));
    } else {
      const error = errorMessage(`Title query is missing.`);
      next(error);
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

module.exports = router;
