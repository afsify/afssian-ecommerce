const express = require('express');
const admin_route = express.Router()
const {adminSession} = require('../middleware/auth');
const multer = require('multer');
const adminController = require("../controllers/admin/adminController");
const bannerController = require("../controllers/admin/bannerController");
const categoryController = require("../controllers/admin/categoryController");
const orderController = require("../controllers/admin/orderController");
const productController = require("../controllers/admin/productController");
const couponController = require("../controllers/admin/couponController");
const config = require("../config/config");
const path = require('path');



//? ============================================================================================================

const storage = multer.diskStorage({
    destination:function(req,file,callback) {
        callback(null,path.join(__dirname,"../public/productImages"))
    },
    filename:function(req,file,callback){
        const name = Date.now()+"-"+file.originalname;
        callback(null,name);
    }
})
const uploadOptions = multer({storage:storage})

//? ================================================ Admin Login ================================================

admin_route.get('/admin-login',adminController.viewLogin);
admin_route.post('/admin-login',adminController.verifyLogin);

//? =============================================== Dashboard Data ===============================================

admin_route.get('/dashboard',adminSession,adminController.viewDashboard);

//? ================================================ Sales Report ================================================

admin_route.get('/sales',adminSession,adminController.viewSales);
admin_route.get('/download-pdf', adminSession,adminController.downSalesReport);

//? =============================================== Customer Manage ===============================================

admin_route.get('/customers', adminSession, adminController.viewCustomer);
admin_route.post('/blockUser/:id', adminSession, adminController.blockUser);
admin_route.post('/unblockUser/:id', adminSession, adminController.unblockUser);

//? =============================================== Order Manage ===============================================

admin_route.get('/order-manage', adminSession, orderController.viewOrderManage);
admin_route.get("/order-data/:id", adminSession,orderController.viewOrderData);

admin_route.post("/changeOrderStatus",adminSession, orderController.statusChange);
admin_route.post("/reject-status",adminSession, orderController.rejectStatus);

//? ============================================== Category Manage ==============================================

admin_route.get('/category', adminSession, categoryController.viewCategory);
admin_route.post('/add-category',adminSession,uploadOptions.single('product_images',10), categoryController.createCategory);
admin_route.get('/edit-category/:id',adminSession, categoryController.viewUpdateCategory);
admin_route.post('/update-category/:id',adminSession,uploadOptions.single('product_images',10), categoryController.updateCategory);
admin_route.post('/deletecategories/:id/:val',adminSession, categoryController.deleteCategory);

//? =============================================== Product Manage ===============================================

admin_route.get('/products',adminSession,productController.viewProduct);
admin_route.post('/addproduct',adminSession,uploadOptions.array('product_images',10),productController.createProduct)
admin_route.get('/editproduct/:id',adminSession,productController.viewUpdateProduct);
admin_route.post('/updateproduct/:id',adminSession,uploadOptions.array('product_images',10),productController.updateProduct);
admin_route.post('/deleteproduct/:id',adminSession,productController.deleteProduct)

//? =============================================== Coupon Manage ===============================================

admin_route.get('/coupon', adminSession, couponController.viewCoupon);
admin_route.post('/add-coupon',adminSession, couponController.createCoupon);
admin_route.post('/delete-coupon/:id',adminSession, couponController.deleteCoupon);

//? ============================================== Banner Manage ==============================================

admin_route.get('/banner', adminSession, bannerController.viewBanner);
admin_route.post('/add-banner',adminSession, uploadOptions.single('product_images',10), bannerController.createBanner);
admin_route.post('/disable-banner/:id',adminSession, bannerController.disableBanner);
admin_route.post('/enable-banner/:id',adminSession, bannerController.enableBanner);
admin_route.post('/delete-banner/:id/:val',adminSession, bannerController.deleteBanner);

//? =============================================== Admin Logout ===============================================

admin_route.get('/logout', adminController.logoutAdmin);

//? ============================================================================================================



module.exports = admin_route;