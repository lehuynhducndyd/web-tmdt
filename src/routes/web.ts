import { getAccessoryPage, getCreateAccessoryPage, getCreateVariantAccPage, getViewAccessoryPage, postCreateAccessory, postCreateVariantAcc, postDeleteAccessory, postUpdateAccessory, getViewVariantAccPage, postUpdateVariantAcc, postDeleteVariantAcc } from 'controllers/admin/admin.accessory.controller';
import { getBrandPage, getCreateBrandPage, getViewBrandPage, postCreateBrand, postDeleteBrand, postUpdateBrand } from 'controllers/admin/admin.brand.controller';
import { getCategoryPage, getCreateCategoryPage, getViewCategoryPage, postCreateCategory, postDeleteCategory, postUpdateCategory } from 'controllers/admin/admin.category.controller';
import { getAdminPage } from 'controllers/admin/admin.dashboard.controller';
import { getCreateDevicePage, getCreateVariantPage, getDevicePage, getViewDevicePage, getViewVariantPage, postCreateDevice, postCreateVariant, postDeleteDevice, postDeleteVariant, postUpdateDevice, postUpdateVariant, } from 'controllers/admin/admin.device.controller';
import { getUserPage, getCreateUserPage, postCreateUser, postDeleteUser, getViewUserPage, postUpdateUser, } from 'controllers/admin/admin.user.controller';
import { getLoginPage, getRegisterPage, getSuccessRedirectPage, postLogout, postRegisterPage } from 'controllers/client/auth.controller';
import { getCartPage, getHomePage, getUserInfoPage, postAddProductToCart, postDeleteCartItem, postUpdateUserInfo } from 'controllers/client/user.controller';
import express, { Express } from 'express';
import passport from 'passport';
import { isAdmin, isLogin } from 'src/middleware/auth';
import { fileUploadMiddleware } from 'src/middleware/multer';
import { getShopPage } from 'controllers/client/user.controller';
import { getShopDetailPage, postCreateReview } from 'controllers/client/user.controller';
import { getProductReviewPage, postDeleteReview } from 'controllers/admin/admin.review.controller';
import { getOrderPage, getOrderDetailPage, postUpdateOrderStatus } from 'controllers/admin/admin.order.controller';
import { get } from 'http';
import { getCheckoutPage, getDetailHistoryPage, getHistoryPage, postPlaceOrder, postUpdateCartAndCheckout } from 'controllers/client/user.order.controller';
// import { getCartPage } from 'controllers/client/user.controller';
const router = express.Router();


