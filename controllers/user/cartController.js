const userModel = require("../../models/userModel");
const productModel = require("../../models/productModel");
const categoryModel = require("../../models/categoryModel");

//! ================================================ User Cart ================================================

const viewCart = async (req, res, next) => {
  try {
    const id = res.locals.userdata;
    let category = await categoryModel.find();
    let userData = await userModel.findOne({ _id: id });
    let cart = await userModel.findOne({ _id: id }).populate("cart.product_id");
    res.render("user/cartList", {
      page: "cart",
      cart,
      category,
      userData,
      user: req.session.user,
    });
  } catch (error) {
    next(error);
  }
};

//! ============================================== Add to Cart ==============================================

const addToCart = async (req, res, next) => {
  try {
    const id = res.locals.userdata._id;
    const productId = req.params.id;
    let isExist = await userModel.findOne({ _id: id });
    let cartIndex = isExist.cart.findIndex(
      (productId) => productId.product_id == req.params.id
    );
    if (cartIndex == -1) {
      await userModel.updateOne(
        { _id: id },
        { $push: { cart: { product_id: productId, quantity: 1 } } }
      );
      res.send({ added: true });
    } else {
      res.send({ exists: true });
    }
  } catch (error) {
    next(error);
  }
};

//! ============================================ Quantity Increment ============================================

const quantityInc = async (req, res, next) => {
  try {
    const id = res.locals.userdata;
    const cartId = req.body.id;
    let productCheck = await userModel.findOne({ _id: id, "cart._id": cartId });
    productCheck.cart.forEach(async (val, i) => {
      if (val._id.toString() == cartId.toString()) {
        productQuantity = await productModel.findOne({ _id: val.product_id });
        if (productQuantity.stock <= val.quantity) {
          res.json({ key: "over", price: productQuantity.stock });
        } else {
          await userModel.updateOne(
            { _id: id, "cart._id": cartId },
            { $inc: { "cart.$.quantity": 1 } }
          );
          res.json("added");
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

//! =========================================== Quantity Decrement ===========================================

const quantityDec = async (req, res, next) => {
  try {
    const id = res.locals.userdata;
    const cartId = req.body.id;
    let quantityCheck = await userModel.findOne({
      _id: id,
      "cart._id": cartId,
    });
    quantityCheck.cart.forEach(async (val, i) => {
      if (val._id.toString() == cartId.toString()) {
        if (val.quantity <= 1) {
          res.json("minimum");
        } else {
          await userModel.updateOne(
            { _id: id, "cart._id": cartId },
            { $inc: { "cart.$.quantity": -1 } }
          );
          res.json("added");
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

//! =============================================== Delete Cart ===============================================

const deleteCart = async (req, res, next) => {
  try {
    const id = res.locals.userdata;
    const cdid = req.body.id;
    await userModel.updateOne(
      { _id: id._id },
      { $pull: { cart: { _id: cdid } } }
    );
    let cart = await userModel.findOne({ _id: id }).populate("cart.product_id");
    if (cart.cart.length == 0) {
      res.json("remove");
    } else {
      res.json("added");
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  viewCart,
  addToCart,
  quantityInc,
  quantityDec,
  deleteCart,
};
