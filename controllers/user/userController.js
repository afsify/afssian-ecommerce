const userModel = require("../../models/userModel");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const categoryModel = require("../../models/categoryModel");
const productModel = require("../../models/productModel");
const bannerModel = require("../../models/bannerModel");

//! ============================================================================================================

const transporter = nodemailer.createTransport({

    host: process.env.HOST,
    port: 465,

    auth: {

        user: process.env.EMAIL,
        pass: process.env.PASSWORD,

    }

})

var otp = Math.random()
otp = otp * 1000000
otp = parseInt(otp)



//! =============================================== User Home ===============================================

const viewHome = async (req, res, next) => {

    try {

        if (req.session.user) {

            const id = req.session.user._id;
            let cart = await userModel
                .findOne({ _id: id })
                .populate("cart.product_id");
            let wishlist = await userModel
                .findOne({ _id: id })
                .populate("wishlist.product_id");

            let category = await categoryModel.find();
            let products = await productModel.find().populate('category').limit(8);
            let bannerSlider = await bannerModel.find({ status: true }).limit(3);
            let bannerGroup = await bannerModel.find({ status: true }).skip(3).limit(3);

            const wishId = wishlist.wishlist.map(wishlistItem => wishlistItem.product_id._id);

            res.render('user/userHome', {

                page: 'home',
                category,
                products,
                cart,
                wishId,
                bannerSlider,
                bannerGroup,
                user: req.session.user

            });

        }else{


            let category = await categoryModel.find();
            let products = await productModel.find().populate('category').limit(8);
            let bannerSlider = await bannerModel.find({ status: true }).limit(3);
            let bannerGroup = await bannerModel.find({ status: true }).skip(3).limit(3);


            res.render('user/userHome', {

                page: 'home',
                category,
                products,
                bannerSlider,
                bannerGroup,
                user: req.session.user

            });

        }

    } catch (error) {

        next(error);

    }

}

//! =============================================== Login Page ===============================================

const viewSignIn = (req, res) => {

    res.render("user/userSignIn", {

        user: false,
        userSts: "unbanned",
        userName: "correct"

    });

}

//! ============================================== Login Post ==============================================

const verifySignIn = async (req, res, next) => {

    try {

        const { email, password } = req.body;
        const user = await userModel.findOne({ email: email });

            if (!user) {

                return res.render("user/userSignIn", {

                    userSts: "unbanned",
                    userName: "incorrect",

                });
            
            }

        const isPass = await bcrypt.compare(password, user.password);

            if (!isPass) {

                return res.render("user/userSignIn", {

                    userSts: "unbanned",
                    userName: "incorrect",

                });

            }

            if (user.status == "banned") {

                return res.render("user/userSignIn", {

                    userSts: user.status,
                    userName: "correct",

                });

            }

        req.session.useremail = req.body.email;
        req.session.userlogged = true;
        req.session.user = user;
        res.redirect("/");

    } catch (error) {

        next(error);

    }

}

//! ============================================== Signup Page ==============================================

const viewSignUp = (req, res) => {

    res.render("user/userSignUp",{status:"false"});

}

//! =============================================== OTP Page ===============================================

const viewOtp = (req, res) => {

    res.render("user/otpPage");

}

//! =============================================== Send OTP ===============================================

const sendOtp = async (req, res, next) => {

    try {

        req.session.Name = req.body.name;
        req.session.Email = req.body.email;
        req.session.Phone = req.body.phone;
        req.session.Password = req.body.password;
        Email = req.body.email;

        const user = await userModel.findOne({ email : Email });

            if (!user) {

            var mailOptions = {

                from: process.env.EMAIL,
                to: req.body.email,

                    subject: "OTP for Registration is : ",
                    html:
                        "<h3>OTP for Account Verification is : </h3>" +
                        "<h1 style='font-weight:bold;'>" + otp + "</h1>",

            };

            transporter.sendMail(mailOptions, (error, info) => {

                if (error) {

                    return console.log(error);

                }

                res.render("user/otpPage",{status:"false"});

            }); 

            } else {

                res.render("user/userSignUp",{status:"true"});

            }

    } catch (error) {

        console.log(error);
        next(error);

    }

}

