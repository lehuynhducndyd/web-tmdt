import { Request, Response } from 'express';
import { get } from 'http';
import { Brand } from 'models/brand';
import Cart from 'models/cart';
import { AccessoriesVariant, Accessory } from 'models/product';
import { getTypeAccessories } from 'services/admin/category.service';
import { getAccessoryById, getAllAccessories } from 'services/admin/product.service';

const getAccessoryPage = async (req: Request, res: Response) => {
    const categoryFilter = req.query.category as string;
    let accessories;
    if (categoryFilter) {
        accessories = await Accessory.find({ category: categoryFilter }).populate('category').exec();
    } else {
        accessories = await getAllAccessories();
    }
    const accessoryCategories = await getTypeAccessories()
    res.render("admin/product/show-accessory.ejs", { accessories, accessoryCategories, selectedCategory: categoryFilter });
}

const getCreateAccessoryPage = async (req: Request, res: Response) => {
    try {
        const brands = await Brand.find({});
        const categories = await getTypeAccessories();
        res.render("admin/product/create-accessory.ejs", {
            categories, brands
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Error getting create accessory page");
    }
}

const postCreateAccessory = async (req: Request, res: Response) => {
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

        const { name, brand, category, description, } = req.body;

        const accessory = new Accessory({
            name, brand, category, description, thumbnail, images
        });

        await accessory.save();

        res.redirect("/admin/accessory");
    } catch (error: any) {
        console.error(error);
        res.status(500).send("Error creating accessory: " + error.message);
    }
};

const getViewAccessoryPage = async (req: Request, res: Response) => {
    try {
        const brands = await Brand.find({});
        const { id } = req.params;
        const accessory = await getAccessoryById(id);
        const categories = await getTypeAccessories();
        const variants = await AccessoriesVariant.find({ accessoryId: id });
        if (!accessory) {
            return res.status(404).render('404.ejs');
        }
        res.render("admin/product/detail-accessory.ejs", { accessory, categories, brands, variants });
    } catch (error) {
        console.error(error);
        res.status(500).send("Error getting accessory detail page");
    }
};

const postUpdateAccessory = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const accessory = await Accessory.findById(id);
        if (!accessory) return res.status(404).send("Accessory not found");

        const { name, brand, category, description } = req.body;
        accessory.name = name;
        accessory.brand = brand;
        accessory.category = category;
        accessory.description = description;

        const files = req.files as { [fieldname: string]: Express.Multer.File[] };
        if (files?.thumbnail?.[0]) {
            const thumb = files.thumbnail[0];
            accessory.thumbnail = { data: thumb.buffer, contentType: thumb.mimetype };
        }

        if (files?.images?.length) {
            accessory.images.push(...files.images.map(file => ({
                data: file.buffer,
                contentType: file.mimetype
            })));
        }

        await accessory.save();
        res.redirect("/admin/accessory");
    } catch (error) {
        console.error("Update accessory error:", error);
        res.status(500).send("Error updating accessory");
    }
};

const postDeleteAccessory = async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        // Xóa các sản phẩm liên quan trong tất cả các giỏ hàng
        await Cart.updateMany(
            { 'items.product': id },
            { $pull: { items: { product: id } } }
        );
        // Xóa tất cả các biến thể của phụ kiện này
        await AccessoriesVariant.deleteMany({ accessoryId: id });
        await Accessory.deleteOne({ _id: id });
        res.redirect('/admin/accessory');
    } catch (error) {
        res.status(500).send("Error deleting accessory");
    }
};

const getCreateVariantAccPage = async (req: Request, res: Response) => {
    const accessoryId = req.params.accId;
    const accessory = await getAccessoryById(accessoryId);
    res.render("admin/product/create-variant-acc.ejs", {
        accessory
    });
}

const postCreateVariantAcc = async (req: Request, res: Response) => {
    try {
        const { color, price, stock, discount, accessoryId } = req.body;

        const newVariant = new AccessoriesVariant({
            accessoryId,
            color,
            price: Number(price),
            stock: Number(stock),
            discount: discount ? Number(discount) : 0,
        });

        await newVariant.save();

        res.redirect(`/admin/view-accessory/${accessoryId}`);
    } catch (error) {
        console.error("Error creating accessory variant:", error);
        res.status(500).send("Error creating accessory variant");
    }
}

const getViewVariantAccPage = async (req: Request, res: Response) => {
    try {
        const variant = await AccessoriesVariant.findById(req.params.id);
        if (!variant) {
            return res.status(404).render('404.ejs');
        }
        const accessory = await getAccessoryById(variant.accessoryId.toString());
        res.render("admin/product/detail-variant-acc.ejs", { variant, accessory });
    } catch (error) {
        console.error("Error getting accessory variant detail page:", error);
        res.status(500).send("Error getting accessory variant detail page");
    }
}

const postUpdateVariantAcc = async (req: Request, res: Response) => {
    const { id, accId } = req.params;
    const { color, price, stock, discount } = req.body;
    await AccessoriesVariant.updateOne({ _id: id }, { color, price: Number(price), stock: Number(stock), discount: Number(discount) });
    res.redirect(`/admin/view-accessory/${accId}`);
}

const postDeleteVariantAcc = async (req: Request, res: Response) => {
    const { id, accId } = req.params;
    // Xóa các biến thể liên quan trong tất cả các giỏ hàng
    await Cart.updateMany(
        { 'items.variantId': id },
        { $pull: { items: { variantId: id } } }
    );
    await AccessoriesVariant.deleteOne({ _id: id });
    res.redirect(`/admin/view-accessory/${accId}`);
};

export {
    getCreateAccessoryPage,
    postCreateAccessory,
    getViewAccessoryPage,
    postUpdateAccessory,
    postDeleteAccessory,
    getAccessoryPage,
    getCreateVariantAccPage,
    postCreateVariantAcc,
    getViewVariantAccPage,
    postUpdateVariantAcc,
    postDeleteVariantAcc,
};