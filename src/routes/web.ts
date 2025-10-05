import { getCategoryPage, getCreateCategoryPage, getViewCategoryPage, postCreateCategory, postDeleteCategory, postUpdateCategory } from 'controllers/admin.category.controller';
import { getAdminPage } from 'controllers/admin.dashboard.controller';
import { getCreatePhonePage, getProductPage, getViewPhonePage, postCreatePhone, postDeletePhone, postUpdatePhone } from 'controllers/admin.product.controller';
import { getUserPage, getCreateUserPage, postCreateUser, postDeleteUser, getViewUserPage, postUpdateUser } from 'controllers/admin.user.controller';
import { getHomePage } from 'controllers/user.controller';
import express, { Express } from 'express';
import { get } from 'http';
import { fileUploadMiddleware } from 'src/middleware/multer';
const router = express.Router();


const webRoutes = (app: Express) => {

    // User routes
    router.get('/test', getHomePage);
    // Admin routes
    router.get('/', getAdminPage);
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

    router.get('/admin/product', getProductPage);
    router.get('/admin/create-phone', getCreatePhonePage);
    router.post("/admin/create-phone", fileUploadMiddleware.fields([
        { name: "thumbnail", maxCount: 1 },
        { name: "images", maxCount: 10 }
    ]), postCreatePhone);
    router.post('/admin/delete-phone/:id', postDeletePhone);
    router.get("/admin/view-phone/:id", getViewPhonePage);
    router.post("/admin/update-phone/:id", fileUploadMiddleware.fields([
        { name: "thumbnail", maxCount: 1 },
        { name: "images", maxCount: 10 }
    ]), postUpdatePhone);

    // other
    // router.get("/create-user", getCreateUserPage);
    // router.post("/create-user", fileUploadMiddleware("avatar"), postCreateUser);
    // router.get("/update-user/:id", getUpdateUserPage);
    // router.post("/update-user", fileUploadMiddleware("avatar"), postUpdateUser);
    // router.post("/delete-user/:id", deleteUser);
    // router.get("/user/:id/avatar", async (req, res) => {
    //     try {
    //         const kitty = await User.findById(req.params.id);
    //         if (!kitty || !kitty.avatar) return res.status(404).send("No avatar found");

    //         res.set("Content-Type", kitty.avatarType);
    //         res.send(kitty.avatar);
    //     } catch (err) {
    //         res.status(500).send("Error fetching avatar");
    //     }
    // });

    app.use('/', router);
}

export default webRoutes;