const webRoutes = (app: Express) => {

    // Shop routes
    router.get('/shop', getShopPage);
    router.get('/shop-detail/:id', getShopDetailPage);
    router.post('/shop-detail/:id/reviews', postCreateReview);
    router.get('/cart', getCartPage);

    router.get('/user-info', getUserInfoPage);
    router.post('/user-info', postUpdateUserInfo);

    router.post("/add-product-to-cart", postAddProductToCart);
    router.post("/delete-cart-item/:variantId", postDeleteCartItem);
    router.post("/update-and-checkout", postUpdateCartAndCheckout)
    router.get('/checkout', getCheckoutPage)
    router.post('/place-order', postPlaceOrder)
    router.get('/history', getHistoryPage);
    router.get('/history-detail/:id', getDetailHistoryPage);





    //system 
    router.get('/', getHomePage);
    router.get("/success-redirect", getSuccessRedirectPage);
    router.get('/login', isLogin, getLoginPage);
    router.post('/login', passport.authenticate('local', {
        successRedirect: '/success-redirect',
        failureRedirect: '/login',
        failureMessage: true
    }));
    router.get('/register', getRegisterPage);
    router.post('/register', isLogin, postRegisterPage);
    router.post('/logout', postLogout);

    router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

    router.get('/auth/google/callback',
        passport.authenticate('google', { failureRedirect: '/login' }),
        function (req, res) {
            // Successful authentication, redirect home.
            res.redirect('/');
        });


    // Admin routes
    router.get('/admin', getAdminPage);

    router.get('/admin/user', getUserPage);
    router.get('/admin/create-user', getCreateUserPage);
    router.post('/admin/create-user', postCreateUser);
    router.post('/admin/delete-user/:id', postDeleteUser);
    router.get('/admin/view-user/:id', getViewUserPage);
    router.post('/admin/update-user', postUpdateUser);

    router.get('/admin/category', getCategoryPage);
    router.get('/admin/create-category', getCreateCategoryPage);
    router.post('/admin/create-category', postCreateCategory);
    router.post('/admin/delete-category/:id', postDeleteCategory);
    router.get('/admin/view-category/:id', getViewCategoryPage);
    router.post('/admin/update-category', postUpdateCategory);

    router.get('/admin/device', getDevicePage);
    router.get('/admin/accessory', getAccessoryPage);

    router.get('/admin/create-device', getCreateDevicePage);
    router.post("/admin/create-device", fileUploadMiddleware.fields([
        { name: "thumbnail", maxCount: 1 },
        { name: "images", maxCount: 10 }
    ]), postCreateDevice);
    router.post('/admin/delete-device/:id', postDeleteDevice);
    router.get("/admin/view-device/:id", getViewDevicePage);
    router.post("/admin/update-device/:id", fileUploadMiddleware.fields([
        { name: "thumbnail", maxCount: 1 },
        { name: "images", maxCount: 10 }
    ]), postUpdateDevice);
    router.get('/admin/create-accessory', getCreateAccessoryPage);
    router.post("/admin/create-accessory", fileUploadMiddleware.fields([
        { name: "thumbnail", maxCount: 1 },
        { name: "images", maxCount: 10 }
    ]), postCreateAccessory);
    router.get('/admin/view-accessory/:id', getViewAccessoryPage);
    router.post('/admin/update-accessory/:id', fileUploadMiddleware.fields([
        { name: "thumbnail", maxCount: 1 },
        { name: "images", maxCount: 10 }
    ]), postUpdateAccessory);
    router.post('/admin/delete-accessory/:id', postDeleteAccessory);
    router.get("/admin/create-variant/:deviceId", getCreateVariantPage);
    router.post("/admin/create-variant", postCreateVariant);
    router.post("/admin/delete-variant/:id/:deviceId", postDeleteVariant);
    router.get("/admin/view-variant/:id", getViewVariantPage);
    router.post("/admin/update-variant/:id/:deviceId", postUpdateVariant);
    router.get('/admin/create-variant-acc/:accId', getCreateVariantAccPage);
    router.post('/admin/create-variant-acc', postCreateVariantAcc);
    router.get('/admin/view-variant-acc/:id', getViewVariantAccPage);
    router.post('/admin/update-variant-acc/:id/:accId', postUpdateVariantAcc);
    router.post('/admin/delete-variant-acc/:id/:accId', postDeleteVariantAcc);


    router.get('/admin/brand', getBrandPage);
    router.get('/admin/create-brand', getCreateBrandPage);
    router.post('/admin/create-brand', fileUploadMiddleware.single("logo"), postCreateBrand);
    router.get('/admin/view-brand/:id', getViewBrandPage);
    router.post('/admin/update-brand', fileUploadMiddleware.single("logo"), postUpdateBrand);
    router.post('/admin/delete-brand/:id', postDeleteBrand);

    router.get("/admin/review/:id", getProductReviewPage);
    router.post("/admin/delete-review/:pid/:id", postDeleteReview);


    router.get('/admin/order', getOrderPage)
    router.get('/admin/order/:id', getOrderDetailPage);
    router.post('/admin/order/:id/update-status', postUpdateOrderStatus);



    app.use('/', isAdmin, router);
}

export default webRoutes;
