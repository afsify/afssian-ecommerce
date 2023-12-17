const fs = require("fs");
const path = require("path");
const categoryModel = require("../../models/categoryModel");

//! ============================================== Category List ==============================================

const viewCategory = async (req, res) => {
  try {
    const categoryCount = await categoryModel.count();
    let Categories = await categoryModel.find();
    res.render("admin/categoryManage", {
      page: "category",
      categoryCount,
      Categories,
      status: "normal",
      admin: res.locals.admindata.name,
    });
  } catch (error) {
    next(error);
  }
};

//! ============================================ Upload Category ============================================

const createCategory = async (req, res, next) => {
  try {
    const categoryCount = await categoryModel.count();
    let Categories = await categoryModel.find();
    let name = req.body.name.toLowerCase();
    let category = await categoryModel.findOne({ categoryName: name });
    if (!category) {
      let category = categoryModel({
        categoryName: name,
        image: req.file.filename,
      });
      category.save().then(() => {
        res.redirect("/category");
      });
    } else {
      res.render("admin/categoryManage", {
        page: "category",
        categoryCount,
        Categories,
        admin: res.locals.admindata.name,
        status: "false",
      });
    }
  } catch (error) {
    next(error);
  }
};

//! ============================================== Edit Category ==============================================

const viewUpdateCategory = async (req, res, next) => {
  try {
    id = req.params.id;
    let Categories = await categoryModel.findOne({ _id: id });
    res.render("admin/updateCategory", {
      page: "category",
      admin: res.locals.admindata.name,
      ustatus: "false",
      Categories,
    });
  } catch (error) {
    next(error);
  }
};

//! ============================================ Update Category ============================================

const updateCategory = async (req, res, next) => {
  try {
    const id = req.params.id;
    const filename = req.file.filename;
    const cname = req.body.category.toLowerCase();
    await categoryModel
      .updateOne(
        { _id: id },
        { $set: { categoryName: cname, image: filename } }
      )
      .then(() => {
        res.redirect("/category");
      });
  } catch (error) {
    next(error);
  }
};

//! ============================================ Delete Category ============================================

const deleteCategory = async (req, res) => {
  try {
    const id = req.params.id;
    const img = req.params.val;
    await categoryModel.findOne({ _id: id });
    fs.unlink(path.join(__dirname, "../public/productImages/", img), () => {});
    categoryModel.deleteOne({ _id: id }).then(() => {
      res.redirect("/category");
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  viewCategory,
  createCategory,
  viewUpdateCategory,
  updateCategory,
  deleteCategory,
};
