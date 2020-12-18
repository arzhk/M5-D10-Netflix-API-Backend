const express = require("express");
const { join } = require("path");
const cors = require("cors");
const moviesRoutes = require("./movies");
const listEndpoints = require("express-list-endpoints");
const {
  notFoundHandler,
  unauthorizedHandler,
  forbiddenHandler,
  badRequestHandler,
  catchAllHandler,
} = require("./errorHandling");

const server = express();

const port = process.env.PORT || 3001;

const loggerMiddleware = (req, res, next) => {
  console.log(`Logged ${req.url} ${req.method} -- ${new Date()}`);
  next();
};

server.use(cors());
server.use(express.json());
server.use(loggerMiddleware);

server.use("/movies", moviesRoutes);

server.use(notFoundHandler);
server.use(unauthorizedHandler);
server.use(forbiddenHandler);
server.use(badRequestHandler);
server.use(catchAllHandler);

console.log(listEndpoints(server));

server.listen(port, () => {
  console.log("Server is running on port: ", port);
});
