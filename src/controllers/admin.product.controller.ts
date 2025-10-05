import { Request, Response } from 'express';
import { Phone } from 'models/product';
import { getAllCategories } from 'services/category.service';
import { getAllAccessories, getAllPhones, getPhoneById } from 'services/product.service';

const getProductPage = async (req: Request, res: Response) => {
    const phones = await getAllPhones();
    const accessories = await getAllAccessories();
    res.render("admin/product/show.ejs", { phones, accessories });
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
    res.render("admin/product/detail-phone.ejs", {
        phone, categories
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

        const { name, brand, category, description, discount, specs, variants } = req.body;

        const phone = new Phone({
            name,
            brand,
            category,
            description,
            discount: discount ? Number(discount) : 0,
            specs,
            variants,
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
        phone.discount = Number(discount) || 0;

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

        // --- Variants ---
        if (variants) {
            const variantArr = Array.isArray(variants)
                ? variants
                : Object.values(variants);

            phone.variants.splice(
                0,
                phone.variants.length,
                ...variantArr.map((v: any) => ({
                    color: v.color,
                    model3d: v.model3d,
                    storage: v.storage,
                    ram: v.ram,
                    price: Number(v.price) || 0,
                    stock: Number(v.stock) || 0
                }))
            );

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

export { getProductPage, getCreatePhonePage, postCreatePhone, postDeletePhone, getViewPhonePage, postUpdatePhone };