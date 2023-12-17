const mongoose = require("mongoose");

const dbConnect = (cb) => {
  mongoose.set("strictQuery", true);
  mongoose.connect(process.env.MONGO_URL);
  const db = mongoose.connection;
  db.on("open", () => {
    cb(true);
  });
  db.once("error", (err) => {
    cb(false);
    console.log(err);
  });
};

module.exports = {
  dbConnect,
};
