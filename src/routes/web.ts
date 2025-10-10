import { getAccessoryPage, getCreateAccessoryPage, getViewAccessoryPage, postCreateAccessory, postDeleteAccessory, postUpdateAccessory } from 'controllers/admin.accessory.controller';
import { getBrandPage, getCreateBrandPage, getViewBrandPage, postCreateBrand, postDeleteBrand, postUpdateBrand } from 'controllers/admin.brand.controller';
import { getCategoryPage, getCreateCategoryPage, getViewCategoryPage, postCreateCategory, postDeleteCategory, postUpdateCategory } from 'controllers/admin.category.controller';
import { getAdminPage } from 'controllers/admin.dashboard.controller';
import { getCreateDevicePage, getCreateVariantPage, getDevicePage, getViewDevicePage, getViewVariantPage, postCreateDevice, postCreateVariant, postDeleteDevice, postDeleteVariant, postUpdateDevice, postUpdateVariant } from 'controllers/admin.device.controller';
import { getUserPage, getCreateUserPage, postCreateUser, postDeleteUser, getViewUserPage, postUpdateUser } from 'controllers/admin.user.controller';
import { getHomePage } from 'controllers/user.controller';
import express, { Express } from 'express';
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
    router.post("/admin/update-variant/:id/:deviceId", postUpdateVariant)

    router.get('/admin/brand', getBrandPage);
    router.get('/admin/create-brand', getCreateBrandPage);
    router.post('/admin/create-brand', fileUploadMiddleware.single("logo"), postCreateBrand);
    router.get('/admin/view-brand/:id', getViewBrandPage);
    router.post('/admin/update-brand', fileUploadMiddleware.single("logo"), postUpdateBrand);
    router.post('/admin/delete-brand/:id', postDeleteBrand);





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

    // Handle 404 Not Found
    app.use((req, res, next) => {
        res.status(404).render('404.ejs');
    });
}

export default webRoutes;
