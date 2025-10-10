import { Request, Response } from 'express';
import { Brand } from 'models/brand';

const getBrandPage = async (req: Request, res: Response) => {
    const brands = await Brand.find({});
    res.render("admin/brand/show.ejs", { brands });
}

const getCreateBrandPage = (req: Request, res: Response) => {
    res.render("admin/brand/create-brand.ejs");
}

const postCreateBrand = async (req: Request, res: Response) => {
    try {
        const { name, description } = req.body;
        let logo: any = null;
        // Chỉ xử lý logo nếu có file được tải lên
        if (req.file) {
            logo = {
                data: req.file.buffer,
                contentType: req.file.mimetype
            };
        }
        const newBrand = new Brand({ name, description, logo });
        await newBrand.save();
        res.redirect('/admin/brand');
    } catch (error) {
        console.error(error);
        res.status(500).send("Error creating brand");
    }
}

const getViewBrandPage = async (req: Request, res: Response) => {
    try {
        const brand = await Brand.findById(req.params.id);
        if (!brand) {
            return res.status(404).render('404.ejs');
        }
        res.render('admin/brand/detail-brand.ejs', { brand });
    } catch (error) {
        console.error(error);
        res.status(500).send("Error getting brand detail page");
    }
};
const postUpdateBrand = async (req: Request, res: Response) => {
    try {
        const { id, name, description } = req.body;
        const brand = await Brand.findById(id);
        if (!brand) {
            return res.status(404).send("Brand not found");
        }

        brand.name = name;
        brand.description = description;

        // Chỉ cập nhật logo nếu có file mới được tải lên
        if (req.file) {
            brand.logo = {
                data: req.file.buffer,
                contentType: req.file.mimetype
            };
        }

        await brand.save();
        res.redirect('/admin/brand');
    } catch (error) {
        console.error(error);
        res.status(500).send("Error updating brand");
    }
}

const postDeleteBrand = async (req: Request, res: Response) => {
    try {
        const brandId = req.params.id;
        await Brand.deleteOne({ _id: brandId });
        res.redirect('/admin/brand');
    } catch (error) {
        res.status(500).send("Error deleting brand");
    }
}

export { getBrandPage, getCreateBrandPage, postCreateBrand, getViewBrandPage, postUpdateBrand, postDeleteBrand };