/* IMPORTING MODULES */

const express = require("express");
const app = express();
const morgan = require("morgan");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const connetdb = require("./api/dependencies/connectdb");
const cors = require("./api/dependencies/cors");
const fs = require("fs");

/* CREATE PUBLIC DIRECTORY 'UPLOAD' DYNAMICALLY */
fs.mkdirSync("./upload", { recursive: true });
fs.mkdirSync("./csvFiles", { recursive: true });
fs.mkdirSync("./jsonFiles", { recursive: true });
/* ROUTES */

const subscribersRouter = require("./api/routes/subscribers.route");
const fileRouter = require("./api/routes/files.route");
const userRoutes = require("./api/routes/users.route");

/* MONGODB CONNECTION */

connetdb();

/* using mongoose promise */

mongoose.Promise = global.Promise;

/* MIDDLEWARES */

app.use(morgan("dev"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

/*  HANDLING CORS */

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Accept, Content-Type, Authorization"
  );
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");
    return res.status(200).json({});
  }
  next();
});

/* SERVING STATIC FILES */

app.use("/upload", express.static("upload"));
app.use("/csvFiles", express.static("csvFile"));
app.use("/jsonFiles", express.static("jsonFiles"));

/*  ROUTE */
app.use("/users", userRoutes);
app.use("/subscribers", subscribersRouter);
app.use("/files", fileRouter);

app.get("/", (req, res) => {
  res.send("ok");
});

/* HANDLING ERROR MIDDLEWARES */

app.use((req, res, next) => {
  const err = new Error("Yakh Pakh");
  err.status = 404;
  next(err);
});

app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    message: err.message
  });
});

const port = 8000;

/* lISTENING PORT */
app.listen(process.env.PORT || port, function() {
  console.log("Node server is up and running.. on ", port);
});
