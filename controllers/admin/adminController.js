const PDFDocument = require("pdfkit");
const userModel = require("../../models/userModel");
const adminModel = require("../../models/adminModel");
const orderModel = require("../../models/orderModel");

//! ============================================== Admin Login ==============================================

const viewLogin = (req, res) => {
  if (req.session.adminLogin) {
    res.redirect("/dashboard");
  }
  res.render("admin/adminLogin", { notAdmin: "false" });
};

//! ============================================== Admin Verify ==============================================

const verifyLogin = async (req, res, next) => {
  try {
    if (req.session.adminLogin) {
      res.redirect("/dashboard");
    }
    const { email, password } = req.body;
    const ademail = await adminModel.findOne({ email });
    if (!ademail) {
      return res.render("admin/adminLogin", { notAdmin: "true" });
    }
    const adpass = await adminModel.findOne({ password });
    if (!adpass) {
      return res.render("admin/adminLogin", { notAdmin: "true" });
    }
    req.session.adminLogin = true;
    req.session.adminemail = req.body.email;
    res.redirect("/dashboard");
  } catch (error) {
    next(error);
  }
};

//! ============================================= Dashboard Detail =============================================

const viewDashboard = async (req, res, next) => {
  try {
    const userCount = await userModel.count();
    const productCount = await productModel.find().count();
    const sales = await orderModel.find({ orderStatus: "Delivered" }).count();
    const saleDummy = await orderModel.find().count();
    const order = await orderModel.find().populate("products.product");
    const revenue = await orderModel.aggregate([
      { $match: { orderStatus: "Delivered" } },
      { $group: { _id: null, totalIncome: { $sum: "$Subtotal" } } },
    ]);
    const orderConf = await orderModel.find({ orderStatus: "Placed" }).count();
    const orderApproved = await orderModel
      .find({ orderStatus: "Approved" })
      .count();
    const orderPacked = await orderModel
      .find({ orderStatus: "Packed" })
      .count();
    const orderShipped = await orderModel
      .find({ orderStatus: "Shipped" })
      .count();
    const orderCancel = await orderModel
      .find({ orderStatus: "Canceled" })
      .count();
    const orderDeli = await orderModel
      .find({ orderStatus: "Delivered" })
      .count();
    const orderReturn = await orderModel
      .find({ orderStatus: "Returned" })
      .count();
    const returnRequest = await orderModel
      .find({ orderStatus: "Return Request" })
      .count();
    const returnRejected = await orderModel
      .find({ orderStatus: "Return Rejected" })
      .count();
    const orderRejected = await orderModel
      .find({ orderStatus: "Rejected" })
      .count();
    let totalPrice;
    if (revenue.length > 0) {
      totalPrice = revenue[0].totalIncome;
    }
    res.render("admin/dashboard", {
      page: "dashboard",
      userCount,
      productCount,
      sales,
      totalPrice,
      saleDummy,
      order,
      revenue,
      orderConf,
      orderCancel,
      orderDeli,
      orderReturn,
      orderApproved,
      orderPacked,
      orderShipped,
      returnRequest,
      returnRejected,
      orderRejected,
      admin: res.locals.admindata.name,
    });
  } catch (error) {
    next(error);
  }
};

//! ============================================== Sales Report ==============================================

const viewSales = async (req, res, next) => {
  try {
    const userCount = await userModel.count();
    const productCount = await productModel.find().count();
    const salesCount = await orderModel
      .find({ orderStatus: "Delivered" })
      .count();
    const totalIncome = await orderModel.aggregate([
      {
        $match: { orderStatus: "Delivered" },
      },
      {
        $group: {
          _id: null,
          totalPrice: { $sum: "$Subtotal" },
        },
      },
      {
        $project: { _id: 0 },
      },
    ]);
    const data = totalIncome;
    let totalPrice;
    if (data.length > 0) {
      totalPrice = data[0].totalPrice;
    } else {
      totalPrice = 0;
    }
    const orderUsers = await orderModel.find({ orderStatus: "Delivered" });
    res.render("admin/sales", {
      page: "sales",
      userCount,
      productCount,
      salesCount,
      totalPrice,
      orderUsers,
      admin: res.locals.admindata.name,
    });
  } catch (error) {
    next(error);
  }
};

//! ============================================== Download Report ==============================================

const downSalesReport = async (req, res, next) => {
  try {
    const orderUsers = await orderModel.find({ orderStatus: "Delivered" });
    var fromDate = new Date(req.query.fromDate);
    var toDate = new Date(req.query.toDate);
    var filename =
      "orders_" + fromDate.toISOString() + "_" + toDate.toISOString() + ".pdf";
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="' + filename + '"'
    );
    const doc = new PDFDocument();
    doc.text("#", { align: "center" });
    doc.text("ORDER#", { align: "center" });
    doc.text("DATE", { align: "center" });
    doc.text("USER", { align: "center" });
    doc.text("SUBTOTAL", { align: "center" });
    doc.text("PAYMENT", { align: "center" });
    orderUsers.forEach((order, index) => {
      var orderDate = new Date(order.date);
      if (orderDate >= fromDate && orderDate <= toDate) {
        doc.text((index + 1).toString());
        doc.text(order._id);
        doc.text(order.date.toLocaleDateString());
        doc.text(order.address.name);
        doc.text(order.Subtotal);
        doc.text(order.paymentMethod);
      }
    });
    doc.pipe(res);
    doc.end();
  } catch (error) {
    next(error);
  }
};

//! ============================================= Customer List =============================================

const viewCustomer = async (req, res, next) => {
  try {
    const userCount = await userModel.count();
    const users = await userModel.find();
    res.render("admin/customerManage", {
      page: "customers",
      users,
      userCount,
      admin: res.locals.admindata.name,
    });
  } catch (error) {
    next(error);
  }
};

//! ============================================== Block User ==============================================

const blockUser = async (req, res, next) => {
  try {
    const id = req.params.id;
    await userModel
      .updateOne({ _id: id }, { $set: { status: "banned" } })
      .then(() => {
        res.redirect("/customers");
      });
  } catch (error) {
    next(error);
  }
};

//! ============================================== Unblock User ==============================================

const unblockUser = async (req, res, next) => {
  try {
    const id = req.params.id;
    await userModel
      .updateOne({ _id: id }, { $set: { status: "unbanned" } })
      .then(() => {
        res.redirect("/customers");
      });
  } catch (error) {
    next(error);
  }
};

//! ============================================== Admin Logout ==============================================

const logoutAdmin = (req, res, next) => {
  try {
    req.session.adminLogin = false;
    req.session.adminLogin = "";
    res.redirect("/admin-login");
  } catch (error) {
    next(error);
  }
};

module.exports = {
  viewLogin,
  verifyLogin,
  viewDashboard,
  viewSales,
  downSalesReport,
  viewCustomer,
  blockUser,
  unblockUser,
  logoutAdmin,
};
