const express = require("express");
const path = require("path");
const session = require("express-session");
const db = require("./config/config");
require("dotenv").config();
const app = express();

//* ============================================================================================================

db.dbConnect((cb) => {
  if (cb) {
    console.log("Database Connected");
    return;
  }
  console.log("Database Error");
});

app.use(
  session({
    secret: process.env.KEY_SECRET,
    resave: true,
    saveUninitialized: true,
    cookie: { maxAge: 6000000 },
  })
);

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(function (req, res, next) {
  res.header("Cache-Control", "private, no-cache, no-store, must-revalidate");
  res.header("Expires", "-1");
  res.header("Pragma", "no-cache");
  next();
});

const adminRouter = require("./routers/adminRouter");
app.use("/", adminRouter);
const userRouter = require("./routers/userRouter");
app.use("/", userRouter);

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

//* =============================================== Error Handle ===============================================

app.use((req, res, next) => {
  res.status(404);
  res.render("error/404", { title: "404 Error" });
});

app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(500);
  res.render("error/500", { title: "500 Error" });
});

const port = process.env.PORT || 5000;

app.listen(port, () => console.log("Server is Running"));
