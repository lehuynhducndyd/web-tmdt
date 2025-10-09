import { Request, Response } from 'express';
import { Accessory } from 'models/product';
import { getTypeAccessories } from 'services/category.service';
import { getAccessoryById } from 'services/product.service';

const getCreateAccessoryPage = async (req: Request, res: Response) => {
    try {
        const categories = await getTypeAccessories();
        res.render("admin/product/create-accessory.ejs", {
            categories
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

        const { name, brand, category, description, price, stock, discount } = req.body;

        const accessory = new Accessory({
            name, brand, category, description, price, stock, discount, thumbnail, images
        });

        await accessory.save();

        res.redirect("/admin/product");
    } catch (error: any) {
        console.error(error);
        res.status(500).send("Error creating accessory: " + error.message);
    }
};

const getViewAccessoryPage = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const accessory = await getAccessoryById(id);
        const categories = await getTypeAccessories();
        if (!accessory) {
            return res.status(404).render('404.ejs');
        }
        res.render("admin/product/detail-accessory.ejs", { accessory, categories });
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

        const { name, brand, category, description, price, stock, discount } = req.body;
        accessory.name = name;
        accessory.brand = brand;
        accessory.category = category;
        accessory.description = description;
        accessory.price = price;
        accessory.stock = stock;
        accessory.discount = discount;

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
        res.redirect("/admin/product");
    } catch (error) {
        console.error("Update accessory error:", error);
        res.status(500).send("Error updating accessory");
    }
};

const postDeleteAccessory = async (req: Request, res: Response) => {
    try {
        await Accessory.deleteOne({ _id: req.params.id });
        res.redirect('/admin/product');
    } catch (error) {
        res.status(500).send("Error deleting accessory");
    }
};

export {
    getCreateAccessoryPage,
    postCreateAccessory,
    getViewAccessoryPage,
    postUpdateAccessory,
    postDeleteAccessory
};