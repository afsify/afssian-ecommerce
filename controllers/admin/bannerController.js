const fs = require("fs");
const path = require("path");
const bannerModel = require("../../models/bannerModel");

//! =============================================== Banner List ===============================================

const viewBanner = async (req, res) => {
  try {
    const banner = await bannerModel.find();
    const bannerCount = await bannerModel.count();
    res.render("admin/bannerManage", {
      page: "banner",
      admin: res.locals.admindata.name,
      banner,
      bannerCount,
    });
  } catch (error) {
    next(error);
  }
};

//! =============================================== Upload Banner ===============================================

const createBanner = (req, res) => {
  try {
    let banner = bannerModel({
      bannerName: req.body.name,
      description: req.body.description,
      image: req.file.filename,
    });
    banner.save().then(() => {
      res.redirect("/banner");
    });
  } catch (error) {
    next(error);
  }
};

//! =============================================== Enable Banner ===============================================

const enableBanner = async (req, res, next) => {
  try {
    const id = req.params.id;
    await bannerModel
      .updateOne({ _id: id }, { $set: { status: "true" } })
      .then(() => {
        res.redirect("/banner");
      });
  } catch (error) {
    next(error);
  }
};

//! =============================================== Disable Banner ===============================================

const disableBanner = async (req, res, next) => {
  try {
    const id = req.params.id;
    await bannerModel
      .updateOne({ _id: id }, { $set: { status: "false" } })
      .then(() => {
        res.redirect("/banner");
      });
  } catch (error) {
    next(error);
  }
};

//! =============================================== Delete Banner ===============================================

const deleteBanner = async (req, res) => {
  try {
    const id = req.params.id;
    const img = req.params.val;
    await bannerModel.findOne({ _id: id });
    fs.unlink(path.join(__dirname, "../public/productImages/", img), () => {});
    bannerModel.deleteOne({ _id: id }).then(() => {
      res.redirect("/banner");
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  viewBanner,
  createBanner,
  disableBanner,
  enableBanner,
  deleteBanner,
};
