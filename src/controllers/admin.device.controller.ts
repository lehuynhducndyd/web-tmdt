import { Request, Response } from 'express';
import { Device, Variant } from 'models/product';
import { getAllCategories, getTypeDevices } from 'services/category.service';
import { getAllAccessories, getAllDevices, getDeviceById, getVariantByDeviceId } from 'services/product.service';

const getProductPage = async (req: Request, res: Response) => {
    const categoryFilter = req.query.category as string;
    let devices;
    if (categoryFilter) {
        devices = await Device.find({ category: categoryFilter }).populate('category').exec();
    } else {
        devices = await getAllDevices();
    }
    const accessories = await getAllAccessories();
    const deviceCategories = await getTypeDevices()
    res.render("admin/product/show.ejs", { devices, accessories, deviceCategories, selectedCategory: categoryFilter });
}

const getCreateDevicePage = async (req: Request, res: Response) => {
    const categories = await getAllCategories()
    res.render("admin/product/create-device.ejs", {
        categories
    });
}


const getViewDevicePage = async (req: Request, res: Response) => {
    const categories = await getAllCategories();
    const id = req.params.id;
    const device = await getDeviceById(id);
    const variants = await getVariantByDeviceId(id);
    res.render("admin/product/detail-device.ejs", {
        device, categories, variants
    });
};

const postCreateDevice = async (req: Request, res: Response) => {
    try {
        let thumbnail: any = null;
        if (req.files && (req.files as any).thumbnail) {
            const file = (req.files as any).thumbnail[0];
            thumbnail = {
                data: file.buffer,
                contentType: file.mimetype
            };
        }

        let images: any[] = [];
        if (req.files && (req.files as any).images) {
            images = (req.files as any).images.map((file: Express.Multer.File) => ({
                data: file.buffer,
                contentType: file.mimetype
            }));
        }

        const { name, brand, category, description, specs } = req.body;

        const device = new Device({
            name,
            brand,
            category,
            description,
            specs,
            thumbnail,
            images
        });

        await device.save();

        res.redirect("/admin/product");
    } catch (error: any) {
        console.error(error);
        res.status(500).send("Error creating device: " + error.message);
    }
};

const postDeleteDevice = async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        await Variant.deleteMany({ deviceId: id });
        await Device.deleteOne({ _id: id });
        res.redirect('/admin/product');
    } catch (error) {
        res.status(500).send("Error deleting device");
    }
};
const postUpdateDevice = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const device = await Device.findById(id);
        if (!device) return res.status(404).send("Device not found");

        // ---Lấy dữ liệu text từ form ---
        const { name, brand, category, description, discount, specs, variants } = req.body;

        device.name = name;
        device.brand = brand;
        device.category = category;
        device.description = description;

        // --- Specs ---
        if (specs) {
            device.specs = {
                screen: specs.screen || "",
                cpu: specs.cpu || "",
                battery: specs.battery || "",
                camera: specs.camera || "",
                os: specs.os || ""
            };
        }

        // ---Thumbnail ---
        const files = req.files as { [fieldname: string]: Express.Multer.File[] };
        if (files?.thumbnail?.[0]) {
            const thumb = files.thumbnail[0];
            device.thumbnail = {
                data: thumb.buffer,
                contentType: thumb.mimetype
            };
        }

        // --- Ảnh mô tả ---
        if (files?.images?.length) {
            // Giữ lại ảnh cũ + thêm ảnh mới
            files.images.forEach(file => {
                device.images.push({
                    data: file.buffer,
                    contentType: file.mimetype
                });
            });
        }

        // ---Lưu ---
        await device.save();

        res.redirect("/admin/product");
    } catch (error) {
        console.error("Update device error:", error);
        res.status(500).send("Error updating device");
    }
};

const getCreateVariantPage = async (req: Request, res: Response) => {
    const deviceId = req.params.deviceId;
    const device = await getDeviceById(deviceId);
    res.render("admin/product/create-variant.ejs", {
        device
    });
}

const postDeleteVariant = async (req: Request, res: Response) => {
    const id = req.params.id;
    const deviceId = req.params.deviceId;
    await Variant.deleteOne({ _id: id });
    res.redirect(`/admin/view-device/${deviceId}`);
};

const postCreateVariant = async (req: Request, res: Response) => {
    const { color, discount, storage, ram, price, stock, model3d, deviceId } = req.body;

    // Tạo variant mới
    const newVariant = new Variant({
        deviceId,
        color,
        discount: discount ? Number(discount) : 0,
        storage,
        ram,
        price,
        stock,
        model3d,
    });

    await newVariant.save();

    res.redirect(`/admin/view-device/${deviceId}`);
}

const getViewVariantPage = async (req: Request, res: Response) => {
    const id = req.params.id;
    const variant = await Variant.findById(id);
    const device = await getDeviceById(variant.deviceId.toString());
    res.render("admin/product/detail-variant.ejs", {
        variant, device
    });
}

const postUpdateVariant = async (req: Request, res: Response) => {
    const { id, deviceId } = req.params;
    const variant = await Variant.findById(id);
    if (!variant) return res.status(404).send("Variant not found");
    const { color, discount, storage, ram, price, stock, model3d } = req.body;
    await Variant.updateOne({ _id: id }, { color, discount, storage, ram, price, stock, model3d });
    res.redirect(`/admin/view-device/${deviceId}`);
}

export {
    getProductPage,
    getCreateDevicePage,
    postCreateDevice,
    postDeleteDevice,
    getViewDevicePage,
    postUpdateDevice,
    getCreateVariantPage,
    postDeleteVariant,
    postCreateVariant,
    getViewVariantPage,
    postUpdateVariant

};