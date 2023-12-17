const adminModel = require("../models/adminModel");
const userModel = require("../models/userModel");

const userSession = async (req, res, next) => {
  if (req.session.userlogged) {
    res.locals.userdata = await userModel.findOne({
      email: req.session.useremail,
    });
    if (res.locals.userdata.status == "banned") {
      return res.render("user/userSignIn", {
        userSts: res.locals.userdata.status,
        userName: "correct",
      });
    } else {
      next();
    }
  } else {
    res.redirect("/login");
  }
};

const loginSession = async (req, res, next) => {
  if (req.session.userlogged) {
    res.redirect("/");
  } else {
    next();
  }
};

const adminSession = async (req, res, next) => {
  if (req.session.adminLogin) {
    res.locals.admindata = await adminModel.findOne({
      email: req.session.adminemail,
    });
    next();
  } else {
    res.redirect("/admin-login");
  }
};

module.exports = {
  userSession,
  loginSession,
  adminSession,
};