//! ============================================== Verify OTP ==============================================

const verifyOtp = async (req, res, next) => {

    try {

        if (req.body.otp == otp) {

            req.session.Password = await bcrypt.hash(req.session.Password, 10);

            let newUser = userModel({

                name: req.session.Name,
                email: req.session.Email,
                phone: req.session.Phone,
                password: req.session.Password,

            });

            newUser.save().then(() => {

                req.session.useremail = req.session.Email;
                req.session.userlogged = true;
                req.session.user = newUser;
                res.redirect("/");

            });

        } else {

            res.render("user/otpPage",{status:"true"});

        }

    } catch (err) {

        console.log(err);
        next(err);

    }

}

//! =============================================== Shop Grid ===============================================

const viewShop = async (req, res, next) => {

    try {

        const currentPage = req.query.page || 1;
        const perPage = 8;

        if (req.session.user) {

            const id = req.session.user._id;
            let cart = await userModel
                .findOne({ _id: id })
                .populate("cart.product_id");
            let wishlist = await userModel
                .findOne({ _id: id })
                .populate("wishlist.product_id");

            const category = await categoryModel.find();
            const productCount = await productModel.count();
            const totalPages = Math.ceil(productCount / perPage);
            const products = await productModel
                .find()
                .populate('category')
                .skip((currentPage - 1) * perPage)
                .limit(perPage);

            const wishId = wishlist.wishlist.map(wishlistItem => wishlistItem.product_id._id);

            res.render('user/shopGrid', {

                page: 'shop',
                cart,
                wishId,
                category,
                products,
                productCount,
                currentPage,
                totalPages,
                user: req.session.user

            });

        } else {

            const category = await categoryModel.find();
            const productCount = await productModel.count();
            const totalPages = Math.ceil(productCount / perPage);
            const products = await productModel
                .find()
                .populate('category')
                .skip((currentPage - 1) * perPage)
                .limit(perPage);

            res.render('user/shopGrid', {

                page: 'shop',
                category,
                products,
                productCount,
                currentPage,
                totalPages,
                user: req.session.user

            });

        }

    } catch (error) {

        next(error);

    }

}


//! ============================================= Single Product =============================================

const productDetail = async (req, res, next) => {

    try {

        if (req.session.user) {

            const userId = req.session.user._id;
            let cart = await userModel
                .findOne({ _id: userId })
                .populate("cart.product_id");
            let wishlist = await userModel
                .findOne({ _id: userId })
                .populate("wishlist.product_id");

            const id = req.params.id;
            const val = req.params.val;
            let category = await categoryModel.find();
            let prod = await productModel.findOne({ _id: id }).populate("category");
            let products = await productModel.find({ category: val });

            const wishId = wishlist.wishlist.map(wishlistItem => wishlistItem.product_id._id);

            res.render("user/productDetails", {

                page: "product",
                cart,
                wishId,
                prod,
                category,
                products,
                user: req.session.user,

            });

        } else{

            const id = req.params.id;
            const val = req.params.val;
            let category = await categoryModel.find();
            let prod = await productModel.findOne({ _id: id }).populate("category");
            let products = await productModel.find({ category: val });

            res.render("user/productDetails", {

                page: "product",
                prod,
                category,
                products,
                user: req.session.user,

            });

        }

    } catch (error) {

        next(error);

    }

}





//! ============================================== User Logout ==============================================

const logoutUser = (req, res, next) => {

    try {

      req.session.destroy();
      res.redirect("/");

    } catch (error) {

      next(error);

    }

}



//! ============================================================================================================

module.exports = {

    viewHome,
    viewSignIn,
    verifySignIn,
    viewSignUp,
    viewOtp,
    sendOtp,
    verifyOtp,
    viewShop,
    productDetail,
    logoutUser

}