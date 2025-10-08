import { Request, Response } from 'express';
import { Phone, Variant } from 'models/product';
import { getAllCategories, getTypeDevices } from 'services/category.service';
import { getAllAccessories, getAllPhones, getPhoneById, getVariantByPhoneId } from 'services/product.service';

const getProductPage = async (req: Request, res: Response) => {
    const categoryFilter = req.query.category as string;
    let phones;
    if (categoryFilter) {
        phones = await Phone.find({ category: categoryFilter }).populate('category').exec();
    } else {
        phones = await getAllPhones();
    }
    const accessories = await getAllAccessories();
    const deviceCategories = await getTypeDevices()
    res.render("admin/product/show.ejs", { phones, accessories, deviceCategories, selectedCategory: categoryFilter });
}

const getCreatePhonePage = async (req: Request, res: Response) => {
    const categories = await getAllCategories()
    res.render("admin/product/create-phone.ejs", {
        categories
    });
}


const getViewPhonePage = async (req: Request, res: Response) => {
    const categories = await getAllCategories();
    const id = req.params.id;
    const phone = await getPhoneById(id);
    const variants = await getVariantByPhoneId(id);
    res.render("admin/product/detail-phone.ejs", {
        phone, categories, variants
    });
};

const postCreatePhone = async (req: Request, res: Response) => {
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

        const phone = new Phone({
            name,
            brand,
            category,
            description,
            specs,
            thumbnail,
            images
        });

        await phone.save();

        res.redirect("/admin/product");
    } catch (error: any) {
        console.error(error);
        res.status(500).send("Error creating phone: " + error.message);
    }
};

const postDeletePhone = async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        await Variant.deleteMany({ id });
        await Phone.deleteOne({ _id: id });
        res.redirect('/admin/product');
    } catch (error) {
        res.status(500).send("Error deleting phone");
    }
};
const postUpdatePhone = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const phone = await Phone.findById(id);
        if (!phone) return res.status(404).send("Phone not found");

        // ---Lấy dữ liệu text từ form ---
        const { name, brand, category, description, discount, specs, variants } = req.body;

        phone.name = name;
        phone.brand = brand;
        phone.category = category;
        phone.description = description;

        // --- Specs ---
        if (specs) {
            phone.specs = {
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
            phone.thumbnail = {
                data: thumb.buffer,
                contentType: thumb.mimetype
            };
        }

        // --- Ảnh mô tả ---
        if (files?.images?.length) {
            // Giữ lại ảnh cũ + thêm ảnh mới
            files.images.forEach(file => {
                phone.images.push({
                    data: file.buffer,
                    contentType: file.mimetype
                });
            });
        }

        // ---Lưu ---
        await phone.save();

        res.redirect("/admin/product");
    } catch (error) {
        console.error("Update phone error:", error);
        res.status(500).send("Error updating phone");
    }
};

const getCreateVariantPage = async (req: Request, res: Response) => {
    const phoneId = req.params.pid;
    const phone = await getPhoneById(phoneId);
    res.render("admin/product/create-variant.ejs", {
        phone
    });
}

const postDeleteVariant = async (req: Request, res: Response) => {
    const id = req.params.id;
    const phoneId = req.params.pid;
    await Variant.deleteOne({ _id: id });
    res.redirect(`/admin/view-phone/${phoneId}`);
};

const postCreateVariant = async (req: Request, res: Response) => {
    const { color, discount, storage, ram, price, stock, model3d, phoneId } = req.body;

    // Tạo variant mới
    const newVariant = new Variant({
        phoneId,
        color,
        discount: discount ? Number(discount) : 0,
        storage,
        ram,
        price,
        stock,
        model3d,
    });

    await newVariant.save();

    res.redirect(`/admin/view-phone/${phoneId}`);
}

const getViewVariantPage = async (req: Request, res: Response) => {
    const id = req.params.id;
    const variant = await Variant.findById(id);
    const phone = await getPhoneById(variant.phoneId.toString());
    res.render("admin/product/detail-variant.ejs", {
        variant, phone
    });
}

const postUpdateVariant = async (req: Request, res: Response) => {
    const { id, pid } = req.params;
    const variant = await Variant.findById(id);
    if (!variant) return res.status(404).send("Variant not found");
    const { color, discount, storage, ram, price, stock, model3d } = req.body;
    await Variant.updateOne({ _id: id }, { color, discount, storage, ram, price, stock, model3d });
    res.redirect(`/admin/view-phone/${pid}`);
}

export {
    getProductPage,
    getCreatePhonePage,
    postCreatePhone,
    postDeletePhone,
    getViewPhonePage,
    postUpdatePhone,
    getCreateVariantPage,
    postDeleteVariant,
    postCreateVariant,
    getViewVariantPage,
    postUpdateVariant

};