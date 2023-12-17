const fs = require("fs");
const path = require("path");
const productModel = require("../../models/productModel");
const categoryModel = require("../../models/categoryModel");

//! ============================================== Product List ==============================================

const viewProduct = async (req, res, next) => {
  try {
    let category = await categoryModel.find();
    const productCount = await productModel.count();
    const products = await productModel.find().populate("category");
    res.render("admin/productManagement", {
      page: "products",
      products,
      category,
      productCount,
      admin: res.locals.admindata.name,
    });
  } catch (error) {
    next(error);
  }
};

//! ============================================== Upload Product ==============================================

const createProduct = async (req, res, next) => {
  try {
    let category = await categoryModel.find();
    const filenames = req.files.map((file) => file.filename);
    if (
      req.body.name &&
      req.body.description &&
      req.body.price &&
      req.body.category &&
      req.body.stock &&
      req.body.status &&
      filenames
    ) {
      let product = productModel({
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
        category: req.body.category,
        stock: req.body.stock,
        status: req.body.status,
        image: filenames,
      });
      product.save().then(() => {
        res.redirect("/products");
      });
    } else {
      res.render("admin/productManagement", {
        page: "products",
        admin: res.locals.admindata.name,
        category,
      });
    }
  } catch (error) {
    next(error);
  }
};

//! ============================================ Edit Product ============================================

const viewUpdateProduct = async (req, res, next) => {
  try {
    const id = req.params.id;
    let products = await productModel.findOne({ _id: id }).populate("category");
    let category = await categoryModel.find();
    res.render("admin/updateProduct", {
      page: "Products",
      admin: res.locals.admindata.name,
      field: "field",
      products,
      category,
      userstatus: "false",
    });
  } catch (error) {
    next(error);
  }
};

//! ============================================ Update Product ============================================

const updateProduct = async (req, res, next) => {
  try {
    const id = req.params.id;
    const filenames = req.files.map((file) => file.filename);
    let dataToUpdate = {
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      category: req.body.category,
      stock: req.body.stock,
      status: req.body.status,
    };
    if (req.files.length > 0) {
      productModel.updateOne(
        { _id: id },
        { $push: { image: { $each: filenames } } }
      );
    }
    let category = await categoryModel.find();
    products = await productModel.findOneAndUpdate(
      { _id: id },
      { $set: dataToUpdate }
    );
    res.render("admin/updateProduct", {
      page: "Products",
      admin: res.locals.admindata.name,
      field: "field",
      category,
      products,
      userstatus: "true",
    });
  } catch (error) {
    next(error);
  }
};

//! ============================================== Delete Product ==============================================

const deleteProduct = async (req, res, next) => {
  try {
    const id = req.params.id;
    const product = await productModel.findOne({ _id: id });
    product.image.forEach((value) => {
      fs.unlink(
        path.join(__dirname, "../public/productImages/", value),
        () => {}
      );
    });
    productModel.deleteOne({ _id: id }).then(() => {
      res.redirect("/products");
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  viewProduct,
  createProduct,
  viewUpdateProduct,
  updateProduct,
  deleteProduct,
};
